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
// JUMP PATTERN CONSTANTS
// ============================================

// How many recent spins to analyse
const ANALYSIS_WINDOW = 10;

// ±1 slot tolerance when matching jump gaps
const GAP_TOLERANCE = 1;

// Minimum number of consistent gaps needed to trust a pattern
const MIN_PATTERN_MATCHES = 3;

// ============================================
// CORE: CLOCKWISE GAP LOGIC
//
// Returns how many slots clockwise you travel going from posA → posB.
// Example: wheel length 38, posA=5, posB=3
//   clockwise = (3 - 5 + 38) % 38 = 36 slots clockwise
//   (anti-clockwise would only be 2, but we always measure clockwise)
// ============================================
function clockwiseGap(posA, posB, wheelLen) {
    return (posB - posA + wheelLen) % wheelLen;
}

// ============================================
// APPLICATION STATE
// ============================================
const app = {
    spins: [],          // Sliding window, max 20, oldest→newest, normalised strings
    predictions: [],
    patternResult: null, // { dominantGap, matchCount, consistency, gaps[] }
    tableStatus: null,
    frequency: {},
    currentTableType: 'triple-zero',
    wheelConfig: getWheelConfiguration('triple-zero'),

    changeTableType(tableType) {
        this.currentTableType = tableType;
        this.wheelConfig = getWheelConfiguration(tableType);
        this.spins = [];
        this.predictions = [];
        this.patternResult = null;
        this.tableStatus = null;
        this.initFrequency();
        this.initializeGrid();
        this.render();
    },

    initFrequency() {
        this.frequency = {};
        this.wheelConfig.wheel.forEach(num => { this.frequency[num] = 0; });
    },

    getNumberColor(num) {
        const s = String(num);
        if (this.wheelConfig.green.has(s)) return 'green';
        if (this.wheelConfig.red.has(s)) return 'red';
        return 'black';
    },

    addSpin(number) {
        const n = String(number);
        if (this.spins.length >= 20) {
            const removed = this.spins.shift();
            this.frequency[removed]--;
        }
        this.spins.push(n);
        this.frequency[n]++;
        this.analyseJumpPattern();
        this.render();
    },

    undo() {
        if (this.spins.length > 0) {
            const removed = this.spins.pop();
            this.frequency[removed]--;
            this.predictions = [];
            this.patternResult = null;
            this.tableStatus = null;
            this.analyseJumpPattern();
            this.render();
        }
    },

    clear() {
        if (this.spins.length > 0) {
            this.spins = [];
            this.predictions = [];
            this.patternResult = null;
            this.tableStatus = null;
            this.initFrequency();
            this.render();
        }
    },

    // ============================================
    // NEW LOGIC: CLOCKWISE JUMP PATTERN ANALYSIS
    //
    // For spins [21, 34, 8, 29, 3, 15, 0, 24, 12, 31]:
    //
    // 1. Find each number's position on the physical wheel
    // 2. Measure the CLOCKWISE gap between each consecutive pair:
    //    21→34 = X slots, 34→8 = Y slots, 8→29 = Z slots ...
    // 3. Find which gap value repeats the most (within ±1 tolerance)
    // 4. That's the "dominant gap" — the dealer's consistent throw pattern
    // 5. Apply that gap to the LAST spin to predict where the ball lands next
    // ============================================
    analyseJumpPattern() {
        this.predictions = [];
        this.patternResult = null;
        this.tableStatus = null;

        if (this.spins.length < 3) return;

        const wheel = this.wheelConfig.wheel;
        const wheelLen = wheel.length;
        const recent = this.spins.slice(-ANALYSIS_WINDOW);

        // Step 1: Wheel positions for recent spins
        const positions = recent
            .map(n => wheel.indexOf(n))
            .filter(i => i !== -1);

        if (positions.length < 3) return;

        // Step 2: Clockwise gap between every consecutive pair of spins
        const gaps = [];
        for (let i = 0; i < positions.length - 1; i++) {
            gaps.push(clockwiseGap(positions[i], positions[i + 1], wheelLen));
        }

        // Step 3: Find the most repeated gap (±1 tolerance)
        // For each unique gap, count how many other gaps are within ±1 of it
        let bestGap = null;
        let bestCount = 0;

        for (let i = 0; i < gaps.length; i++) {
            const matchCount = gaps.filter(g => Math.abs(g - gaps[i]) <= GAP_TOLERANCE).length;
            if (matchCount > bestCount) {
                bestCount = matchCount;
                bestGap = gaps[i];
            }
        }

        // Step 4: Is the pattern strong enough?
        if (bestCount < MIN_PATTERN_MATCHES) {
            this.tableStatus = {
                label: '✗ NO PATTERN',
                class: 'status-random',
                desc: `Only ${bestCount} matching gaps — need ${MIN_PATTERN_MATCHES}`
            };
            this.patternResult = { gaps, dominantGap: bestGap, matchCount: bestCount, consistency: 0, totalGaps: gaps.length };
            return;
        }

        // Step 5: Consistency = % of gaps that match the dominant gap
        const consistency = Math.round((bestCount / gaps.length) * 100);

        this.patternResult = { gaps, dominantGap: bestGap, matchCount: bestCount, consistency, totalGaps: gaps.length };

        if (consistency >= 80) {
            this.tableStatus = { label: '💎 STRONG PATTERN', class: 'status-strong', desc: `${consistency}% gaps consistent` };
        } else if (consistency >= 60) {
            this.tableStatus = { label: '✓ GOOD PATTERN',   class: 'status-good',   desc: `${consistency}% gaps consistent` };
        } else {
            this.tableStatus = { label: '~ WEAK PATTERN',   class: 'status-weak',   desc: `${consistency}% gaps consistent` };
        }

        // Step 6: Predict — apply dominant gap (and ±1) from last known position
        if (consistency >= 60) {
            this.generateJumpPredictions(positions, bestGap, consistency, wheelLen);
        }
    },

    generateJumpPredictions(positions, dominantGap, consistency, wheelLen) {
        const wheel = this.wheelConfig.wheel;
        const lastPos = positions[positions.length - 1];

        // Three predictions: exact gap, gap+1, gap-1
        const offsets = [0, 1, -1];

        this.predictions = offsets.map((offset, i) => {
            const gapUsed = (dominantGap + offset + wheelLen) % wheelLen;
            const centre = (lastPos + gapUsed) % wheelLen;

            // Build ±2 sector around predicted centre (5 numbers total)
            const sector = [];
            for (let j = -2; j <= 2; j++) {
                sector.push(wheel[(centre + j + wheelLen) % wheelLen]);
            }

            // Primary gets full confidence, adjacents get slightly less
            const confidence = i === 0 ? consistency : Math.max(consistency - (i * 10), 10);

            return {
                rank: i + 1,
                sector,
                centreNumber: wheel[centre],
                gapUsed,
                confidence,
                label: i === 0 ? `🎯 Primary — +${gapUsed} slots` : `~ Adjacent — +${gapUsed} slots`
            };
        });
    },

    // ============================================
    // RENDER METHODS
    // ============================================
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

        const wheel = this.wheelConfig.wheel;
        const wheelLen = wheel.length;

        this.spins.forEach((spin, i) => {
            // The spin chip
            const chip = document.createElement('div');
            chip.className = `chip ${this.getNumberColor(spin)}`;
            chip.textContent = spin;
            container.appendChild(chip);

            // Between chips: show the clockwise gap, highlighted if it matches dominant pattern
            if (i < this.spins.length - 1) {
                const posA = wheel.indexOf(spin);
                const posB = wheel.indexOf(this.spins[i + 1]);
                if (posA !== -1 && posB !== -1) {
                    const gap = clockwiseGap(posA, posB, wheelLen);
                    const isDominant = this.patternResult &&
                        Math.abs(gap - this.patternResult.dominantGap) <= GAP_TOLERANCE;

                    const arrow = document.createElement('div');
                    arrow.className = `gap-arrow ${isDominant ? 'gap-match' : 'gap-miss'}`;
                    arrow.textContent = `→${gap}`;
                    arrow.title = `Clockwise jump: ${gap} slots`;
                    container.appendChild(arrow);
                }
            }
        });
    },

    renderScore() {
        // Show dominant gap instead of cluster score
        const gapDisplay = this.patternResult && this.patternResult.dominantGap !== null
            ? this.patternResult.dominantGap
            : '—';
        document.getElementById('scoreDisplay').textContent = gapDisplay;

        if (!this.tableStatus) {
            document.getElementById('statusLabel').textContent = 'ENTER SPINS';
            document.getElementById('statusLabel').className = 'status-label';
            document.getElementById('statusBarFill').style.width = '0%';
            return;
        }

        document.getElementById('statusLabel').textContent = this.tableStatus.label;
        document.getElementById('statusLabel').className = `status-label ${this.tableStatus.class}`;
        document.getElementById('statusBarFill').style.width =
            (this.patternResult ? this.patternResult.consistency : 0) + '%';
    },

    renderPredictions() {
        const section = document.getElementById('predictionsSection');

        if (this.predictions.length === 0) {
            section.innerHTML = '';
            return;
        }

        const lastSpin = this.spins[this.spins.length - 1];
        const pr = this.patternResult;

        let html = `
            <div class="predictions-note">
                Last spin: <strong>${lastSpin}</strong>
                &nbsp;|&nbsp; Dominant jump: <strong>+${pr.dominantGap} slots clockwise</strong>
                &nbsp;|&nbsp; Consistency: <strong>${pr.consistency}%</strong>
                (${pr.matchCount} of ${pr.totalGaps} gaps matched ±${GAP_TOLERANCE})
            </div>`;

        this.predictions.forEach(pred => {
            html += `
                <div class="prediction-card ${pred.rank === 1 ? 'primary' : 'secondary'}">
                    <div class="prediction-header">
                        <div class="prediction-rank">${pred.label}</div>
                        <div class="prediction-confidence">${pred.confidence}% Confidence</div>
                    </div>
                    <div class="prediction-subtext">Centre: <strong>${pred.centreNumber}</strong> · 5-number sector</div>
                    <div class="sector-numbers">
                        ${pred.sector.map(num =>
                            `<div class="sector-chip ${this.getNumberColor(num)}">${num}</div>`
                        ).join('')}
                    </div>
                    <div class="wheel-visual">${this.renderWheelStrip(pred.sector)}</div>
                </div>`;
        });

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
            html += `<div class="wheel-segment ${classes}" style="background:${bgColor};opacity:${opacity};"></div>`;
        });

        html += '</div>';
        return html;
    },

    renderHeatmap() {
        const maxFreq = Math.max(1, ...Object.values(this.frequency));
        const allNums = [...this.wheelConfig.wheel].sort((a, b) => {
            const aNum = parseFloat(a), bNum = parseFloat(b);
            if (isNaN(aNum) && isNaN(bNum)) return 0;
            if (isNaN(aNum)) return 1;
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
            if (color === 'red') bgColor = `rgba(231,76,60,${0.3 + intensity * 0.6})`;
            else if (color === 'green') bgColor = `rgba(0,255,65,${0.3 + intensity * 0.6})`;
            else bgColor = `rgba(52,73,94,${0.3 + intensity * 0.6})`;

            cell.style.background = bgColor;
            cell.style.color = freq > 0 ? '#fff' : 'rgba(255,255,255,0.3)';
            cell.style.fontWeight = freq > 0 ? '700' : '600';
            grid.appendChild(cell);
        });

        document.getElementById('heatmapSection').classList.toggle('show', this.spins.length > 0);
    }
};

// ============================================
// INITIALIZE
// ============================================
function initialize() {
    app.initFrequency();
    app.initializeGrid();
    app.render();
    document.getElementById('tableTypeSelector').value = 'triple-zero';
}

initialize();