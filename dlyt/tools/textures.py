import sys, numpy as np
from PIL import Image
out = sys.argv[1]; rng = np.random.default_rng(3); W, H = 1920, 1080
g = rng.normal(128, 38, (H, W)).clip(0, 255).astype(np.uint8)
Image.fromarray(g, 'L').convert('RGB').save(f'{out}/grain.png', optimize=True)
# paper: soft blotches + fibres, mostly white so multiply only tints
def blob(scale):
    small = rng.random((H // scale + 2, W // scale + 2))
    return np.array(Image.fromarray((small * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)) / 255
p = 0.55 * blob(180) + 0.3 * blob(40) + 0.15 * blob(6)
v = 255 - (p - p.min()) / (p.max() - p.min()) * 40
rgb = np.stack([v, v * 0.985, v * 0.95], -1).clip(0, 255).astype(np.uint8)
Image.fromarray(rgb).save(f'{out}/paper.png', optimize=True)
