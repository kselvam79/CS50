"""Builds the narration, an original music-box lullaby and a few sound effects,
then writes public/audio.wav and src/timing.json (when each line is spoken).

usage: python build_audio.py <kokoro_dir> <project_dir> [voice]
"""
import json, sys, os, hashlib
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

KDIR, PROJ = sys.argv[1], sys.argv[2]
VOICE = sys.argv[3] if len(sys.argv) > 3 else "am_michael"
SR = 24000

story = json.load(open(os.path.join(PROJ, "story.json")))
k = None if VOICE == "clone" else Kokoro(f"{KDIR}/kokoro-v1.0.onnx", f"{KDIR}/voices-v1.0.bin")
cache = os.path.join(PROJ, "tools", "cache")
os.makedirs(cache, exist_ok=True)


def say(text, speed):
    if VOICE == "clone":
        a, sr = sf.read(os.path.join(cache, "clone", hashlib.md5(text.encode()).hexdigest() + ".wav"))
        if sr != SR:  # resample (linear is fine for speech at these rates)
            x = np.arange(int(len(a) * SR / sr)) * sr / SR
            a = np.interp(x, np.arange(len(a)), a)
        idx = np.where(np.abs(a) > 0.01)[0]
        a = a[max(0, idx[0] - 600): idx[-1] + 1800]
        return a / max(1e-6, np.abs(a).max()) * 0.8
    key = f"{VOICE}_{speed}_{hashlib.md5(text.encode()).hexdigest()}.wav"
    p = os.path.join(cache, key)
    if os.path.exists(p):
        a, _ = sf.read(p)
        return a
    a, sr = k.create(text, voice=VOICE, speed=speed, lang="en-us")
    assert sr == SR
    # trim silence at the ends
    idx = np.where(np.abs(a) > 0.01)[0]
    a = a[max(0, idx[0] - 600): idx[-1] + 1800]
    sf.write(p, a, SR)
    return a


# ---------- timeline ----------
TITLE = 7.0
PAGE_TURN = 2.4
t = TITLE
lines_out, stanzas_out, scenes = [], [], []
voice_track = []  # (start_sec, samples)
prev_scene = None
for si, st in enumerate(story["stanzas"]):
    song, ending = st.get("song", False), st.get("ending", False)
    if st["scene"] != prev_scene:
        if prev_scene is not None:
            t += PAGE_TURN
        scenes.append({"scene": st["scene"], "start": round(t, 3)})
        t += 1.2  # let the new picture land before reading
        prev_scene = st["scene"]
    else:
        t += 0.6
    s_start = t
    speed = 0.8 if song else (0.78 if ending else 0.88)
    gap = 0.8 if song else (1.2 if ending else 0.42)
    for li, line in enumerate(st["lines"]):
        a = say(line, speed)
        dur = len(a) / SR
        voice_track.append((t, a))
        lines_out.append({"stanza": si, "line": li, "start": round(t, 3), "end": round(t + dur, 3), "text": line})
        t += dur + gap
    t += 0.8 if not ending else 5.5
    stanzas_out.append({"start": round(s_start, 3), "end": round(t, 3), "scene": st["scene"]})

TOTAL = t + 1.0
for i, sc in enumerate(scenes):
    sc["end"] = round(scenes[i + 1]["start"] if i + 1 < len(scenes) else TOTAL, 3)

n = int(TOTAL * SR)
voice = np.zeros(n)
for start, a in voice_track:
    i = int(start * SR)
    voice[i:i + len(a)] += a[: n - i]

# ---------- music box lullaby (original) ----------
tt = np.arange(n) / SR
music = np.zeros(n)
BPM = 66
beat = 60 / BPM
bar = 3 * beat


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


def bell(freq, dur, amp):
    m = np.arange(int(dur * SR)) / SR
    env = np.exp(-m * 2.6) * (1 - np.exp(-m * 400))
    w = (np.sin(2 * np.pi * freq * m) + 0.35 * np.sin(2 * np.pi * freq * 2.0 * m) * np.exp(-m * 3)
         + 0.12 * np.sin(2 * np.pi * freq * 3.01 * m) * np.exp(-m * 6) + 0.05 * np.sin(2 * np.pi * freq * 4.2 * m) * np.exp(-m * 9))
    return amp * env * w


def pad(freqs, dur, amp):
    m = np.arange(int(dur * SR)) / SR
    env = np.minimum(1, m / 0.9) * np.minimum(1, (dur - m) / 0.9)
    w = sum(np.sin(2 * np.pi * f * m) + 0.2 * np.sin(2 * np.pi * f * 2 * m + 0.3) for f in freqs)
    return amp * env * w / len(freqs)


def add(sig, at):
    i = int(at * SR)
    if i >= n:
        return
    music[i:i + len(sig)] += sig[: n - i]


# F major. Chords as midi roots; melody as scale degrees per bar (3 beats, 0 = rest)
F = 65
chords = {"F": [53, 57, 60], "Dm": [50, 53, 57], "Bb": [46, 53, 58], "C": [48, 52, 55], "Am": [45, 52, 57], "Gm": [43, 50, 55]}
prog = ["F", "Dm", "Bb", "C", "F", "Am", "Bb", "C", "Dm", "Am", "Bb", "F", "Gm", "C", "F", "F"]
scale = [0, 2, 4, 5, 7, 9, 11]


def deg(d):  # scale degree (1-based, can exceed 7) -> midi
    d -= 1
    return F + 12 * (d // 7) + scale[d % 7]


melody = [[5, 3, 1], [6, 5, 3], [4, 6, 8], [7, 5, 0],
          [5, 3, 1], [3, 5, 6], [4, 2, 4], [5, 0, 0],
          [6, 5, 3], [3, 1, 3], [4, 6, 5], [3, 0, 1],
          [2, 4, 6], [5, 4, 2], [1, 3, 5], [1, 0, 0]]
pos = 0.6
i = 0
while pos < TOTAL - 4:
    b = i % 16
    ch = chords[prog[b]]
    add(pad([midi(m) for m in ch], bar + 0.8, 0.05), pos)
    add(bell(midi(ch[0] - 12 + 12), 2.2, 0.06), pos)
    for j, d in enumerate(melody[b]):
        if d:
            add(bell(midi(deg(d) + 12), 2.4, 0.11), pos + j * beat)
    pos += bar
    i += 1

# duck music under the voice
envv = np.convolve(np.abs(voice), np.ones(int(0.25 * SR)) / int(0.25 * SR), "same")
speaking = np.clip(envv / 0.02, 0, 1)
k_s = int(0.6 * SR)
speaking = np.convolve(speaking, np.ones(k_s) / k_s, "same")
duck = 1 - 0.55 * np.clip(speaking * 1.5, 0, 1)
music *= duck
# fade in / out
music *= np.clip(tt / 2.5, 0, 1) * np.clip((TOTAL - tt) / 5, 0, 1)

# ---------- sound effects ----------
rng = np.random.default_rng(7)
sfx = np.zeros(n)


def addfx(sig, at):
    i = int(at * SR)
    sfx[i:i + len(sig)] += sig[: n - i]


def splash(dur=0.7, amp=0.18):
    m = np.arange(int(dur * SR)) / SR
    noise = rng.standard_normal(len(m))
    # crude low-pass by moving average, bright attack
    lp = np.convolve(noise, np.ones(6) / 6, "same")
    return amp * lp * np.exp(-m * 6) * (1 - np.exp(-m * 200))


def pop(freq=900, amp=0.25):
    m = np.arange(int(0.12 * SR)) / SR
    f = freq * np.exp(-m * 18) + 200
    return amp * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-m * 30)


def chime(amp=0.07):
    out = np.zeros(int(1.6 * SR))
    for j, m in enumerate([84, 88, 91, 96]):
        s = bell(midi(m), 1.2, amp)
        o = int(j * 0.07 * SR)
        out[o:o + len(s)] += s[: len(out) - o]
    return out


bath0 = scenes[0]["start"]
for x in [0.2, 0.9, 1.5]:
    addfx(splash(), bath0 + x)
for ln in lines_out:
    if "bubbles go pop" in ln["text"]:
        for x in [0.0, 0.25, 0.4, 0.7]:
            addfx(pop(1200 + 300 * rng.random(), 0.12), ln["end"] - 0.2 + x)
    if ln["text"].startswith("Pop!"):
        addfx(pop(800, 0.3), ln["start"] - 0.05)
        addfx(chime(), ln["start"] + 0.1)
    if ln["text"].startswith("Then out with a whoosh"):
        m = np.arange(int(0.8 * SR)) / SR
        addfx(0.12 * np.convolve(rng.standard_normal(len(m)), np.ones(20) / 20, "same") * np.sin(np.pi * m / 0.8) * 4, ln["start"] - 0.5)
for sc in scenes[1:]:  # page-turn swish
    m = np.arange(int(0.9 * SR)) / SR
    swish = np.convolve(rng.standard_normal(len(m)), np.ones(30) / 30, "same") * np.sin(np.pi * m / 0.9) ** 2
    addfx(0.5 * swish, sc["start"] - 1.6)

mix = voice * 1.0 + music * 1.0 + sfx
mix = mix / max(1e-6, np.abs(mix).max()) * 0.89
# make it stereo, music slightly wide
stereo = np.stack([mix, mix], 1)
os.makedirs(os.path.join(PROJ, "public"), exist_ok=True)
sf.write(os.path.join(PROJ, "public", "audio.wav"), stereo.astype(np.float32), SR, subtype="PCM_16")

json.dump({"total": round(TOTAL, 3), "title": TITLE, "pageTurn": PAGE_TURN, "scenes": scenes,
           "stanzas": stanzas_out, "lines": lines_out, "voice": VOICE},
          open(os.path.join(PROJ, "src", "timing.json"), "w"), indent=1)
print("total %.1f s, %d lines, scenes: %s" % (TOTAL, len(lines_out), [(s["scene"], s["start"]) for s in scenes]))
