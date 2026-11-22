"""Upscales the chosen 768x448 pages to 1920x1080 (Lanczos + mild sharpen; no repainting,
so the faces stay exactly as chosen).

usage: refine.py <gen_dir> <picks.txt> <out_dir>
picks.txt lines: <page> <file-without-extension>
"""
import os, sys
from PIL import Image, ImageFilter

gen, picks, dst = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(dst, exist_ok=True)
for line in open(picks):
    if not line.strip():
        continue
    name, src = line.split()
    im = Image.open(os.path.join(gen, src + ".png")).convert("RGB")
    im = im.resize((1920, 1120), Image.LANCZOS).crop((0, 20, 1920, 1100))
    im = im.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    im.save(os.path.join(dst, name + ".png"))
    print(name, flush=True)
