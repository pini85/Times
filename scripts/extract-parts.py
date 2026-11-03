"""Cut the reusable ornament pieces out of public/board.png into public/parts/.

Gold pieces get a transparent background (the cream or red behind them is
keyed out), so code can draw the stretchy parts (fills, straight runs) and
place these pieces on top. Run: python3 scripts/extract-parts.py
"""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = np.asarray(Image.open(ROOT / "public/board.png").convert("RGB")).astype(np.float32) / 255
OUT = ROOT / "public/parts"
OUT.mkdir(exist_ok=True)


def hsv(a):
    mx, mn = a.max(-1), a.min(-1)
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = np.maximum(mx - mn, 1e-6)
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, s, mx


def ramp(x, lo, hi):
    return np.clip((x - lo) / (hi - lo), 0, 1)


def key_cream(a):
    """Alpha that hides the pale, low-saturation parchment and keeps gold/red/dark."""
    _, s, v = hsv(a)
    return np.maximum(ramp(s, 0.2, 0.34), ramp(0.84 - v, 0, 0.12))


def key_red(a):
    """Alpha that hides the dark red velvet and keeps the gold."""
    h, s, v = hsv(a)
    goldish = ramp(h, 14, 26) * (1 - ramp(h, 70, 90))
    return np.maximum(goldish * ramp(v, 0.3, 0.45), ramp(0.35 - s, 0, 0.15) * ramp(v, 0.5, 0.7))


def flood(a, seeds):
    """Soft cream alpha, but only for parchment connected to the seed points.

    Pale highlights enclosed by gold stay opaque. seeds: list of (x, y);
    the string "edges" seeds every border pixel.
    """
    soft = key_cream(a)
    open_ = soft < 0.5
    reach = np.zeros_like(open_)
    for sd in seeds:
        if sd == "edges":
            reach[0, :] = reach[-1, :] = True
            reach[:, 0] = reach[:, -1] = True
        else:
            reach[sd[1], sd[0]] = True
    reach &= open_
    while True:
        g = reach.copy()
        g[1:] |= reach[:-1]; g[:-1] |= reach[1:]
        g[:, 1:] |= reach[:, :-1]; g[:, :-1] |= reach[:, 1:]
        g &= open_
        if (g == reach).all():
            break
        reach = g
    # grow one pixel so the soft edge of the background is included
    edge = reach.copy()
    edge[1:] |= reach[:-1]; edge[:-1] |= reach[1:]
    edge[:, 1:] |= reach[:, :-1]; edge[:, :-1] |= reach[:, 1:]
    # tighten the soft edge so faint parchment haze doesn't streak when stretched
    return np.where(edge, ramp(soft, 0.35, 0.75), 1.0).astype(np.float32)


def crop(x0, y0, x1, y1):
    return SRC[y0:y1, x0:x1].copy()


def save(name, rgb, alpha=None):
    if alpha is None:
        alpha = np.ones(rgb.shape[:2], np.float32)
    rgba = np.dstack([rgb, alpha])
    Image.fromarray((rgba * 255).round().astype(np.uint8), "RGBA").save(OUT / name, optimize=True)


# ---- time box frame: 4 corners + 2px of plain edge, used with CSS border-image ----
BX0, BY0, BX1, BY1, C = 692, 456, 992, 740, 66
mid_x, mid_y = 770, 600  # a plain column / row of the frame (no ornament, no text)
w = 2 * C + 2
frame = np.zeros((w, w, 3), np.float32)
src = crop(BX0, BY0, BX1, BY1)
H, W = src.shape[:2]
frame[:C, :C] = src[:C, :C]
frame[:C, -C:] = src[:C, -C:]
frame[-C:, :C] = src[-C:, :C]
frame[-C:, -C:] = src[-C:, -C:]
# plain slices of the frame (averaged over a few pixels to smooth out the
# marble texture, which would otherwise streak when stretched)
col = SRC[BY0:BY1, mid_x - 6:mid_x + 6].mean(1)  # fills top/bottom runs
row = SRC[mid_y - 6:mid_y + 6, BX0:BX1].mean(0)  # fills left/right runs
frame[:C, C:C + 2] = col[:C, None]
frame[-C:, C:C + 2] = col[-C:, None]
frame[C:C + 2, :C] = row[None, :C]
frame[C:C + 2, -C:] = row[None, -C:]
frame[C:C + 2, C:C + 2] = SRC[620, 840]  # plain inside colour, stretched by `fill`
save("box-frame.png", frame, flood(frame, ["edges"]))

# ornaments sitting on the middle of the box's top and bottom edges
o = crop(806, 442, 878, 484); save("box-orn-top.png", o, flood(o, ["edges"]))
o = crop(806, 698, 878, 744); save("box-orn-bottom.png", o, flood(o, ["edges"]))

# ---- banner: two end caps + 2px of plain red middle, used with border-image ----
NX0, NY0, NX1, NY1, CAP = 202, 348, 884, 438, 92
b = crop(NX0, NY0, NX1, NY1)
mid = SRC[NY0:NY1, 296:336].mean(1, keepdims=True)  # averaged so the velvet doesn't streak
banner = np.concatenate([b[:, :CAP], mid, mid, b[:, -CAP:]], axis=1)
save("banner.png", banner, flood(banner, ["edges"]))

# fleur-de-lis that flank the banner text (red keyed out)
f = crop(340, 362, 400, 428); save("fleur-start.png", f, key_red(f))
f = crop(686, 362, 746, 428); save("fleur-end.png", f, key_red(f))

# ---- page frame ----
HEADER_END, FOOTER_START, SIDE = 346, 1260, 102

h = crop(0, 0, 1086, HEADER_END)
save("header.png", h, flood(h, [(543, 200), (543, 340), (130, 340), (956, 340)]))

ft = crop(0, FOOTER_START, 1086, 1448)
# wipe the bottom of the last row of boxes, then key the parchment
ft[: 1364 - FOOTER_START, 106:981] = SRC[1385, 543]
ft[: 1376 - FOOTER_START, 216:871] = SRC[1385, 543]
a = flood(ft, [(543, 60)])
a[: 1364 - FOOTER_START, 98:988] = 0
a[: 1376 - FOOTER_START, 216:871] = 0
save("footer.png", ft, a)


def best_loop(strip, lo, hi, min_p=200):
    """Find a section of the side strip whose top and bottom rows match, so it tiles."""
    g = strip.mean(-1)
    best = None
    for y0 in range(lo, hi - min_p):
        for y1 in range(y0 + min_p, hi):
            d = np.abs(g[y0:y0 + 4] - g[y1:y1 + 4]).mean()
            if best is None or d < best[0]:
                best = (d, y0, y1)
    return best


for name, xs in (("left", slice(0, SIDE)), ("right", slice(1086 - SIDE, 1086))):
    strip = SRC[:, xs]
    d, y0, y1 = best_loop(strip, HEADER_END, FOOTER_START)
    print(name, "loop", y0, y1, "diff", round(float(d), 4))
    lead = strip[HEADER_END:y0]
    loop = strip[y0:y1]
    edge = slice(SIDE - 6, SIDE) if name == "left" else slice(0, 6)
    for part, fname in ((lead, f"side-{name}-lead.png"), (loop, f"side-{name}.png")):
        a = np.ones(part.shape[:2], np.float32)
        a[:, edge] = key_cream(part[:, edge])  # thin parchment sliver at the inner edge
        save(fname, part, a)
