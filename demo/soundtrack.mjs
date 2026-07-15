// 从 iTunes 官方接口抓取 IU 歌曲的 30 秒试听，拼成演示视频配乐。
// 只有 GitHub Actions 机器（可联网）能跑；沙盒网络到不了 iTunes。
// 用法: node demo/soundtrack.mjs <输出目录>
import fs from 'fs';

const OUT = process.argv[2] || 'demo';
// 顺序即视频里点歌顺序：先 Celebrity 后 LILAC（与画面“点哪首唱哪首”对齐）。
// 每首带若干候选写法，精确匹配曲名，抓不到才容错。
const WANT = [
  { key: 'Celebrity', terms: ['Celebrity'], names: ['celebrity'] },
  { key: 'LILAC', terms: ['LILAC 라일락', '라일락 LILAC', 'LILAC'], names: ['라일락lilac', 'lilac라일락', 'lilac'] },
];

const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9가-힣]/g, '');

async function find(spec) {
  for (const term of spec.terms) {
    const q = encodeURIComponent('IU ' + term);
    const url = `https://itunes.apple.com/search?term=${q}&country=KR&media=music&limit=25`;
    let d;
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!r.ok) throw new Error('http ' + r.status);
      d = await r.json();
    } catch (e) { console.error(`fail "${term}": ${e.message}`); continue; }
    const iu = d.results.filter((x) => (/(^|\W)IU(\W|$)|아이유/i.test(x.artistName || '')) && x.previewUrl);
    const hit = spec.names.map((n) => iu.find((x) => norm(x.trackName) === n)).find(Boolean)
             || iu.find((x) => spec.names.some((n) => norm(x.trackName).includes(n)))
             || iu[0];
    if (hit) return { want: spec.key, title: hit.trackName, artist: hit.artistName, url: hit.previewUrl };
  }
  return null;
}

const picked = [];
for (const spec of WANT) {
  try {
    const h = await find(spec);
    if (h) { picked.push(h); console.log(`picked "${spec.key}" -> ${h.artist} — ${h.title}`); }
    else { console.log(`skip "${spec.key}" (no IU preview)`); }
  } catch (e) { console.error(`fail "${spec.key}": ${e.message}`); }
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
