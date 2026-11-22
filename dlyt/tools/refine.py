# Upscale the chosen 768x448 pictures to 1920x1080 with an img2img detail pass.
import torch, sys, os
from PIL import Image
from diffusers import AutoPipelineForImage2Image
gen, picks, dst = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(dst, exist_ok=True)
pipe = AutoPipelineForImage2Image.from_pretrained("stabilityai/sd-turbo", torch_dtype=torch.float32)
P = "storybook watercolor illustration, detailed, warm cozy light, dad and little boy"
for line in open(picks):
    name, src = line.split()
    out = f"{dst}/{name}.png"
    if os.path.exists(out): continue
    im = Image.open(f"{gen}/{src}.png" if "/" not in src else f"{os.path.dirname(gen)}/{src}.png").convert("RGB").resize((1280, 736), Image.LANCZOS)
    img = pipe(prompt=P, image=im, num_inference_steps=4, strength=0.3, guidance_scale=0.0, generator=torch.manual_seed(1)).images[0]
    img = img.resize((1920, 1104), Image.LANCZOS).crop((0, 12, 1920, 1092))
    img.save(out); print(name, flush=True)
