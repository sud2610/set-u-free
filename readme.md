Deployment Steps - 
===================

Step 1 - git add .
Step 2 - git commit -m "Code commited"
Step 3 - git push origin main



For claude AI - Paste a summary at the start of a new chat
==========================================================

We are building a roulette sector prediction tool (single HTML file, offline, vanilla JS). Current version uses: 6 equal wheel sectors (S1–S6) by physical wheel order, clockwise arc distance including full rotations (default 15), dominant arc pattern detection (±1 slot tolerance), sector transition matrix, two prediction engines (arc-based + transition-based). Supports European / American / Triple-Zero wheels. Dark navy casino theme. The JS file is structured around getWheelConfiguration(), convertNumberToSector(), calculateSectorTransitions(), predictNextSector(). Next improvements to explore: rotation count calibration, longer spin history analysis, visual wheel diagram, mobile layout refinements.