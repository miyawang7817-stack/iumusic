// 从 iTunes 官方接口抓取 IU 歌曲的 30 秒试听，拼成演示视频配乐。
// 只有 GitHub Actions 机器（可联网）能跑；沙盒网络到不了 iTunes。
// 用法: node demo/soundtrack.mjs <输出目录>
import fs from 'fs';

const OUT = process.argv[2] || 'demo';
// 优先挑最出圈、最适合做 BGM 的曲目；命中前两首即用于交叉淡入
const WANT = ['LILAC', 'Blueming', 'Celebrity', 'eight', 'Palette', 'Through the Night', 'Good Day', 'Love wins all'];

async function find(term) {
  const q = encodeURIComponent('IU ' + term);
  const url = `https://itunes.apple.com/search?term=${q}&country=KR&media=music&limit=15`;
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error('http ' + r.status);
  const d = await r.json();
  const hit = d.results.find((x) => /(^|\W)IU(\W|$)|아이유/i.test(x.artistName || '') && x.previewUrl)
           || d.results.find((x) => x.previewUrl);
  return hit ? { want: term, title: hit.trackName, artist: hit.artistName, url: hit.previewUrl } : null;
}

const picked = [];
for (const w of WANT) {
  if (picked.length >= 2) break;
  try {
    const h = await find(w);
    if (h && !picked.some((p) => p.title === h.title)) {
      picked.push(h);
      console.log(`picked "${w}" -> ${h.artist} — ${h.title}`);
    } else {
      console.log(`skip "${w}" (no IU preview)`);
    }
  } catch (e) { console.error(`fail "${w}": ${e.message}`); }
}

if (picked.length === 0) { console.error('NO IU PREVIEW FOUND — will fall back to lo-fi'); process.exit(1); }

for (let i = 0; i < picked.length; i++) {
  const res = await fetch(picked[i].url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(`${OUT}/preview${i + 1}.m4a`, buf);
  console.log(`saved preview${i + 1}.m4a (${(buf.length / 1024 | 0)} KB) = ${picked[i].title}`);
}
fs.writeFileSync(`${OUT}/soundtrack.json`, JSON.stringify(picked.map((p) => ({ artist: p.artist, title: p.title })), null, 2));
console.log('OK IU previews:', picked.length);
