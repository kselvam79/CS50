"""Narrate every line of story.json in a cloned voice (Chatterbox).
usage: python clone_lines.py <reference.wav> <project_dir>
Writes tools/cache/clone/<md5>.wav for each line (skips ones already made)."""
import json, os, sys, hashlib, time
import torch, torchaudio
from chatterbox.tts import ChatterboxTTS

ref, proj = sys.argv[1], sys.argv[2]
out = os.path.join(proj, "tools", "cache", "clone")
os.makedirs(out, exist_ok=True)
torch.set_num_threads(4)
m = ChatterboxTTS.from_pretrained(device="cpu")
story = json.load(open(os.path.join(proj, "story.json")))
lines = [(st.get("song", False), l) for st in story["stanzas"] for l in st["lines"]]
for i, (song, text) in enumerate(lines):
    p = os.path.join(out, hashlib.md5(text.encode()).hexdigest() + ".wav")
    if os.path.exists(p):
        continue
    t0 = time.time()
    speak = text.replace("tozies", "toesies").replace("Tozies", "Toesies").replace("tozy", "toesy")
    expect = len(text) / 14.0  # rough seconds at a calm pace
    for attempt in range(4):
        torch.manual_seed(1234 + i + 1000 * attempt)
        wav = m.generate(speak, audio_prompt_path=ref, exaggeration=0.4 if song else 0.5, cfg_weight=0.5)
        a = wav[0].abs()
        loud = (a > 0.02).nonzero()
        span = (loud[-1] - loud[0]).item() / m.sr if len(loud) else 0
        if 0.5 * expect < span < 2.0 * expect:
            break
        print(f"  retry {attempt + 1}: span {span:.1f}s vs ~{expect:.1f}s", flush=True)
    torchaudio.save(p, wav, m.sr)
    print(f"{i + 1}/{len(lines)} {time.time() - t0:.0f}s {text}", flush=True)
print("done")
