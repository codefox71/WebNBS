# WebNBS — Browser-first NBS

WebNBS is a browser-focused reimplementation of NBS built around `nbs.js`. It aims to provide a fully client-side NBS player / editor experience (MIDI hooks and playback) running entirely in the browser.

Quick start

1. Run a local server instead of opening `index.html` directly.
2. On first run you will be asked to accept two documents: the `LICENSE` and the `NON-PROFITEER-LICENSE.txt`. Both must be accepted to continue.
3. Use the file input to load a `.nbs` file. The app imports `nbs.js` via npm and parses the file in-browser.

Notes
- The app must be served from a local server to resolve ES module imports and package imports correctly.
- MIDI integration and full parity with the official NBS functionality are in scope — the current commit scaffolds UI and license workflow and uses placeholders where library integration is required.

Run locally (recommended):

1. Install dependencies:

```bash
npm install
```

2. Start the test server:

```bash
npm run test-server
```

3. Open the app at the address printed by Vite (usually http://localhost:5173).

If you prefer a preview build server, use:

```bash
npm run build
npm run start
```

Notes on MIDI and playback:
- The app now imports `nbs.js` from npm and parses `.nbs` files in-browser.
- MIDI output can be enabled via the "Enable MIDI" button; choose an output and check "Use MIDI output" before pressing Play.
- If no MIDI output is selected, WebNBS falls back to simple WebAudio beeps for preview.

Development

- Edit `src/app.js` and `src/styles.css`.
- Use the local server rather than opening `index.html` directly.

License / Redistribution

WebNBS ships with two documents a user must accept before using the software: `LICENSE` and `NON-PROFITEER-LICENSE.txt`. See those files for details.

Next steps

- Wire up a dependable `nbs.js` package and implement full parsing + playback.
- Add MIDI output support using the Web MIDI API and map instruments to WebAudio/MIDI.
- Implement UI parity with the official NBS editor (note editor, tempo, layers, instruments).
