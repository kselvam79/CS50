"""Cuts the best takes out of Dad's own recording (plus the three clips in his son's voice),
cleans them, and writes one file per story line into tools/cache/clone/ for build_audio.py
(voice "clone").

usage: own_voice.py <clips_dir> <project_dir>
"""
import hashlib, json, os, subprocess, sys
import numpy as np, soundfile as sf

CLIPS, PROJ = sys.argv[1], sys.argv[2]
SR = 24000
D, HI, STOP, WHY = "wyntre-lea-dr-10.mp3", "son-hi-daddy-hi.mp3", "son-dont-ever-stop.mp3", "son-why-tosies.mp3"
# (stanza, line): list of (file, start, end) pieces, in seconds of the source recording
CUTS = {
    (0, 0): [(D, 1.68, 7.3)], (0, 1): [(D, 7.52, 11.6)], (0, 2): [(D, 12.54, 16.2)], (0, 3): [(D, 16.42, 18.6), (HI, 0, 9)],
    (1, 0): [(D, 22.8, 27.6)], (1, 1): [(D, 27.83, 32.1)], (1, 2): [(D, 32.38, 36.7)], (1, 3): [(D, 36.96, 39.1), (STOP, 0, 9)],
    (2, 0): [(D, 58.62, 63.75)], (2, 1): [(D, 63.92, 67.3)], (2, 2): [(D, 67.54, 71.4)], (2, 3): [(D, 71.66, 76.7)],
    (3, 0): [(D, 76.96, 81.3)], (3, 1): [(D, 81.48, 85.2)], (3, 2): [(D, 85.56, 89.5)], (3, 3): [(D, 89.82, 95.0)],
    (4, 0): [(D, 103.26, 107.1)], (4, 1): [(D, 107.36, 111.2)], (4, 2): [(D, 112.26, 115.9)], (4, 3): [(D, 116.14, 120.4)],
    (5, 0): [(D, 121.54, 125.8)], (5, 1): [(D, 126.16, 130.6)], (5, 2): [(D, 132.26, 136.0)], (5, 3): [(D, 136.24, 140.4)],
    (6, 0): [(D, 142.16, 145.9)], (6, 1): [(D, 146.12, 149.5)], (6, 2): [(D, 150.4, 153.9)], (6, 3): [(D, 154.08, 157.4)],
    (7, 0): [(WHY, 0, 9)], (7, 1): [(D, 167.05, 171.6)], (7, 2): [(D, 173.72, 177.2)], (7, 3): [(D, 177.38, 181.4)],
    (8, 0): [(D, 187.68, 191.45)], (8, 1): [(D, 191.62, 195.0)], (8, 2): [(D, 200.76, 203.75)], (8, 3): [(D, 203.96, 208.0)],
    (9, 0): [(D, 217.72, 221.0)], (9, 1): [(D, 221.24, 225.0)], (9, 2): [(D, 226.2, 230.12)], (9, 3): [(D, 230.3, 233.2)],
    (10, 0): [(D, 235.18, 238.9)], (10, 1): [(D, 239.1, 242.5)], (10, 2): [(D, 244.42, 247.5)], (10, 3): [(D, 247.7, 251.4)],
    (11, 0): [(D, 252.88, 256.9)], (11, 1): [(D, 257.18, 260.5)], (11, 2): [(D, 263.18, 266.9)], (11, 3): [(D, 267.2, 270.4)],
    (12, 0): [(D, 270.7, 274.4)], (12, 1): [(D, 274.58, 278.6)],
}


def load(name):
    # light clean-up: remove rumble and steady room hiss
    wav = os.path.join(CLIPS, name + ".clean.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", os.path.join(CLIPS, name), "-ac", "1", "-ar", str(SR),
                    "-af", "highpass=f=70,afftdn=nr=10:nf=-45", wav], check=True)
    a, _ = sf.read(wav)
    return a


src = {n: load(n) for n in (D, HI, STOP, WHY)}
rms = lambda a: float(np.sqrt(np.mean(a[np.abs(a) > 0.01] ** 2))) if np.any(np.abs(a) > 0.01) else 1e-3
TARGET = 0.11


def piece(name, a0, b0):
    a = src[name][max(0, int((a0 - 0.12) * SR)): int(b0 * SR)]
    loud = np.where(np.abs(a) > 0.012)[0]
    a = a[max(0, loud[0] - int(0.05 * SR)): loud[-1] + int(0.22 * SR)]
    a = a * (TARGET / rms(a))
    f = int(0.02 * SR)
    a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
    return a


story = json.load(open(os.path.join(PROJ, "story.json")))
out = os.path.join(PROJ, "tools", "cache", "clone")
os.makedirs(out, exist_ok=True)
for si, st in enumerate(story["stanzas"]):
    for li, text in enumerate(st["lines"]):
        parts = [piece(*c) for c in CUTS[(si, li)]]
        gap = np.zeros(int(0.18 * SR))
        a = parts[0]
        for p in parts[1:]:
            a = np.concatenate([a, gap, p])
        a = np.clip(a, -0.98, 0.98)
        sf.write(os.path.join(out, hashlib.md5(text.encode()).hexdigest() + ".wav"), a, SR)
        print(si, li, "%.1fs" % (len(a) / SR), text[:50])
