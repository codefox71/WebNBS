// Basic application glue for Wjnbs — placeholder for nbs.js integration
(function(){
  const logEl = id('log');
  const fileInput = id('fileInput');
  const playBtn = id('playBtn');
  const stopBtn = id('stopBtn');
  const fileNameEl = id('fileName');

  const licenseModal = id('licenseModal');
  const agreeMain = id('agreeMain');
  const agreeNonProfit = id('agreeNonProfit');
  const continueBtn = id('continueBtn');

  // Restore acceptance if previously granted
  const accepted = localStorage.getItem('wjnbs:accepted') === '1';
  if(accepted){ hide(licenseModal); } else { show(licenseModal); }

  agreeMain.addEventListener('change', updateContinue);
  agreeNonProfit.addEventListener('change', updateContinue);
  continueBtn.addEventListener('click', ()=>{
    if(agreeMain.checked && agreeNonProfit.checked){
      localStorage.setItem('wjnbs:accepted','1');
      hide(licenseModal);
      info('Thank you — you may now use Wjnbs.');
    }
  });

  fileInput.addEventListener('change', async (ev)=>{
    const f = ev.target.files && ev.target.files[0];
    if(!f) return;
    fileNameEl.textContent = f.name;
    info('Loaded file: ' + f.name);

    // read file bytes (placeholder — actual NBS parsing via nbs.js expected)
    const arrayBuffer = await f.arrayBuffer();
    info('File size: ' + arrayBuffer.byteLength + ' bytes');

    // If nbs.js is available, parse the buffer (best-effort)
    if(window.NBS && typeof window.NBS.parse === 'function'){
      try{
        window.wjnbsSong = window.NBS.parse(arrayBuffer);
        info('Parsed NBS: ' + (window.wjnbsSong.title||'untitled'));
        playBtn.disabled = false;
        stopBtn.disabled = false;
      }catch(err){
        error('nbs.js parse error: ' + err.message);
        playBtn.disabled = true;
      }
    } else {
      info('nbs.js not available — file held in memory (no playback)');
      window.wjnbsSong = {raw:arrayBuffer};
      playBtn.disabled = true; // disable until nbs integration
      stopBtn.disabled = true;
    }
  });

  playBtn.addEventListener('click', ()=>{
    if(!window.wjnbsSong){ return error('No song loaded'); }
    if(window.NBS && window.NBS.play){
      window.NBS.play(window.wjnbsSong);
      info('Playing via nbs.js.play()');
    } else {
      info('Play requested — nbs.js not present, simulated playback start');
    }
  });

  stopBtn.addEventListener('click', ()=>{
    if(window.NBS && window.NBS.stop){ window.NBS.stop(); info('Stopped via nbs.js.stop()'); }
    else info('Stop requested — nbs.js not present');
  });

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
})();
