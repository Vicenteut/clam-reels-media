// Capture test (does not touch skill/): render the same page with three capture paths and compare.
//   node tools/capture-test.mjs            → build/cap_jpeg.mp4, build/cap_png.mp4, build/cap_master.mkv (lossless RGB)
// jpeg  = what reel.mjs does today: canvas.toDataURL('image/jpeg', 0.92) → mjpeg pipe → x264 crf 16
// png   = canvas.toDataURL('image/png') → png pipe → x264 crf 16 (same encoder settings)
// master= png → FFV1 RGB (lossless), the reference both are measured against
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url)), P = path.resolve(HERE, '..'), SKILL = path.resolve(P, '../../skill');
const { serve } = await import(pathToFileURL(path.join(SKILL, 'tools/serve.mjs')).href);
const { launch } = await import(pathToFileURL(path.join(SKILL, 'tools/browser.mjs')).href);

const { server, url } = await serve(P, 'classic');
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(url + '/index.html'); await page.waitForFunction(() => window.READY !== undefined); await page.evaluate(() => window.READY);
const dur = await page.evaluate(() => window.DURATION), fps = 30, n = Math.round(dur * fps);
const enc = (args, out) => { const p = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args, path.join(P, 'build', out)], { stdio: ['pipe', 'inherit', 'inherit'] }); return { p, done: new Promise(r => p.on('close', r)) }; };
const x264 = ['-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16'];
const J = enc(['-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', '30', '-i', '-', ...x264], 'cap_jpeg.mp4');
const Pn = enc(['-f', 'image2pipe', '-c:v', 'png', '-framerate', '30', '-i', '-', ...x264], 'cap_png.mp4');
const M = enc(['-f', 'image2pipe', '-c:v', 'png', '-framerate', '30', '-i', '-', '-c:v', 'ffv1', '-pix_fmt', 'bgr0'], 'cap_master.mkv');
const tm = { jpeg: 0, png: 0 }, write = (s, b) => new Promise(r => s.p.stdin.write(b) ? r() : s.p.stdin.once('drain', r));
for (let i = 0; i < n; i++) {
  await page.evaluate(t => window.renderAt(t), i / fps);
  let t0 = Date.now();
  const jb = Buffer.from(await page.evaluate(() => document.getElementById('c').toDataURL('image/jpeg', 0.92).split(',')[1]), 'base64'); tm.jpeg += Date.now() - t0; t0 = Date.now();
  const pb = Buffer.from(await page.evaluate(() => document.getElementById('c').toDataURL('image/png').split(',')[1]), 'base64'); tm.png += Date.now() - t0;
  await write(J, jb); await write(Pn, pb); await write(M, pb);
  if (i % 60 === 0) process.stdout.write(`${i}/${n} `);
}
for (const s of [J, Pn, M]) s.p.stdin.end();
await Promise.all([J.done, Pn.done, M.done]);
console.log(`\ncapture ms per frame: jpeg ${(tm.jpeg / n).toFixed(1)}, png ${(tm.png / n).toFixed(1)}`);
await browser.close(); server.close();
