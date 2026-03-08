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

// FIX: Normalise all wheel values to strings for consistent type handling.
// This eliminates the int/string mixing that caused fragile comparisons
// (e.g. parseInt('00') === NaN, which silently broke color lookups).
function normaliseWheel(def) {
    return {
        wheel: def.wheel.map(String),
        zeros: def.zeros.map(String)
    };
}

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].map(String));
const BLACK_NUMBERS = new Set([2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35].map(String));

function getWheelConfiguration(tableType) {
    const raw = WHEEL_DEFINITIONS[tableType] || WHEEL_DEFINITIONS['triple-zero'];
    const norm = normaliseWheel(raw);
    return {
        wheel: norm.wheel,
        red: RED_NUMBERS,
        black: BLACK_NUMBERS,
        green: new Set(norm.zeros)
    };
}

// ============================================
// CLUSTER ANALYSIS CONSTANTS
// ============================================

// The number of recent spins used for cluster analysis.
// Kept separate from the spin history length (20) so the UI can label it clearly.
const CLUSTER_WINDOW = 10;

// Minimum wheel-position separation between predicted sector centres.
// Prevents the top-3 predictions from being near-duplicates when clustering
// is tight — each sector centre must be at least this many positions apart.
const MIN_SECTOR_SEPARATION = 5;

// ============================================
// APPLICATION STATE & LOGIC
// ============================================
const app = {
    spins: [],           // Sliding window of last 20 spins (normalised strings)
    predictions: [],
    clusterScore: 0,
    tableStatus: null,
    frequency: {},       // Hit counts within the current 20-spin window
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
        const s = String(num);
        if (this.wheelConfig.green.has(s)) return 'green';
        if (this.wheelConfig.red.has(s)) return 'red';
        return 'black';
    },

    addSpin(number) {
        // Normalise to string on entry so all internal state is consistent
        const n = String(number);

        if (this.spins.length >= 20) {
            const removed = this.spins.shift();
            this.frequency[removed]--;
        }
        this.spins.push(n);
        this.frequency[n]++;
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

        // Use only the most recent CLUSTER_WINDOW spins for analysis
        const recentSpins = this.spins.slice(-CLUSTER_WINDOW);

        // FIX: Filter out any -1 indexes (guard against values missing from wheel)
        const indexes = recentSpins
            .map(n => this.wheelConfig.wheel.indexOf(n))
            .filter(i => i !== -1);

        if (indexes.length === 0) {
            this.clusterScore = 0;
            this.tableStatus = null;
            return;
        }

        const wheelLen = this.wheelConfig.wheel.length;
        let bestCluster = 0;

        for (let i = 0; i < wheelLen; i++) {
            let count = 0;
            for (const idx of indexes) {
                const dist = Math.min(
                    Math.abs(i - idx),
                    wheelLen - Math.abs(i - idx)
                );
                if (dist <= 2) count++;
            }
            bestCluster = Math.max(bestCluster, count);
        }

        // FIX: Divide by recentSpins.length (not this.spins.length) so the score
        // is measured against the same window the indexes came from.
        this.clusterScore = Math.round((bestCluster / recentSpins.length) * 10);

        if (this.clusterScore >= 8) {
            this.tableStatus = { label: '💎 STRONG TABLE', class: 'status-strong', desc: 'Excellent clustering detected' };
            this.generatePredictions(indexes, recentSpins.length);
        } else if (this.clusterScore >= 6) {
            this.tableStatus = { label: '✓ GOOD TABLE', class: 'status-good', desc: 'Sector clustering detected' };
            this.generatePredictions(indexes, recentSpins.length);
        } else if (this.clusterScore >= 4) {
            this.tableStatus = { label: '~ WEAK CLUSTER', class: 'status-weak', desc: 'Weak clustering pattern' };
            this.predictions = [];
        } else {
            this.tableStatus = { label: '✗ RANDOM TABLE', class: 'status-random', desc: 'No clear pattern' };
            this.predictions = [];
        }
    },

    // FIX: Accept windowSize so confidence is computed against the correct denominator
    generatePredictions(indexes, windowSize) {
        if (this.clusterScore < 6) {
            this.predictions = [];
            return;
        }

        const wheelLen = this.wheelConfig.wheel.length;

        // Score every wheel position by how many recent spins fall within ±2
        const sectorScore = this.wheelConfig.wheel.map((_, i) => {
            let score = 0;
            for (const idx of indexes) {
                const dist = Math.min(
                    Math.abs(i - idx),
                    wheelLen - Math.abs(i - idx)
                );
                if (dist <= 2) score++;
            }
            return { pos: i, score };
        });

        sectorScore.sort((a, b) => b.score - a.score);

        // FIX: Enforce minimum separation between sector centres so the top-3
        // predictions don't all point at the same tight cluster on the wheel.
        this.predictions = [];
        const chosenPositions = [];

        for (const candidate of sectorScore) {
            if (this.predictions.length >= 3) break;

            // Check this candidate is far enough from all already-chosen centres
            const tooClose = chosenPositions.some(chosen => {
                const dist = Math.min(
                    Math.abs(candidate.pos - chosen),
                    wheelLen - Math.abs(candidate.pos - chosen)
                );
                return dist < MIN_SECTOR_SEPARATION;
            });

            if (tooClose) continue;

            chosenPositions.push(candidate.pos);

            // Build the ±2 sector around this centre
            const sector = [];
            for (let i = -2; i <= 2; i++) {
                const index = (candidate.pos + i + wheelLen) % wheelLen;
                sector.push(this.wheelConfig.wheel[index]);
            }

            this.predictions.push({
                rank: this.predictions.length + 1,
                sector,
                // FIX: Use windowSize (recentSpins.length) as denominator
                confidence: Math.round((candidate.score / windowSize) * 100)
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
                        ${pred.sector.map(num => `<div class="sector-chip ${this.getNumberColor(num)}">${num}</div>`).join('')}
                    </div>
                    <div class="wheel-visual">
                        ${this.renderWheelStrip(pred.sector)}
                    </div>
                </div>
            `;
        });

        // FIX: Label makes clear predictions are based on last CLUSTER_WINDOW spins
        html = `<div class="predictions-note">Analysis based on last ${Math.min(this.spins.length, CLUSTER_WINDOW)} spins</div>` + html;
        section.innerHTML = html;
    },

    renderWheelStrip(sectorNumbers) {
        const sectorSet = new Set(sectorNumbers);
        const spinSet = new Set(this.spins);
        let html = '<div class="wheel-strip">';

        this.wheelConfig.wheel.forEach(num => {
            const color = this.getNumberColor(num);
            const isPredicted = sectorSet.has(num);
            const isHistoric = spinSet.has(num);

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

        // FIX: Show ALL wheel numbers in the heatmap, not a hardcoded subset of 10.
        // Numbers are sorted numerically (zeros last) so the grid is easy to scan.
        const allNums = [...this.wheelConfig.wheel].sort((a, b) => {
            const aNum = parseFloat(a);
            const bNum = parseFloat(b);
            if (isNaN(aNum) && isNaN(bNum)) return 0;
            if (isNaN(aNum)) return 1;  // '00', '000' go to end
            if (isNaN(bNum)) return -1;
            return aNum - bNum;
        });

        const grid = document.getElementById('heatmapGrid');
        grid.innerHTML = '';

        allNums.forEach(num => {
            const freq = this.frequency[num] || 0;
            const intensity = freq / maxFreq;
            const color = this.getNumberColor(num);

            const cell = document.createElement('div');
            cell.className = `heatmap-cell ${intensity > 0.4 ? 'hot' : ''}`;
            cell.textContent = num;

            let bgColor;
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