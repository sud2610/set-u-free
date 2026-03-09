// ═══════════════════════════════════════════════════════════════════
// WHEEL CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════
const WHEEL_DEFS = {
    european: {
        wheel: [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26],
        zeros: [0]
    },
    american: {
        wheel: [0, '00', 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26],
        zeros: [0, '00']
    },
    'triple-zero': {
        wheel: [0, '00', '000', 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26],
        zeros: [0, '00', '000']
    }
};

const RED_SET = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].map(String));
const BLACK_SET = new Set([2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35].map(String));
const SECTOR_COLOURS = ['#e8882a', '#9b59b6', '#2e86c1', '#1e8449', '#b03a2e', '#148f77', '#d4ac0d', '#2874a6'];
const NUM_SECTORS = 6;

// ═══════════════════════════════════════════════════════════════════
// MODULE: getWheelConfiguration
// ═══════════════════════════════════════════════════════════════════
function getWheelConfiguration(tableType) {
    const raw = WHEEL_DEFS[tableType] || WHEEL_DEFS['triple-zero'];
    const wheel = raw.wheel.map(String);
    const greens = new Set(raw.zeros.map(String));
    return { wheel, greens };
}

// ═══════════════════════════════════════════════════════════════════
// MODULE: buildSectors
// Divides the wheel array into NUM_SECTORS equal consecutive segments.
// ═══════════════════════════════════════════════════════════════════
function buildSectors(wheel) {
    const size = Math.ceil(wheel.length / NUM_SECTORS);
    return Array.from({ length: NUM_SECTORS }, (_, i) => {
        const list = wheel.slice(i * size, Math.min((i + 1) * size, wheel.length));
        return {
            id: i,
            label: 'S' + (i + 1),
            colour: SECTOR_COLOURS[i % SECTOR_COLOURS.length],
            numbers: new Set(list),
            list
        };
    });
}

// ═══════════════════════════════════════════════════════════════════
// MODULE: convertNumberToSector
// Returns the sector object for a given wheel number string.
// ═══════════════════════════════════════════════════════════════════
function convertNumberToSector(numStr, sectors) {
    return sectors.find(s => s.numbers.has(numStr)) || null;
}

// ═══════════════════════════════════════════════════════════════════
// MODULE: getNumberColor
// ═══════════════════════════════════════════════════════════════════
function getNumberColor(numStr, greens) {
    if (greens.has(numStr)) return 'green';
    if (RED_SET.has(numStr)) return 'red';
    return 'black';
}

// ═══════════════════════════════════════════════════════════════════
// MODULE: computeArc
// Total clockwise arc (in slots) = rotations × wheelSize + netClockwiseSlots
// The net slot offset is: (posB - posA + wheelSize) % wheelSize
// By keeping full rotations in the arc we distinguish throws of
// identical net offset but different travel distance (force).
// ═══════════════════════════════════════════════════════════════════
function computeArc(posA, posB, wheelSize, rotations) {
    const net = (posB - posA + wheelSize) % wheelSize;
    return rotations * wheelSize + net;
}

// ═══════════════════════════════════════════════════════════════════
// MODULE: calculateSectorTransitions
// Counts how many times each (fromSector → toSector) transition
// occurred in the sector sequence.
// Returns: { 'S1→S3': { from, to, count }, ... }
// ═══════════════════════════════════════════════════════════════════
function calculateSectorTransitions(sectorSeq) {
    const map = {};
    for (let i = 0; i < sectorSeq.length - 1; i++) {
        const f = sectorSeq[i], t = sectorSeq[i + 1];
        if (f === null || t === null) continue;
        const key = f + '→' + t;
        if (!map[key]) map[key] = { from: f, to: t, count: 0 };
        map[key].count++;
    }
    return map;
}

// ═══════════════════════════════════════════════════════════════════
// MODULE: predictNextSector
// Given the current sector id and transition map, returns ranked
// predictions: [{ sector, count, pct }, ...]
// ═══════════════════════════════════════════════════════════════════
function predictNextSector(currentSectorId, transitions, sectors) {
    const tally = {};
    let total = 0;
    for (const [, v] of Object.entries(transitions)) {
        if (v.from !== currentSectorId) continue;
        tally[v.to] = (tally[v.to] || 0) + v.count;
        total += v.count;
    }
    if (total === 0) return [];
    return Object.entries(tally)
        .map(([id, count]) => ({
            sector: sectors[+id],
            count,
            pct: Math.round(count / total * 100)
        }))
        .sort((a, b) => b.pct - a.pct);
}

// ═══════════════════════════════════════════════════════════════════
// APPLICATION STATE
// ═══════════════════════════════════════════════════════════════════
const app = {
    tableType: 'triple-zero',
    rotations: 15,
    cfg: getWheelConfiguration('triple-zero'),
    sectors: [],
    spins: [],    // { num: str, pos: int, sectorId: int|null }
    arcs: [],    // arc value per consecutive pair (length = spins-1)

    init() {
        this.cfg = getWheelConfiguration(this.tableType);
        this.sectors = buildSectors(this.cfg.wheel);
        this.spins = [];
        this.arcs = [];
        this.renderGrid();
        this.renderSectorLegend();
        this.render();
    },

    setTable(t) {
        this.tableType = t;
        document.querySelectorAll('.table-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('btn-' + t).classList.add('active');
        this.init();
    },

    setRotations(v) {
        this.rotations = Math.max(1, parseInt(v) || 15);
        this.recomputeArcs();
        this.render();
    },

    recomputeArcs() {
        const wLen = this.cfg.wheel.length;
        this.arcs = [];
        for (let i = 0; i < this.spins.length - 1; i++) {
            const a = this.spins[i].pos, b = this.spins[i + 1].pos;
            this.arcs.push(a === -1 || b === -1 ? null : computeArc(a, b, wLen, this.rotations));
        }
    },

    addSpin(numStr) {
        if (this.spins.length >= 20) {
            this.spins.shift();
            if (this.arcs.length) this.arcs.shift();
        }
        const pos = this.cfg.wheel.indexOf(numStr);
        const sector = convertNumberToSector(numStr, this.sectors);
        // Compute arc from previous spin
        if (this.spins.length > 0) {
            const prevPos = this.spins[this.spins.length - 1].pos;
            const arc = (prevPos !== -1 && pos !== -1)
                ? computeArc(prevPos, pos, this.cfg.wheel.length, this.rotations)
                : null;
            this.arcs.push(arc);
        }
        this.spins.push({ num: numStr, pos, sectorId: sector ? sector.id : null });
        this.render();
    },

    undo() {
        if (!this.spins.length) return;
        this.spins.pop();
        if (this.arcs.length) this.arcs.pop();
        this.render();
    },

    clear() {
        this.spins = []; this.arcs = [];
        this.render();
    },

    // ── Dominant arc analysis with outlier filtering ─────────────────
    //
    // Step 1: Find rough dominant arc from ALL valid arcs (±1 tol).
    // Step 2: Compute mean and standard deviation of all arcs.
    // Step 3: Drop any arc that deviates more than 1.5 × stdDev
    //         from the rough dominant — these are the "random throws"
    //         the dealer made that don't match their usual pattern.
    // Step 4: Recompute dominant arc from the clean set only.
    // Step 5: Consistency = clean matches / total arcs (including outliers)
    //         so the score honestly reflects how noisy the session is.
    //
    getArcAnalysis() {
        const valid = this.arcs.filter(a => a !== null);
        if (valid.length < 2) return null;
        const tol = 1;
        const wLen = this.cfg.wheel.length;

        // ── Pass 1: rough dominant from all arcs ──────────────────────
        let roughDom = null, roughCount = 0;
        for (const arc of valid) {
            const c = valid.filter(a => Math.abs(a - arc) <= tol).length;
            if (c > roughCount) { roughCount = c; roughDom = arc; }
        }

        // ── Outlier detection via standard deviation ──────────────────
        // Mean and stdDev of all valid arcs
        const mean = valid.reduce((s, a) => s + a, 0) / valid.length;
        const stdDev = Math.sqrt(
            valid.reduce((s, a) => s + Math.pow(a - mean, 2), 0) / valid.length
        );

        // Threshold: 1.5 × stdDev from the rough dominant arc.
        // If stdDev is very small (tight cluster), use a minimum of 3 slots
        // so we don't over-aggressively drop arcs in a nearly-perfect series.
        const threshold = Math.max(stdDev * 1.5, 3);

        // Classify each arc
        const annotations = this.arcs.map(a => {
            if (a === null) return 'none';
            return Math.abs(a - roughDom) > threshold ? 'outlier' : null; // fill below
        });

        // Clean arcs = valid arcs that are NOT outliers
        const cleanArcs = valid.filter(a => Math.abs(a - roughDom) <= threshold);
        const outlierCount = valid.length - cleanArcs.length;

        // ── Pass 2: recompute dominant from clean arcs only ───────────
        let domArc = roughDom, domCount = 0;
        if (cleanArcs.length >= 2) {
            for (const arc of cleanArcs) {
                const c = cleanArcs.filter(a => Math.abs(a - arc) <= tol).length;
                if (c > domCount) { domCount = c; domArc = arc; }
            }
        } else {
            // Fallback: not enough clean arcs, use rough dominant
            domArc = roughDom;
            domCount = roughCount;
        }

        // ── Final annotations (match / miss / outlier) ─────────────────
        const finalAnnotations = this.arcs.map(a => {
            if (a === null) return 'none';
            if (Math.abs(a - roughDom) > threshold) return 'outlier';
            return Math.abs(a - domArc) <= tol ? 'match' : 'miss';
        });

        // Consistency scored against ALL arcs (including outliers) so the
        // user gets an honest picture of how reliable the dealer pattern is.
        const consistency = Math.round(domCount / valid.length * 100);

        return {
            domArc,
            domCount,
            total: valid.length,
            cleanTotal: cleanArcs.length,
            outlierCount,
            consistency,
            netSlots: domArc % wLen,
            annotations: finalAnnotations,
            threshold: Math.round(threshold)
        };
    },

    // ── RENDER ───────────────────────────────────────────────────────
    renderGrid() {
        const g = document.getElementById('numGrid');
        g.innerHTML = '';
        this.cfg.wheel.forEach(num => {
            const col = getNumberColor(num, this.cfg.greens);
            const sec = convertNumberToSector(num, this.sectors);
            const btn = document.createElement('button');
            btn.className = 'num-btn ' + col;
            btn.innerHTML = num +
                `<span class="sdot" style="background:${sec ? sec.colour : '#444'}"></span>`;
            btn.onclick = () => this.addSpin(num);
            g.appendChild(btn);
        });
    },

    renderSectorLegend() {
        const el = document.getElementById('sectorLegend');
        el.innerHTML = this.sectors.map(s => `
      <div class="legend-card">
        <div class="legend-header" style="background:${s.colour}20;color:${s.colour}">${s.label}</div>
        <div class="legend-nums">
          ${s.list.map(n => {
            const c = getNumberColor(n, this.cfg.greens);
            return `<span class="legend-num ${c}">${n}</span>`;
        }).join('')}
        </div>
      </div>`).join('');
    },

    render() {
        this.renderStatus();
        this.renderHistory();
        this.renderArcPanel();
        this.renderMatrix();
        this.renderPrediction();
        document.getElementById('spinCount').textContent =
            this.spins.length + ' / 20 spins';
    },

    renderStatus() {
        const dot = document.getElementById('statusDot');
        const text = document.getElementById('statusText');
        const sub = document.getElementById('statusSub');
        sub.textContent = this.spins.length + ' spin' + (this.spins.length !== 1 ? 's' : '');

        if (this.spins.length === 0) {
            dot.style.background = '#3a3028';
            text.textContent = 'Enter spins to begin analysis';
            return;
        }
        const arc = this.getArcAnalysis();
        if (!arc) {
            dot.style.background = '#6b5520';
            text.textContent = 'Collecting data…';
            return;
        }
        if (arc.consistency >= 70) {
            dot.style.background = '#27ae60';
            text.textContent = `Strong arc pattern — ${arc.consistency}% consistent (dominant arc: ${arc.domArc} slots)`;
        } else if (arc.consistency >= 50) {
            dot.style.background = '#f39c12';
            text.textContent = `Moderate arc pattern — ${arc.consistency}% consistent`;
        } else {
            dot.style.background = '#c0392b';
            text.textContent = `Weak arc pattern — ${arc.consistency}% consistent`;
        }
    },

    renderHistory() {
        const scroll = document.getElementById('historyScroll');
        if (!this.spins.length) {
            scroll.innerHTML = '<span class="history-empty">No spins yet — tap a number above</span>';
            return;
        }
        const arc = this.getArcAnalysis();
        let html = '';
        this.spins.forEach((sp, i) => {
            const col = getNumberColor(sp.num, this.cfg.greens);
            const sec = sp.sectorId !== null ? this.sectors[sp.sectorId] : null;
            // arc badge before chip (except first)
            if (i > 0) {
                const arcVal = this.arcs[i - 1];
                const anno = arc ? arc.annotations[i - 1] : 'none';
                const net = arcVal !== null ? arcVal % this.cfg.wheel.length : '?';
                html += `<div class="arc-pill ${anno}" title="${anno === 'outlier' ? 'Outlier — excluded from pattern' : anno === 'match' ? 'Matches dominant arc' : 'Arc: ' + arcVal + ' slots'}">↻${this.rotations}+${net}${anno === 'outlier' ? ' ⚡' : ''}</div>`;
            }
            html += `
        <div class="spin-group">
          <div class="spin-chip ${col}" style="border-color:${sec ? sec.colour : ''}">
            ${sp.num}
          </div>
          <div class="spin-stag" style="color:${sec ? sec.colour : '#666'};border:1px solid ${sec ? sec.colour + '40' : '#2a2a2a'}">
            ${sec ? sec.label : '?'}
          </div>
        </div>`;
            if (i < this.spins.length - 1)
                html += `<div class="spin-arrow">›</div>`;
        });
        scroll.innerHTML = html;
        scroll.scrollLeft = scroll.scrollWidth;
    },

    renderArcPanel() {
        const card = document.getElementById('arcCard');
        const stats = document.getElementById('arcStats');
        const arc = this.getArcAnalysis();
        if (!arc) { card.style.display = 'none'; return; }
        card.style.display = 'block';
        stats.innerHTML = `
      <div class="arc-stat">
        <div class="arc-stat-label">DOMINANT ARC</div>
        <div class="arc-stat-val">${arc.domArc}<small style="font-size:0.5rem;color:var(--text-dim)"> slots</small></div>
      </div>
      <div class="arc-stat">
        <div class="arc-stat-label">NET ADVANCE</div>
        <div class="arc-stat-val">${arc.netSlots}<small style="font-size:0.5rem;color:var(--text-dim)"> slots cw</small></div>
      </div>
      <div class="arc-stat">
        <div class="arc-stat-label">CONSISTENCY</div>
        <div class="arc-stat-val" style="color:${arc.consistency >= 70 ? '#27ae60' : arc.consistency >= 50 ? '#f39c12' : '#c0392b'}">${arc.consistency}<small style="font-size:0.5rem">%</small></div>
      </div>
      <div class="arc-stat">
        <div class="arc-stat-label">CLEAN / OUTLIERS</div>
        <div class="arc-stat-val">
          <span style="color:#55d078">${arc.cleanTotal}</span>
          <small style="font-size:0.5rem;color:var(--text-dim)"> / </small>
          <span style="color:${arc.outlierCount > 0 ? '#c8a820' : 'var(--text-dim)'}">${arc.outlierCount}</span>
          <small style="font-size:0.45rem;color:var(--text-dim)"> excl.</small>
        </div>
      </div>`;
    },

    renderMatrix() {
        const wrap = document.getElementById('matrixWrap');
        const sectorSeq = this.spins.map(s => s.sectorId);
        if (sectorSeq.length < 3) {
            wrap.innerHTML = '<div class="no-data-row">Enter at least 3 spins to build transition data</div>';
            return;
        }
        const transitions = calculateSectorTransitions(sectorSeq);
        const entries = Object.values(transitions).sort((a, b) => b.count - a.count);
        if (!entries.length) {
            wrap.innerHTML = '<div class="no-data-row">No transitions yet</div>';
            return;
        }
        // Count totals per "from" sector for percentage calculation
        const fromTotals = {};
        entries.forEach(e => { fromTotals[e.from] = (fromTotals[e.from] || 0) + e.count; });
        const maxCount = Math.max(...entries.map(e => e.count));

        wrap.innerHTML = `
      <table class="matrix-table">
        <thead>
          <tr>
            <th>FROM</th><th>→</th><th>TO</th>
            <th>COUNT</th><th>PROBABILITY</th>
          </tr>
        </thead>
        <tbody>
          ${entries.map(e => {
            const fromSec = this.sectors[e.from];
            const toSec = this.sectors[e.to];
            const pct = Math.round(e.count / fromTotals[e.from] * 100);
            const barW = Math.round(e.count / maxCount * 100);
            return `
              <tr>
                <td>
                  <div class="matrix-cell-bar" style="width:${barW}%;background:${fromSec.colour}"></div>
                  <span class="matrix-from" style="color:${fromSec.colour}">${fromSec.label}</span>
                </td>
                <td style="color:var(--text-faint)">→</td>
                <td><span class="matrix-to" style="color:${toSec.colour}">${toSec.label}</span></td>
                <td><span class="matrix-cnt">${e.count}×</span></td>
                <td>
                  <span class="matrix-pct" style="color:${pct >= 60 ? '#27ae60' : pct >= 40 ? '#f39c12' : 'var(--text-dim)'}">${pct}%</span>
                </td>
              </tr>`;
        }).join('')}
        </tbody>
      </table>`;
    },

    renderPrediction() {
        const content = document.getElementById('predContent');
        const sectorSeq = this.spins.map(s => s.sectorId);
        if (sectorSeq.length < 2) {
            content.innerHTML = '<div class="no-data-row">Need more spins for prediction</div>';
            return;
        }
        const lastId = sectorSeq[sectorSeq.length - 1];
        if (lastId === null) {
            content.innerHTML = '<div class="no-data-row">Last spin not mapped to sector</div>';
            return;
        }
        const transitions = calculateSectorTransitions(sectorSeq);
        const ranked = predictNextSector(lastId, transitions, this.sectors);
        const currentSec = this.sectors[lastId];
        const arc = this.getArcAnalysis();

        // Arc-based prediction (net slot advance from last position)
        let arcPredSec = null, arcPredNum = null;
        if (arc && this.spins.length > 0) {
            const lastPos = this.spins[this.spins.length - 1].pos;
            const predPos = lastPos !== -1
                ? (lastPos + arc.netSlots) % this.cfg.wheel.length
                : null;
            if (predPos !== null) {
                arcPredNum = this.cfg.wheel[predPos];
                arcPredSec = convertNumberToSector(arcPredNum, this.sectors);
            }
        }

        if (!ranked.length && !arcPredSec) {
            content.innerHTML = `
        <div style="font-size:0.8rem;color:var(--text-dim);padding:8px 0">
          Current sector: <strong style="color:${currentSec.colour}">${currentSec.label}</strong> —
          no prior transitions recorded for this sector yet.
        </div>`;
            return;
        }

        const top = ranked[0] || null;

        // Wheel strip
        const stripHtml = () => {
            const predSec = top ? top.sector : arcPredSec;
            return '<div class="wheel-strip">' +
                this.cfg.wheel.map(num => {
                    const col = getNumberColor(num, this.cfg.greens);
                    const inSec = predSec ? predSec.numbers.has(num) : false;
                    let bg = col === 'red' ? '#8a2020' : col === 'green' ? '#1e5828' : '#263040';
                    const op = inSec ? 1 : 0.18;
                    return `<div class="ws-slot ${inSec ? 'predicted' : ''}"
                       style="background:${bg};opacity:${op}"></div>`;
                }).join('') +
                '</div>';
        };

        content.innerHTML = `
      <div class="prediction-panel">

        <!-- Left: Transition-based prediction -->
        <div class="pred-block">
          <div class="pred-block-title">Transition Prediction</div>

          <div style="font-size:0.72rem;color:var(--text-dim);margin-bottom:10px">
            Current sector:
            <strong style="color:${currentSec.colour}">${currentSec.label}</strong>
          </div>

          ${ranked.length ? `
            <div class="pred-sector-badge" style="background:${ranked[0].sector.colour}15;border-color:${ranked[0].sector.colour}50">
              <span class="pred-sector-name" style="color:${ranked[0].sector.colour}">
                ${ranked[0].sector.label}
              </span>
              <span style="font-size:0.65rem;color:var(--text-dim)">most likely</span>
            </div>

            <div class="pred-confidence">
              Confidence: <strong>${ranked[0].pct}%</strong>
              &nbsp;·&nbsp; ${ranked[0].count} of ${ranked.reduce((s, r) => s + r.count, 0)} observations
            </div>

            <div class="pred-numbers">
              ${ranked[0].sector.list.map(n => {
                const c = getNumberColor(n, this.cfg.greens);
                return `<span class="pred-num-chip ${c}">${n}</span>`;
            }).join('')}
            </div>

            <div style="margin-top:12px">
              <div class="pred-block-title" style="margin-bottom:6px">All transitions from ${currentSec.label}</div>
              <div class="conf-rows">
                ${ranked.map(r => `
                  <div class="conf-row">
                    <span class="conf-label" style="color:${r.sector.colour}">${r.sector.label}</span>
                    <div class="conf-bar-bg">
                      <div class="conf-bar-fill" style="width:${r.pct}%;background:${r.sector.colour}80"></div>
                    </div>
                    <span class="conf-pct" style="color:${r.sector.colour}">${r.pct}%</span>
                    <span class="conf-cnt">${r.count}×</span>
                  </div>`).join('')}
              </div>
            </div>
          ` : '<div style="color:var(--text-faint);font-size:0.78rem">No transition history for this sector yet</div>'}

          ${stripHtml()}
        </div>

        <!-- Right: Arc-based prediction -->
        <div class="pred-block">
          <div class="pred-block-title">Arc-Based Prediction</div>

          ${arcPredSec && arc ? `
            <div style="font-size:0.72rem;color:var(--text-dim);margin-bottom:10px">
              Dominant arc: <strong style="color:var(--gold)">${arc.domArc}</strong> slots
              &nbsp;(+${arc.netSlots} net)
            </div>

            <div class="pred-sector-badge" style="background:${arcPredSec.colour}15;border-color:${arcPredSec.colour}50">
              <span class="pred-sector-name" style="color:${arcPredSec.colour}">
                ${arcPredSec.label}
              </span>
              <span style="font-size:0.65rem;color:var(--text-dim)">arc landing</span>
            </div>

            <div class="pred-confidence">
              Arc consistency: <strong>${arc.consistency}%</strong>
              &nbsp;·&nbsp; Lands on <strong style="color:var(--gold)">${arcPredNum}</strong>
            </div>

            <div class="pred-numbers">
              ${arcPredSec.list.map(n => {
                const c = getNumberColor(n, this.cfg.greens);
                const isCenter = n === arcPredNum;
                return `<span class="pred-num-chip ${c}" style="${isCenter ? 'box-shadow:0 0 0 2px var(--gold)' : ''}">${n}</span>`;
            }).join('')}
            </div>

            <div style="margin-top:12px;font-size:0.68rem;color:var(--text-dim);line-height:1.6">
              The ball travels <strong style="color:var(--text)">${arc.domArc}</strong> slots clockwise
              (${this.rotations} full rotations + ${arc.netSlots} slots).
              Applied from the last spin position, it lands near
              <strong style="color:var(--gold)">${arcPredNum}</strong>
              in sector <strong style="color:${arcPredSec.colour}">${arcPredSec.label}</strong>.
            </div>

            <div class="wheel-strip" style="margin-top:12px">
              ${this.cfg.wheel.map(num => {
                const col = getNumberColor(num, this.cfg.greens);
                const isArc = num === arcPredNum;
                const inSec = arcPredSec.numbers.has(num);
                let bg = col === 'red' ? '#8a2020' : col === 'green' ? '#1e5828' : '#263040';
                const op = isArc ? 1 : inSec ? 0.6 : 0.15;
                return `<div class="ws-slot ${isArc ? 'predicted' : ''}"
                             style="background:${isArc ? arcPredSec.colour : bg};opacity:${op}"></div>`;
            }).join('')}
            </div>
          ` : '<div style="color:var(--text-faint);font-size:0.78rem">Need at least 3 spins for arc analysis</div>'}
        </div>

      </div>`;
    }
};

// ── Boot ────────────────────────────────────────────────────────────
app.init();
