"""Build the Bring the Spring tree animation from the original PNG frames."""

from pathlib import Path
from PIL import Image

SOURCE = Path(r"E:\工作\斯芬克\学生work\王云茜\Assets\Animation\tree\starTree")
OUTPUT = Path(__file__).resolve().parents[1] / "assets" / "star-tree-shake-drop.webp"
STILL = OUTPUT.with_name("star-tree-still.webp")

paths = [*sorted((SOURCE / "shake").glob("shake_[0-9]*.png")),
         *sorted((SOURCE / "drop").glob("drop_[0-9]*.png"))]
frames = []
for path in paths:
    with Image.open(path) as source:
        frames.append(source.resize((600, 601), Image.Resampling.LANCZOS).convert("RGBA"))

durations = [47] * len(frames)  # 42 source frames play in about two seconds.
frames[0].save(OUTPUT, format="WEBP", save_all=True, append_images=frames[1:],
               duration=durations, loop=1, quality=85, method=6)
frames[0].save(STILL, format="WEBP", quality=85, method=6)
print(f"Saved {len(frames)} frames to {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)")
