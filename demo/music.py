# 视频配乐：60s 温暖 lo-fi（Fmaj7–G6–Em7–Am9，76bpm）——占位配乐，发布前可换成 IU 原曲
import numpy as np, wave

SR = 44100
BPM = 76
BEAT = 60 / BPM
BAR = BEAT * 4
PROG = [
    [53, 57, 60, 64, 69],   # Fmaj7(9)
    [55, 59, 62, 64, 67],   # G6
    [52, 55, 59, 62, 66],   # Em7(9)
    [45, 52, 57, 60, 64],   # Am9
]
LOOPS = 5
DUR = BAR * 4 * LOOPS
N = int(SR * DUR)
t = np.arange(N) / SR
mixL = np.zeros(N); mixR = np.zeros(N)

def f(m): return 440 * 2 ** ((m - 69) / 12)

def tone(freq, dur, amp, attack=0.02, rel=0.6, harm=(1.0, 0.35, 0.12), detune=0.0015):
    n = int(SR * dur)
    tt = np.arange(n) / SR
    env = np.minimum(1, tt / attack) * np.exp(-tt / rel)
    s = np.zeros(n)
    for k, h in enumerate(harm, 1):
        s += h * np.sin(2 * np.pi * freq * k * (1 + detune * np.sin(2 * np.pi * 0.7 * tt)) * tt)
    return amp * env * s

def add(sig, at, pan=0.0):
    i = int(at * SR); j = min(N, i + len(sig)); seg = sig[:j - i]
    gl = np.sqrt(0.5 * (1 - pan)); gr = np.sqrt(0.5 * (1 + pan))
    mixL[i:j] += seg * gl; mixR[i:j] += seg * gr

for loop in range(LOOPS):
    for ci, chord in enumerate(PROG):
        t0 = loop * BAR * 4 + ci * BAR
        # 电钢式和弦：两次轻推（1、3 拍），音符微错峰似手弹
        for hit, hamp in ((0, 0.16), (2 * BEAT, 0.11)):
            for ni, m in enumerate(chord[1:]):
                add(tone(f(m), BEAT * 2.6, hamp * (0.9 - ni * 0.12), attack=0.012 + ni * 0.004, rel=1.5),
                    t0 + hit + ni * 0.028, pan=(ni - 1.5) * 0.25)
        # 低音：根音全小节，八度轻点缀
        add(tone(f(chord[0] - 12), BAR * 0.96, 0.20, attack=0.01, rel=2.6, harm=(1.0, 0.08)), t0)
        add(tone(f(chord[0]), BEAT * 0.9, 0.07, rel=0.5, harm=(1.0, 0.1)), t0 + 3 * BEAT)
        # 顶部星星点点的琶音（后半拍）
        arp = [chord[4] + 12, chord[2] + 12, chord[3] + 12, chord[4] + 12]
        for ai, m in enumerate(arp):
            if (loop + ci + ai) % 3 == 0: continue      # 稀疏一点
            add(tone(f(m), 0.8, 0.045, attack=0.004, rel=0.5, harm=(1.0, 0.2)),
                t0 + (ai + 0.5) * BEAT, pan=0.45 if ai % 2 else -0.45)

# 轻微磁带噪底 + 呼吸起伏
rng = np.random.default_rng(7)
hiss = rng.standard_normal(N) * 0.006
kernel = np.ones(8) / 8
hiss = np.convolve(hiss, kernel, mode='same')
lfo = 0.9 + 0.1 * np.sin(2 * np.pi * t / (BAR * 2))
mixL = (mixL + hiss) * lfo; mixR = (mixR + hiss) * lfo

# 淡入淡出 + 归一化
fade_in = int(1.2 * SR); fade_out = int(3.0 * SR)
envg = np.ones(N); envg[:fade_in] = np.linspace(0, 1, fade_in); envg[-fade_out:] = np.linspace(1, 0, fade_out)
mixL *= envg; mixR *= envg
peak = max(np.abs(mixL).max(), np.abs(mixR).max())
mixL *= 0.82 / peak; mixR *= 0.82 / peak

data = np.empty(N * 2, dtype=np.int16)
data[0::2] = (mixL * 32767).astype(np.int16)
data[1::2] = (mixR * 32767).astype(np.int16)
with wave.open(__import__('sys').argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(data.tobytes())
print('music.wav', round(DUR, 1), 's')
