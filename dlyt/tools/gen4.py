"""Paints the 25 still pages with the OpenAI image model, using the two face photos as
references. The API key is injected by the session's network proxy (never stored here).

usage: gen4.py <out_dir> <faces_dir> [--pages 0,3,7] [--tag a]
"""
import base64, json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

args = sys.argv[1:]
out, faces = args[0], args[1]
opt = lambda k, d: args[args.index(k) + 1] if k in args else d
TAG = opt("--tag", "a")
os.makedirs(out, exist_ok=True)

STYLES = {
    "watercolor": "Warm, soft watercolor children's picture-book illustration.",
    "inkwash": "Loose expressive pen-and-ink line drawing with light watercolor washes: lively scratchy ink lines, lots of white paper showing, a few soft washes of color, witty and warm like a classic British picture book.",
}
STYLE = STYLES[os.environ.get("STYLE", "watercolor")]
LOOKS = ["Indian", "Black African (deep brown skin, short tightly coiled black hair, the father's graying at the temples)", "white Caucasian", "Chinese"]
BATH = "a cozy bathroom with a white bathtub full of bubbles, evening light"
BED = "a cozy bedroom with a small wooden bed and a colorful patchwork quilt, warm lamp light"
NIGHT = "the same cozy bedroom at night, dim warm lamp, full moon in the window"
BATHWEAR = "The boy is in the bubble bath, covered in foam up to his shoulders."
PJ = "The boy wears blue pajamas with yellow stars."
PAGES = [
    ("The father kneels beside the bathtub smiling while the boy sits in the bubble bath with a yellow rubber duck.", BATH, BATHWEAR),
    ("The boy peeks over a big mound of bubbles with a foam hat on his head, and the father looks at him in delight.", BATH, BATHWEAR),
    ("The boy splashes the bubbles with his hands, laughing; the father laughs beside the tub with foam on his nose.", BATH, BATHWEAR),
    ("The boy holds up a yellow rubber duck while soap bubbles float in the air; the father smiles beside the tub.", BATH, BATHWEAR),
    ("The father wraps the boy in a big fluffy white towel and dries his little feet.", "the same cozy bathroom", "The boy is wrapped in a big white towel."),
    ("The father gently touches the tip of the boy's nose with one finger; the boy giggles.", "the same cozy bathroom", "The boy is bundled in a white hooded towel, bare feet peeking out."),
    ("The father helps the boy pull a pajama top over his head.", BED, PJ),
    ("The boy sits on the bed while the father pulls a pajama leg on; one little bare foot pops out of the cuff.", BED, PJ),
    ("The boy sits on the bed wiggling both bare feet in the air; the father waves hello to the toes.", BED, PJ),
    ("The father holds the bed covers open and the boy climbs into bed.", BED, PJ),
    ("The father lies on the bed and the boy lies the other way round, his little bare feet resting by the father's cheek; both laugh.", BED, PJ),
    ("The father holds one of the boy's little bare feet and counts the toes with his finger.", BED, PJ),
    ("The father cuddles the boy's two little bare feet against his chest with a loving smile.", BED, PJ),
    ("The father tickles the boy's bare feet; the boy squirms and giggles on the bed.", BED, PJ),
    ("The father and the boy sit side by side on the bed, legs stretched out, the father's big bare feet next to the boy's tiny bare feet.", BED, PJ),
    ("The boy stands barefoot on the bed holding the father's hands for balance.", BED, PJ),
    ("The father kneels with open arms at the front door of the home as the barefoot boy runs to him.", "a warm hallway by the front door", PJ),
    ("The father playfully pretends to nibble the boy's bare toes; the boy shrieks with laughter.", BED, PJ),
    ("The father tucks the boy into bed and reaches to turn the lamp low.", NIGHT, PJ),
    ("The father sits on the edge of the bed singing softly to the boy, who is tucked under the quilt with his toes peeking out.", NIGHT, PJ),
    ("The boy lies in bed under the quilt, sleepy, with the father sitting beside him and the full moon in the window.", NIGHT, PJ),
    ("The father pulls the patchwork quilt snugly over the boy's little feet.", NIGHT, PJ),
    ("The boy yawns a big sleepy yawn in bed while the father tucks the blanket around him.", NIGHT, PJ),
    ("The boy is fast asleep in bed; the father sits beside him watching over him tenderly.", NIGHT, PJ),
    ("The father kisses the forehead of the sleeping boy.", NIGHT, PJ),
]


def prompt(i):
    look = LOOKS[i % 4]
    act, where, wear = PAGES[i]
    return (
        STYLE + " Wide landscape children's picture-book page. "
        "Exactly two people and no one else: a father and his little son. "
        f"On this page both are {look}: give them both {look} skin tone and ethnic features, clearly father and son. "
        "The father is about 40 years old: keep the face shape, warm smile and short swept-back salt-and-pepper hair "
        "with gray temples from the first photo. He is clearly an adult man and wears a light blue t-shirt. "
        "The son is exactly 3 years old, a small toddler with toddler proportions (about knee-to-hip height of the father): "
        "keep the face shape, big dark eyes, big grin and short side-swept fringe from the second photo. "
        f"{wear} Scene: {act} Setting: {where}. "
        "Anatomy must be correct: two arms and two legs each, five toes per foot. "
        "Keep both faces in the upper two thirds of the picture; the bottom fifth should be calm background. "
        "No text, no letters, no extra people."
    )


def paint(i):
    f = f"{out}/p{i:02d}_{TAG}.png"
    if os.path.exists(f):
        return i, "exists"
    r = subprocess.run(
        ["curl", "-sS", "--max-time", "600", "https://api.openai.com/v1/images/edits",
         "-H", "Authorization: Bearer proxy-injected",
         "-F", "model=gpt-image-2", "-F", f"image[]=@{faces}/dad.png", "-F", f"image[]=@{faces}/kid.png",
         "-F", "size=1536x1024", "-F", "quality=medium", "--form-string", "prompt=" + prompt(i)],
        capture_output=True, text=True)
    try:
        d = json.loads(r.stdout)
        png = base64.b64decode(d["data"][0]["b64_json"])
        open(f, "wb").write(png)
        return i, "ok"
    except Exception:
        return i, (r.stdout or r.stderr)[:300]


sel = [int(x) for x in opt("--pages", ",".join(map(str, range(len(PAGES))))).split(",")]
with ThreadPoolExecutor(3) as ex:
    for i, res in ex.map(paint, sel):
        print(i, res, flush=True)
