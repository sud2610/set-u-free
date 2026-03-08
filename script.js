// ============================================
// WHEEL CONFIGURATIONS
// ============================================
const WHEEL_DEFINITIONS = {
    'european': {
        wheel: [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26],
        zeros: [0]
    },
    'american': {
        wheel: [0, '00', 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26],
        zeros: [0, '00']
    },
    'triple-zero': {
        wheel: [0, '00', '000', 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26],
        zeros: [0, '00', '000']
    }
};

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

function getWheelConfiguration(tableType) {
    const def = WHEEL_DEFINITIONS[tableType] || WHEEL_DEFINITIONS['triple-zero'];
    return {
        wheel: def.wheel,
        red: RED_NUMBERS,
        black: BLACK_NUMBERS,
        green: def.zeros
    };
}

// ============================================
// APPLICATION STATE & LOGIC
// ============================================
const app = {
    spins: [],
    predictions: [],
    clusterScore: 0,
    tableStatus: null,
    frequency: {},
    currentTableType: 'triple-zero',
    wheelConfig: getWheelConfiguration('triple-zero'),

    changeTableType(tableType) {
        this.currentTableType = tableType;
        this.wheelConfig = getWheelConfiguration(tableType);
        this.spins = [];
        this.predictions = [];
        this.clusterScore = 0;
        this.tableStatus = null;
        this.initFrequency();
        this.initializeGrid();
        this.render();
    },

    initFrequency() {
        this.frequency = {};
        this.wheelConfig.wheel.forEach(num => {
            this.frequency[num] = 0;
        });
    },

    getNumberColor(num) {
        const numStr = String(num);
        const zeroStrs = this.wheelConfig.green.map(z => String(z));
        if (zeroStrs.includes(numStr)) return 'green';
        if (this.wheelConfig.red.includes(parseInt(numStr))) return 'red';
        return 'black';
    },

    addSpin(number) {
        if (this.spins.length >= 20) {
            const removed = this.spins.shift();
            this.frequency[removed]--;
        }
        this.spins.push(number);
        this.frequency[number]++;
        this.detectCluster();
        this.render();
    },

    undo() {
        if (this.spins.length > 0) {
            const removed = this.spins.pop();
            this.frequency[removed]--;
            this.predictions = [];
            this.clusterScore = 0;
            this.tableStatus = null;
            this.detectCluster();
            this.render();
        }
    },

    clear() {
        if (this.spins.length > 0) {
            this.spins = [];
            this.predictions = [];
            this.clusterScore = 0;
            this.tableStatus = null;
            this.initFrequency();
            this.render();
        }
    },

    detectCluster() {
        if (this.spins.length < 5) {
            this.clusterScore = 0;
            this.tableStatus = null;
            return;
        }

        const recentSpins = this.spins.slice(Math.max(0, this.spins.length - 10));
        const indexes = recentSpins.map(n => this.wheelConfig.wheel.indexOf(n));

        let bestCluster = 0;

        for (let i = 0; i < this.wheelConfig.wheel.length; i++) {
            let count = 0;
            for (let idx of indexes) {
                const dist = Math.min(
                    Math.abs(i - idx),
                    this.wheelConfig.wheel.length - Math.abs(i - idx)
                );
                if (dist <= 2) count++;
            }
            bestCluster = Math.max(bestCluster, count);
        }

        this.clusterScore = Math.round((bestCluster / this.spins.length) * 10);

        if (this.clusterScore >= 8) {
            this.tableStatus = { label: '💎 STRONG TABLE', class: 'status-strong', desc: 'Excellent clustering detected' };
            this.generatePredictions(indexes);
        } else if (this.clusterScore >= 6) {
            this.tableStatus = { label: '✓ GOOD TABLE', class: 'status-good', desc: 'Sector clustering detected' };
            this.generatePredictions(indexes);
        } else if (this.clusterScore >= 4) {
            this.tableStatus = { label: '~ WEAK CLUSTER', class: 'status-weak', desc: 'Weak clustering pattern' };
            this.predictions = [];
        } else {
            this.tableStatus = { label: '✗ RANDOM TABLE', class: 'status-random', desc: 'No clear pattern' };
            this.predictions = [];
        }
    },

    generatePredictions(indexes) {
        if (this.clusterScore < 6) {
            this.predictions = [];
            return;
        }

        let sectorScore = [];
        for (let i = 0; i < this.wheelConfig.wheel.length; i++) {
            let score = 0;
            for (let idx of indexes) {
                const dist = Math.min(
                    Math.abs(i - idx),
                    this.wheelConfig.wheel.length - Math.abs(i - idx)
                );
                if (dist <= 2) score++;
            }
            sectorScore.push({ pos: i, score });
        }

        sectorScore.sort((a, b) => b.score - a.score);

        this.predictions = [];
        for (let k = 0; k < 3 && k < sectorScore.length; k++) {
            const pos = sectorScore[k].pos;
            const sector = [];
            for (let i = -2; i <= 2; i++) {
                const index = (pos + i + this.wheelConfig.wheel.length) % this.wheelConfig.wheel.length;
                sector.push(this.wheelConfig.wheel[index]);
            }
            this.predictions.push({
                rank: k + 1,
                sector: sector,
                confidence: Math.round((sectorScore[k].score / this.spins.length) * 100)
            });
        }
    },

    initializeGrid() {
        const grid = document.getElementById('numbersGrid');
        grid.innerHTML = '';

        this.wheelConfig.wheel.forEach(num => {
            const btn = document.createElement('button');
            btn.className = `number-btn ${this.getNumberColor(num)}`;
            btn.textContent = num;
            btn.onclick = () => this.addSpin(num);
            grid.appendChild(btn);
        });
    },

    render() {
        this.renderSpinHistory();
        this.renderScore();
        this.renderPredictions();
        this.renderHeatmap();
    },

    renderSpinHistory() {
        const container = document.getElementById('chipsContainer');
        container.innerHTML = '';
        document.getElementById('spinCount').textContent = this.spins.length;

        if (this.spins.length === 0) {
            container.innerHTML = '<span class="empty-state">Click numbers to enter spins</span>';
            return;
        }

        this.spins.forEach(spin => {
            const chip = document.createElement('div');
            chip.className = `chip ${this.getNumberColor(spin)}`;
            chip.textContent = spin;
            container.appendChild(chip);
        });
    },

    renderScore() {
        document.getElementById('scoreDisplay').textContent = this.clusterScore;

        if (!this.tableStatus) {
            document.getElementById('statusLabel').textContent = 'ENTER SPINS';
            document.getElementById('statusLabel').className = 'status-label';
            document.getElementById('statusBarFill').style.width = '0%';
            return;
        }

        document.getElementById('statusLabel').textContent = this.tableStatus.label;
        document.getElementById('statusLabel').className = `status-label ${this.tableStatus.class}`;
        document.getElementById('statusBarFill').style.width = (this.clusterScore * 10) + '%';
    },

    renderPredictions() {
        const section = document.getElementById('predictionsSection');

        if (this.predictions.length === 0) {
            section.innerHTML = '';
            return;
        }

        let html = '';
        this.predictions.forEach(pred => {
            html += `
                <div class="prediction-card">
                    <div class="prediction-header">
                        <div class="prediction-rank">🎯 Sector #${pred.rank}</div>
                        <div class="prediction-confidence">${pred.confidence}% Confidence</div>
                    </div>
                    <div class="sector-numbers">
                        ${pred.sector.map(num => `<div class="sector-chip">${num}</div>`).join('')}
                    </div>
                    <div class="wheel-visual">
                        ${this.renderWheelStrip(pred.sector)}
                    </div>
                </div>
            `;
        });

        section.innerHTML = html;
    },

    renderWheelStrip(sectorNumbers) {
        let html = '<div class="wheel-strip">';

        this.wheelConfig.wheel.forEach(num => {
            const color = this.getNumberColor(num);
            const isPredicted = sectorNumbers.includes(num);
            const isHistoric = this.spins.includes(num);

            let bgColor = '#2c3e50';
            if (color === 'red') bgColor = '#e74c3c';
            else if (color === 'green') bgColor = '#00ff41';

            const classes = isPredicted ? 'predicted' : (isHistoric ? 'historic' : '');
            const opacity = isPredicted ? 1 : (isHistoric ? 0.6 : 0.3);

            html += `<div class="wheel-segment ${classes}" style="background: ${bgColor}; opacity: ${opacity};"></div>`;
        });

        html += '</div>';
        return html;
    },

    renderHeatmap() {
        const maxFreq = Math.max(1, ...Object.values(this.frequency));
        const subset = [1, 5, 9, 13, 17, 21, 25, 29, 33, 36];

        const grid = document.getElementById('heatmapGrid');
        grid.innerHTML = '';

        subset.forEach(num => {
            const freq = this.frequency[num] || 0;
            const intensity = freq / maxFreq;
            const color = this.getNumberColor(num);

            const cell = document.createElement('div');
            cell.className = `heatmap-cell ${intensity > 0.4 ? 'hot' : ''}`;
            cell.textContent = num;

            let bgColor = '#2c3e50';
            if (color === 'red') bgColor = `rgba(231, 76, 60, ${0.3 + intensity * 0.6})`;
            else if (color === 'green') bgColor = `rgba(0, 255, 65, ${0.3 + intensity * 0.6})`;
            else bgColor = `rgba(52, 73, 94, ${0.3 + intensity * 0.6})`;

            cell.style.background = bgColor;
            cell.style.color = freq > 0 ? '#fff' : 'rgba(255,255,255,0.3)';
            cell.style.fontWeight = freq > 0 ? '700' : '600';

            grid.appendChild(cell);
        });

        const heatmapSection = document.getElementById('heatmapSection');
        if (this.spins.length > 0) {
            heatmapSection.classList.add('show');
        } else {
            heatmapSection.classList.remove('show');
        }
    }
};

// ============================================
// INITIALIZE APPLICATION
// ============================================
function initialize() {
    app.initFrequency();
    app.initializeGrid();
    app.render();
    document.getElementById('tableTypeSelector').value = 'triple-zero';
}

initialize();
