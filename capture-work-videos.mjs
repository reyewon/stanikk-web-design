// Refresh portfolio films from live sites on macOS 15+. Requires Xcode and ffmpeg.
// Optional slugs: node capture-work-videos.mjs padharo grumpy-monkey
// Review the saved hero and stopping-point frames before deploying new films.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {execFileSync,execFile,spawn} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
const dir=await fs.mkdtemp(join(tmpdir(),'kombu-recordings-'));
const out=fileURLToPath(new URL('./public/videos/work/',import.meta.url));
console.log('Review frames:',dir);
const sites=[['padharo','https://www.padharo.co.uk/?embed=1'],['grumpy-monkey','https://www.grumpy-monkey.co.uk/?embed=1'],['ryanstanikk','https://www.ryanstanikk.co.uk/?embed=1'],['banana-wharf','https://www.bananawharf.co.uk/?embed=1'],['ark-angels','https://arkangelsband.com'],['soleto','https://soleto-website.pages.dev/?embed=1']];
async function prepare(page,url){
 await page.addInitScript(()=>{localStorage.setItem('bw:location','ocean-village');localStorage.setItem('bw:consent','denied');localStorage.setItem('bw:modal-seen','1');});
 const r=await page.goto(url,{waitUntil:'load',timeout:60000});if(!r.ok())throw Error(r.status()+' '+url);
 await page.waitForTimeout(4000);
 await page.addStyleTag({content:`[aria-label="Cookie consent"],[aria-labelledby="marina-modal-title"],.loader,#loader,.popup-backdrop,.popup-modal,[id*="cookie" i],[class*="cookie-banner" i],[class*="cookie-consent" i],.cky-consent-container,.cky-overlay,.cky-modal,.cky-btn-revisit-wrapper,[aria-label="Cookies"],[aria-label="Refurbishment notice"]{display:none!important} html,body{overflow-x:clip!important} html{scrollbar-width:none!important}`});
 await page.evaluate(()=>{document.documentElement.style.overflowY='auto';document.body.style.overflowY='auto';document.querySelectorAll('video').forEach(v=>{v.muted=true;v.play().catch(()=>{});});});
 await page.evaluate(()=>document.fonts.ready);
}
const stops={'padharo':[1000,2600,4200],'grumpy-monkey':[1150,2000],ryanstanikk:[910,2080,2990],'banana-wharf':[1300,2110],'ark-angels':[1100,2180,3040],soleto:[1060,2040,3140]};
const selected=sites.filter(([slug])=>!process.argv[2]||process.argv.slice(2).includes(slug));
if(!selected.length)throw new Error('No matching website slug. Nothing recorded.');
await fs.mkdir(out,{recursive:true});
const recorder=join(dir,'record-window');
execFileSync('xcrun',['swiftc','-parse-as-library',fileURLToPath(new URL('./scripts/record-browser-window.swift',import.meta.url)),'-o',recorder]);
const browser=await chromium.launch({headless:false,args:['--autoplay-policy=no-user-gesture-required','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding','--disable-background-timer-throttling','--window-position=100,100']});
const recordings=[];
for(const [slug,url] of selected){
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const page=await ctx.newPage();
 try{
  await prepare(page,url);
  const cdp=await ctx.newCDPSession(page);
  const {windowId}=await cdp.send('Browser.getWindowForTarget');
  await cdp.send('Browser.setWindowBounds',{windowId,bounds:{width:1442,height:1120}});
  await page.evaluate(slug=>document.title='Kombu recording '+slug,slug);
  await page.bringToFront();
  await page.evaluate(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.race([Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,5000))]);});
  await page.mouse.move(-100,-100);
  await page.evaluate(()=>{if(window.__lenis)window.__lenis.scrollTo(0,{immediate:true,force:true});window.scrollTo({top:0,behavior:'instant'});});
  await page.waitForTimeout(700);
  const initialY=await page.evaluate(()=>Math.round(scrollY));
  if(initialY!==0)throw Error('Page did not settle at its opening: '+initialY);
  const windows=JSON.parse(execFileSync(recorder,[],{encoding:'utf8'}));
  const window=windows.find(w=>w.title==='Kombu recording '+slug);
  if(!window)throw Error('Recording window not found');
  const raw=dir+'/'+slug+'-native.mp4';
  const seconds=4+6.6*stops[slug].length+2;
  const capture=spawn(recorder,[String(window.windowID),raw,'1','87','1440','1000',String(seconds)]);
  let log='',ready;
  const started=new Promise(resolve=>ready=resolve);
  capture.stderr.on('data',chunk=>{log+=chunk;if(log.includes('READY'))ready();});
  const finished=new Promise((resolve,reject)=>{capture.on('error',reject);capture.on('close',code=>code===0?resolve():reject(Error(log)));});
  await Promise.race([started,finished.then(()=>{throw Error('Recorder ended before starting');})]);
  const begin=Date.now();
  await page.waitForTimeout(4000);
  const actual=[];
  for(const [i,target] of stops[slug].entries()){
   await page.evaluate(target=>new Promise(resolve=>{
    const start=performance.now(),from=scrollY;
    const set=y=>window.__lenis?window.__lenis.scrollTo(y,{immediate:true,force:true}):window.scrollTo({top:y,behavior:'instant'});
    function step(now){const t=Math.min(1,(now-start)/3600);const eased=(1-Math.cos(Math.PI*t))/2;set(from+(target-from)*eased);if(t<1)requestAnimationFrame(step);else resolve();}requestAnimationFrame(step);
   }),target);
   await page.waitForTimeout(3000);
   actual.push(await page.evaluate(()=>Math.round(scrollY)));
   // Screenshots during native capture can resize Chromium's recorded surface.
  }
  await page.waitForTimeout(500);
  const tourSeconds=(Date.now()-begin)/1000;
  await finished;
  await page.close();await ctx.close();
  recordings.push({slug,raw,tourSeconds,actual});
  console.log(JSON.stringify({recorded:slug,seconds:tourSeconds,actual}));
 }catch(e){console.error(slug,e.message);await ctx.close();process.exitCode=1;}
}
await browser.close();
await Promise.all(recordings.map(async({slug,raw,tourSeconds,actual})=>{
 const movie=dir+'/'+slug+'.mp4';
 await run('ffmpeg',['-y','-v','error','-i',raw,'-t',String(tourSeconds),'-an','-vf','mpdecimate,minterpolate=fps=60:mi_mode=mci:mc_mode=obmc:me_mode=bidir,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=5','-c:v','libx264','-threads','2','-preset','medium','-crf','24','-r','60','-fps_mode','cfr','-pix_fmt','yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv','-movflags','+faststart',movie]);
 // Check every frame for the uniform grey canvas left by a resized capture surface.
 const {stdout:pixels}=await run('ffmpeg',['-v','error','-i',movie,'-vf','crop=iw/2:ih/2:iw/2:ih/2,scale=8:8','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],{encoding:'buffer',maxBuffer:4*1024*1024});
 for(let i=0;i<pixels.length;i+=192){
  const frame=pixels.subarray(i,i+192);const mean=frame.reduce((a,b)=>a+b,0)/frame.length;
  const variance=frame.reduce((a,b)=>a+(b-mean)**2,0)/frame.length;
  if(mean>40&&mean<85&&variance<6.25)throw Error(slug+' has a grey capture frame at '+(i/192/60).toFixed(3)+'s');
 }
 await run('ffmpeg',['-y','-v','error','-i',movie,'-frames:v','1',dir+'/'+slug+'-first.png']);
 await sharp(dir+'/'+slug+'-first.png').webp({quality:85}).toFile(dir+'/'+slug+'.webp');
 for(const ext of ['mp4','webp'])await fs.copyFile(dir+'/'+slug+'.'+ext,out+'/'+slug+'.'+ext);
 console.log(JSON.stringify({finished:slug,seconds:tourSeconds,actual,framesChecked:pixels.length/192,bytes:(await fs.stat(movie)).size}));
}));
