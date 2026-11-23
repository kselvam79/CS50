"""Paints one still page per two lines of the story (25 pages), with Dad's and the boy's
faces as references and a different ethnic look on every page.

usage: gen3.py <out_dir> <faces_dir> [--pages 0,3,7] [--n 2] [--seed0 500]
"""
import os, sys, time
import torch
from PIL import Image, ImageDraw
from diffusers import AutoPipelineForText2Image, LCMScheduler
from diffusers.image_processor import IPAdapterMaskProcessor
from transformers import CLIPVisionModelWithProjection

W, H = 768, 448
args = sys.argv[1:]
out, faces = args[0], args[1]
opt = lambda k, d: args[args.index(k) + 1] if k in args else d
N = int(opt("--n", 2))
SEED0 = int(opt("--seed0", 500))
os.makedirs(out, exist_ok=True)

LOOKS = ["Indian", "African", "Caucasian", "Chinese"]
BATH = "bathroom, bathtub full of bubbles"
BED = "cozy bedroom, bed with patchwork quilt"
# (what is happening, where, what the boy wears)
PAGES = [
    ("father beside the bathtub, toddler sitting in the bubble bath", BATH, "bare shoulders"),
    ("toddler in the bubble bath lifting his little feet out of the foam, father smiling", BATH, "bare shoulders"),
    ("toddler in the bubble bath splashing water, father laughing", BATH, "bare shoulders"),
    ("toddler in the bubble bath holding a rubber duck, bubbles in the air, father smiling", BATH, "bare shoulders"),
    ("father wrapping the toddler in a big white bath towel", "bathroom", "wrapped in a white towel"),
    ("father touching the toddler's nose with one finger", "bathroom", "wearing a white hooded towel"),
    ("father helping the toddler put on pajamas", BED, "blue star pajamas"),
    ("toddler sitting on the bed with one bare foot sticking out, father holding his pajama leg", BED, "blue star pajamas"),
    ("toddler sitting on the bed wiggling his bare feet, father waving at them", BED, "blue star pajamas"),
    ("father lifting the bed sheets, toddler climbing into bed", BED, "blue star pajamas"),
    ("father lying on the bed, toddler sitting beside his head with bare feet near his cheek", BED, "blue star pajamas"),
    ("father holding the toddler's little bare foot and counting the toes", BED, "blue star pajamas"),
    ("father hugging the toddler on the bed", BED, "blue star pajamas"),
    ("father tickling the toddler's bare feet, toddler giggling", BED, "blue star pajamas"),
    ("father and toddler sitting on the bed with bare feet side by side, big feet and tiny feet", BED, "blue star pajamas"),
    ("toddler standing on the bed holding his father's hands", BED, "blue star pajamas"),
    ("father kneeling with open arms, toddler running to him", "front door of a home, hallway", "blue star pajamas"),
    ("father playfully pretending to nibble the toddler's bare toes, toddler laughing", BED, "blue star pajamas"),
    ("father tucking the toddler into bed, warm lamp", BED + ", night", "blue star pajamas"),
    ("father sitting by the bed singing to the toddler tucked in bed", BED + ", night", "blue star pajamas"),
    ("toddler lying in bed under the quilt, father sitting beside him, full moon in the window", BED + ", night", "blue star pajamas"),
    ("father pulling a quilt over the toddler lying in bed", BED + ", night", "blue star pajamas"),
    ("sleepy toddler yawning in bed, father tucking the blanket", BED + ", night", "blue star pajamas"),
    ("toddler asleep in bed, father watching over him, moonlight", BED + ", night", "blue star pajamas"),
    ("father kissing the forehead of the sleeping toddler in bed, moonlight", BED + ", night", "blue star pajamas"),
]
NEG = ("photo, photorealistic, teenager, older child, schoolboy, young man, boyish father, two children, two men, "
       "extra arms, extra hands, extra people, deformed, text, watermark")


def prompt(i):
    look = LOOKS[i % 4]
    act, where, wear = PAGES[i]
    return (f"children's book illustration, a 40 year old {look} father with gray temples in a light blue t-shirt on the left, "
            f"his tiny chubby 3 year old {look} toddler son on the right, {wear}, {act}, {where}")


sel = [int(x) for x in opt("--pages", ",".join(map(str, range(len(PAGES))))).split(",")]
t0 = time.time()
enc = CLIPVisionModelWithProjection.from_pretrained("h94/IP-Adapter", subfolder="models/image_encoder", torch_dtype=torch.float32)
pipe = AutoPipelineForText2Image.from_pretrained("Lykon/dreamshaper-7", image_encoder=enc, torch_dtype=torch.float32, safety_checker=None)
pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
pipe.load_lora_weights("latent-consistency/lcm-lora-sdv1-5")
pipe.fuse_lora()
pipe.load_ip_adapter("h94/IP-Adapter", subfolder="models", weight_name="ip-adapter-plus-face_sd15.bin")
pipe.set_ip_adapter_scale([[0.5, 0.5]])
print("loaded in %.0fs" % (time.time() - t0), flush=True)

dad_face = Image.open(os.path.join(faces, "dad.png")).convert("RGB")
kid_face = Image.open(os.path.join(faces, "kid.png")).convert("RGB")
left = Image.new("L", (W, H), 0); ImageDraw.Draw(left).rectangle([0, 0, W // 2 + 40, H], fill=255)
right = Image.new("L", (W, H), 0); ImageDraw.Draw(right).rectangle([W // 2 - 40, 0, W, H], fill=255)
masks = IPAdapterMaskProcessor().preprocess([left, right], height=H, width=W)
masks = [masks.reshape(1, masks.shape[0], masks.shape[2], masks.shape[3])]

for i in sel:
    for s in range(N):
        f = f"{out}/p{i:02d}_{SEED0 + s}.png"
        if os.path.exists(f):
            continue
        t = time.time()
        img = pipe(prompt=prompt(i), negative_prompt=NEG, num_inference_steps=6, guidance_scale=1.8, width=W, height=H,
                   generator=torch.manual_seed(SEED0 + s + 17 * i), ip_adapter_image=[[dad_face, kid_face]],
                   cross_attention_kwargs={"ip_adapter_masks": masks}).images[0]
        img.save(f)
        print(i, s, "%.0fs" % (time.time() - t), flush=True)
