"""Paints the storybook pages with Dad's and the boy's faces as references.

SD1.5 (dreamshaper-7) + LCM-LoRA for speed on CPU + IP-Adapter plus-face with one face
reference per side of the picture. The first page of a scene is text-to-image; later pages of
the same scene are image-to-image from that scene's chosen page so the room stays the same.

usage: gen2.py <out_dir> <faces_dir> <page[,page...]> [--from <chosen_page.png>] [--n 4]
"""
import os, sys, time
import torch
from PIL import Image, ImageDraw
from diffusers import AutoPipelineForText2Image, AutoPipelineForImage2Image, LCMScheduler
from diffusers.image_processor import IPAdapterMaskProcessor
from transformers import CLIPVisionModelWithProjection

W, H = 768, 448
args = sys.argv[1:]
out, faces, pages = args[0], args[1], args[2].split(",")
src = args[args.index("--from") + 1] if "--from" in args else None
N = int(args[args.index("--n") + 1]) if "--n" in args else 4
os.makedirs(out, exist_ok=True)

# ethnic look per scene; Dad and son always share it
LOOK = {"bath": "Indian", "towel": "African", "pjs": "Caucasian", "toes": "Chinese", "song": "Indian", "night": "African"}
SCENE = {"bath1": "bath", "bath2": "bath", "towel": "towel", "pjs1": "pjs", "pjs2": "pjs", "toes1": "toes", "toes2": "toes",
         "toes3": "toes", "toes4": "toes", "song1": "song", "song2": "song", "night": "night", "title": "night"}
STYLE = ", storybook watercolor illustration, warm cozy light"
NEG = "extra arms, extra hands, extra legs, extra people, two children, two men, deformed, ugly, text, watermark"


def dad(look, top):
    return f"a {look} dad on the left, short dark hair graying at the temples, {top}"


def kid(look):
    return f"a small {look} 3 year old toddler boy on the right, short dark hair, big smile"


def prompt(page):
    look = LOOK[SCENE[page]]
    bath_room = "white bathtub, bubbles, rubber duck, cozy bathroom"
    bed_room = "small bed with a patchwork quilt, warm lamp, moon in the window, cozy bedroom"
    P = {
        "bath1": f"{dad(look, 'light blue shirt')} kneeling by the tub, {kid(look)} shirtless in a bubble bath with foam up to his chest, {bath_room}",
        "bath2": f"{dad(look, 'light blue shirt')} laughing, {kid(look)} shirtless in a bubble bath lifting his bare feet out of the foam, {bath_room}",
        "towel": f"{dad(look, 'light blue shirt')} holding {kid(look)} wrapped in a hooded bath towel, cozy bathroom",
        "pjs1": f"{dad(look, 'gray pajama top')} helping {kid(look)} put on star pajamas, sitting on a rug, {bed_room}",
        "pjs2": f"{dad(look, 'gray pajama top')} tugging a star pajama leg, {kid(look)} with one bare foot popping out of the pajama cuff, {bed_room}",
        "toes1": f"{dad(look, 'gray pajama top')} kissing the bare toes of {kid(look)} in star pajamas lying on the bed, {bed_room}",
        "toes2": f"{dad(look, 'gray pajama top')} tickling the bare feet of {kid(look)} in star pajamas, both laughing, {bed_room}",
        "toes3": f"{dad(look, 'gray pajama top')} and {kid(look)} in star pajamas sitting on the bed comparing big feet and little feet, {bed_room}",
        "toes4": f"{dad(look, 'gray pajama top')} playfully nibbling the bare toes of {kid(look)} in star pajamas, boy laughing, {bed_room}",
        "song1": f"{dad(look, 'gray pajama top')} sitting on the bed singing softly to {kid(look)} tucked under the quilt, {bed_room}",
        "song2": f"{dad(look, 'gray pajama top')} holding the little bare foot of sleepy {kid(look)} tucked under the quilt, {bed_room}",
        "night": f"{dad(look, 'gray pajama top')} kissing the forehead of {kid(look)} asleep under the quilt, dim lamp, {bed_room}",
        "title": f"empty {bed_room}, tiny bare feet peeking from under the quilt, no people",
    }
    return P[page] + STYLE


t0 = time.time()
enc = CLIPVisionModelWithProjection.from_pretrained("h94/IP-Adapter", subfolder="models/image_encoder", torch_dtype=torch.float32)
pipe = AutoPipelineForText2Image.from_pretrained("Lykon/dreamshaper-7", image_encoder=enc, torch_dtype=torch.float32, safety_checker=None)
pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
pipe.load_lora_weights("latent-consistency/lcm-lora-sdv1-5")
pipe.fuse_lora()
pipe.load_ip_adapter("h94/IP-Adapter", subfolder="models", weight_name="ip-adapter-plus-face_sd15.bin")
pipe.set_ip_adapter_scale([[0.55, 0.55]])
i2i = AutoPipelineForImage2Image.from_pipe(pipe)
print("loaded in %.0fs" % (time.time() - t0), flush=True)

dad_face = Image.open(os.path.join(faces, "dad.png")).convert("RGB")
kid_face = Image.open(os.path.join(faces, "kid.png")).convert("RGB")
left = Image.new("L", (W, H), 0); ImageDraw.Draw(left).rectangle([0, 0, W // 2 + 40, H], fill=255)
right = Image.new("L", (W, H), 0); ImageDraw.Draw(right).rectangle([W // 2 - 40, 0, W, H], fill=255)
masks = IPAdapterMaskProcessor().preprocess([left, right], height=H, width=W)
masks = [masks.reshape(1, masks.shape[0], masks.shape[2], masks.shape[3])]
base = Image.open(src).convert("RGB").resize((W, H)) if src else None

for page in pages:
    p = prompt(page)
    nopeople = page == "title"
    for seed in range(N):
        f = f"{out}/{page}_{seed}.png"
        if os.path.exists(f):
            continue
        t = time.time()
        g = torch.manual_seed(300 + seed)
        kw = dict(prompt=p, negative_prompt=NEG, num_inference_steps=6, guidance_scale=1.6, generator=g)
        if not nopeople:
            kw.update(ip_adapter_image=[[dad_face, kid_face]], cross_attention_kwargs={"ip_adapter_masks": masks})
        else:
            pipe.set_ip_adapter_scale([[0.0, 0.0]])
            kw.update(ip_adapter_image=[[dad_face, kid_face]])
        if base is not None:
            img = i2i(image=base, strength=0.55, **kw).images[0]
        else:
            img = pipe(width=W, height=H, **kw).images[0]
        if nopeople:
            pipe.set_ip_adapter_scale([[0.55, 0.55]])
        img.save(f)
        print(page, seed, "%.0fs" % (time.time() - t), flush=True)
