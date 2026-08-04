# Wjnbs — Browser-first NBS

Wjnbs is a browser-focused reimplementation of NBS built around `nbs.js`. It aims to provide a fully client-side NBS player / editor experience (MIDI hooks and playback) running entirely in the browser.

Quick start

1. Open [index.html](index.html) in a modern browser.
2. On first run you will be asked to accept two documents: the `LICENSE` and the `NON-PROFITEER-LICENSE.txt`. Both must be accepted to continue.
3. Use the file input to load a `.nbs` file. If `nbs.js` is available the app will attempt to parse and enable playback.

Notes
- The app attempts to load `nbs.js` from the unpkg CDN at runtime. If the library is not available, Wjnbs will still allow loading files but playback is disabled until `nbs.js` is present.
- MIDI integration and full parity with the official NBS functionality are in scope — the current commit scaffolds UI and license workflow and uses placeholders where library integration is required.

Development

- Edit `src/app.js` and `src/styles.css`.
- Open `index.html` in Chrome, Firefox, or any modern browser.

License / Redistribution

Wjnbs ships with two documents a user must accept before using the software: `LICENSE` and `NON-PROFITEER-LICENSE.txt`. See those files for details.

Next steps

- Wire up a dependable `nbs.js` package and implement full parsing + playback.
- Add MIDI output support using the Web MIDI API and map instruments to WebAudio/MIDI.
- Implement UI parity with the official NBS editor (note editor, tempo, layers, instruments).
# WebNBS
a as one would say "clone" of nbs but for the browser using nbs.js but is leagly visualy diffrent. but works the same
