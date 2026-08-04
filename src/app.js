// Basic application glue for WebNBS — now exported as an ES module init()
export function init(){
  const logEl = id('log');
  const fileInput = id('fileInput');
  const playBtn = id('playBtn');
  const stopBtn = id('stopBtn');
  const fileNameEl = id('fileName');
  const requestMidiBtn = id('requestMidiBtn');
  const midiOutSelect = id('midiOut');
  const useMidiCheckbox = id('useMidi');

  const licenseModal = id('licenseModal');
  const agreeMain = id('agreeMain');
  const agreeNonProfit = id('agreeNonProfit');
  const continueBtn = id('continueBtn');

  // Restore acceptance if previously granted
  const accepted = localStorage.getItem('webnbs:accepted') === '1';
  if(accepted){ hide(licenseModal); } else { show(licenseModal); }

  agreeMain.addEventListener('change', updateContinue);
  agreeNonProfit.addEventListener('change', updateContinue);
  continueBtn.addEventListener('click', ()=>{
    if(agreeMain.checked && agreeNonProfit.checked){
      localStorage.setItem('webnbs:accepted','1');
      hide(licenseModal);
      info('Thank you — you may now use WebNBS.');
    }
  });

  fileInput.addEventListener('change', async (ev)=>{
    const f = ev.target.files && ev.target.files[0];
    if(!f) return;
    fileNameEl.textContent = f.name;
    info('Loaded file: ' + f.name);

    // read file bytes
    const arrayBuffer = await f.arrayBuffer();
    info('File size: ' + arrayBuffer.byteLength + ' bytes');

    // If nbs.js is available, parse the buffer
    if(window.NBS && typeof window.NBS.parse === 'function'){
      try{
        window.webnbsSong = window.NBS.parse(new Uint8Array(arrayBuffer));
        info('Parsed NBS: ' + (window.webnbsSong.title||'untitled'));
        playBtn.disabled = false;
        stopBtn.disabled = false;
      }catch(err){
        error('nbs.js parse error: ' + err.message);
        playBtn.disabled = true;
      }
    } else {
      info('nbs.js not available — file held in memory (no playback)');
      window.webnbsSong = {raw:arrayBuffer};
      playBtn.disabled = true; // disable until nbs integration
      stopBtn.disabled = true;
    }
  });

  playBtn.addEventListener('click', ()=>{
    if(!window.webnbsSong){ return error('No song loaded'); }
    try{
      startPlayback(window.webnbsSong);
    }catch(err){ error('Playback error: ' + err.message); }
  });

  stopBtn.addEventListener('click', ()=>{
    stopPlayback();
  });

  // MIDI setup
  let midiAccess = null;
  let selectedOutput = null;
  let scheduledTimeouts = [];
  let activeNotes = [];

  requestMidiBtn.addEventListener('click', async ()=>{
    if(!navigator.requestMIDIAccess){ error('Web MIDI API not available in this browser'); return; }
    try{
      midiAccess = await navigator.requestMIDIAccess();
      populateMidiOutputs();
      info('MIDI access granted');
    }catch(err){ error('MIDI access denied: ' + err.message); }
  });

  midiOutSelect.addEventListener('change', ()=>{
    const id = midiOutSelect.value;
    selectedOutput = midiAccess && midiAccess.outputs.get(id) || null;
    info('Selected MIDI output: ' + (selectedOutput ? selectedOutput.name : 'none'));
  });

  function populateMidiOutputs(){
    while(midiOutSelect.firstChild) midiOutSelect.removeChild(midiOutSelect.firstChild);
    for(const out of midiAccess.outputs.values()){
      const opt = document.createElement('option');
      opt.value = out.id; opt.textContent = out.name || out.manufacturer || out.id;
      midiOutSelect.appendChild(opt);
    }
    if(midiOutSelect.options.length>0) midiOutSelect.selectedIndex = 0;
    midiOutSelect.dispatchEvent(new Event('change'));
  }

  function clearScheduled(){
    for(const t of scheduledTimeouts) clearTimeout(t);
    scheduledTimeouts = [];
    // turn off active notes
    for(const n of activeNotes){ if(selectedOutput) selectedOutput.send([0x80, n, 0]); }
    activeNotes = [];
  }

  function stopPlayback(){
    clearScheduled();
    info('Playback stopped');
  }

  function startPlayback(song){
    stopPlayback();
    const tempo = song.tempo || 100; // tempo from parser is already /100
    // seconds per tick heuristic: 60 / (tempo * 20)
    const secondsPerTick = 60/(tempo*20);
    info('Starting playback — tempo: ' + tempo + ', secondsPerTick: ' + secondsPerTick.toFixed(4));

    // collect events from layers
    const events = [];
    for(const layerIndex of Object.keys(song.layers)){
      const layer = song.layers[layerIndex];
      for(const tickStr of Object.keys(layer.notes||{})){
        const tick = Number(tickStr);
        const note = layer.notes[tickStr];
        events.push({tick, note, layerIndex});
      }
    }
    events.sort((a,b)=>a.tick-b.tick);

    const now = performance.now();
    for(const ev of events){
      const when = now + ev.tick * secondsPerTick * 1000;
      const t = setTimeout(()=>{
        playNoteEvent(ev.note);
      }, when - now);
      scheduledTimeouts.push(t);
    }
    info('Scheduled ' + events.length + ' notes');
  }

  function playNoteEvent(note){
    // map NBS key to a MIDI note number (heuristic)
    const midiNote = (note.key || 33) + 12; // shift into audible range
    const velocity = 100;
    if(useMidiCheckbox.checked && selectedOutput){
      try{
        selectedOutput.send([0x90, midiNote, velocity]);
        activeNotes.push(midiNote);
        setTimeout(()=>{ selectedOutput.send([0x80, midiNote, 0]); }, 200);
      }catch(err){ error('MIDI send error: ' + err.message); }
    } else {
      // fallback: simple WebAudio beep
      playBeep(midiNote, 0.18);
    }
  }

  // simple webaudio beep
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function playBeep(midiNote, dur){
    const freq = 440 * Math.pow(2, (midiNote - 69)/12);
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.value = 0.2;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    setTimeout(()=>{ o.stop(); }, dur*1000);
  }

  // helpers
  function id(s){ return document.getElementById(s); }
  function info(s){ appendLog('[info] '+s); }
  function error(s){ appendLog('[error] '+s); }
  function appendLog(s){ logEl.textContent += s + '\n'; logEl.scrollTop = logEl.scrollHeight; }
  function hide(el){ el.style.display='none'; }
  function show(el){ el.style.display='flex'; }
  function updateContinue(){ continueBtn.disabled = !(agreeMain.checked && agreeNonProfit.checked); }

  // Initial UI state
  updateContinue();
  if(!accepted){ show(licenseModal); }
}

