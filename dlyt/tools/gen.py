import torch, time, sys, os
from diffusers import AutoPipelineForText2Image
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
only = sys.argv[2].split(",") if len(sys.argv) > 2 else None
pipe = AutoPipelineForText2Image.from_pretrained("stabilityai/sd-turbo", torch_dtype=torch.float32)
# keep prompts short: the text encoder only reads ~77 tokens
STYLE = ", storybook watercolor illustration, warm cozy light"
DAD = "an Indian dad with dark hair graying at the temples, gray sweater"
KID = "an Indian 4 year old boy with a dark fringe and a toothy grin"
scenes = {
 "bath1": f"{DAD} kneeling by a bathtub, {KID} in a bubble bath, rubber duck",
 "bath2": f"{KID} in a bubble bath lifting his two bare feet up out of the foam, rubber duck",
 "towel": f"{DAD} holding {KID} wrapped in a hooded bunny-ear bath towel, warm bathroom",
 "pjs1": f"{DAD} helping {KID} put on star pajamas on a bedroom rug, warm lamp",
 "pjs2": f"an Indian 4 year old boy's bare foot popping out of a star pajama pant leg, dad's hands holding the cuff",
 "toes1": f"{DAD} kissing the bare toes of {KID} in star pajamas lying on a bed",
 "toes2": f"{DAD} tickling the bare feet of {KID} in star pajamas, both laughing, bed",
 "toes3": f"a dad's big bare feet next to an Indian 4 year old boy's little bare feet on a quilt, side by side, cozy bedroom",
 "toes4": f"{DAD} playfully nibbling the bare toes of {KID} in star pajamas, boy laughing, bed",
 "song1": f"{DAD} sitting on a small bed singing softly to {KID} tucked under a patchwork quilt, moon in window",
 "song2": f"a dad's hand gently holding a sleepy Indian 4 year old boy's little bare foot on a patchwork quilt, moonlight",
 "night": f"{DAD} alone kissing the forehead of one small sleeping {KID} under a patchwork quilt, dim lamp, moon in window",
}
for name, p in scenes.items():
    if only and name not in only: continue
    for seed in range(6):
        f = f"{out}/{name}_{seed}.png" if not only else f"{out}/{name}_b{seed}.png"
        if os.path.exists(f): continue
        t = time.time()
        img = pipe(prompt=p+STYLE, num_inference_steps=4, guidance_scale=0.0, width=768, height=448, generator=torch.manual_seed(200+seed)).images[0]
        img.save(f); print(name, seed, round(time.time()-t), flush=True)
