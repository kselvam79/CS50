# Daddy Loves Your Toes: animated bedtime story

A 3½-minute narrated, animated picture book (1920×1080, 30 fps), made with Remotion.

## What's where
- `story.json`: the verses, and which scene each stanza belongs to.
- `tools/build_audio.py`: makes the narration (Kokoro TTS, voice `am_fenrir`), an original music-box lullaby and sound effects. Writes `public/audio.wav` and `src/timing.json`, which records when every line is spoken. All animation cues key off that file.
- `tools/textures.py`: makes the grain and paper overlays in `public/`.
- `src/lib.tsx`: palette, shared characters (Daddy's head, the toddler's head, feet with countable toes, hands), and helpers.
- `src/scenes/`: Bath, Towel, Pjs, Toes (the overhead pose from the photo) and Bedroom (song and goodnight).
- `src/Story.tsx`: page-turn transitions, the title, the read-along text and the soundtrack.

## Rebuild
```
python tools/build_audio.py <kokoro-model-dir> . am_fenrir   # after editing story.json
npx remotion studio src/index.ts                              # preview
npx remotion render src/index.ts DaddyLovesYourToes out/daddy-loves-your-toes.mp4
```
Kokoro model files: `kokoro-v1.0.onnx` and `voices-v1.0.bin` from the kokoro-onnx releases (`pip install kokoro-onnx soundfile`).
Other voices to try: `am_michael`, `bm_george`, `bm_lewis`.
