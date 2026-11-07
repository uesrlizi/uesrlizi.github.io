# -*- coding: utf-8 -*-
"""生成占位 SVG 封面与截图。

用法：python tools/gen_placeholders.py
（在项目根目录运行；重复运行会覆盖旧占位图，不影响真实图片。）

加新作品时：在 WORKS 里加一行 (id, 中文标题, 色相 0-360)，重跑本脚本即可。
有了真实截图后，直接把 SVG 换成 jpg/png 并更新 works.json 里的路径即可。
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# id: (标题, 色相) —— 色相只影响底色，挑一个和作品气质接近的
WORKS = {
    "starfall":            ("星屑远征", 158),
    "echo-cavern":         ("回声洞窟", 210),
    "dissolve-shader":     ("溶解与燃烧着色器", 285),
    "level-toolkit":       ("关卡搭建工具集", 130),
    "installation-echo":   ("交互装置·回声场", 340),
    "course-level-design": ("课程项目·箱庭关卡", 40),
    "armor-rush":          ("装甲疾驰", 25),
    "phase-protocol":      ("相位协议", 195),
    "solar-system-nav":    ("太阳系航行模拟器", 250),
}

SVG = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl({hue},40%,18%)"/>
      <stop offset="1" stop-color="hsl({hue2},45%,9%)"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="hsl({hue},40%,60%)" stroke-opacity="0.08"/>
    </pattern>
  </defs>
  <rect width="{w}" height="{h}" fill="url(#g)"/>
  <rect width="{w}" height="{h}" fill="url(#grid)"/>
  <circle cx="{cx}" cy="170" r="90" fill="hsl({hue},60%,55%)" fill-opacity="0.10"/>
  <circle cx="{cx}" cy="170" r="150" fill="none" stroke="hsl({hue},60%,55%)" stroke-opacity="0.15"/>
  <text x="48" y="{ty1}" font-family="Consolas, monospace" font-size="34" fill="#e8eaf0">{title}</text>
  <text x="48" y="{ty2}" font-family="Consolas, monospace" font-size="16" fill="hsl({hue},60%,70%)">PLACEHOLDER · 替换为真实截图</text>
  <text x="48" y="{ty3}" font-family="Consolas, monospace" font-size="13" fill="#9aa3b2">{id} · {kind}</text>
</svg>
"""


def make(path: Path, w: int, h: int, title: str, hue: int, wid: str, kind: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(SVG.format(
        w=w, h=h, hue=hue, hue2=(hue + 30) % 360, title=title, id=wid, kind=kind,
        cx=w - 170, ty1=h - 130, ty2=h - 95, ty3=h - 40,
    ), encoding="utf-8")


def main():
    n = 0
    for wid, (title, hue) in WORKS.items():
        make(ROOT / "img" / "covers" / f"{wid}.svg", 960, 600, title, hue, wid, "cover")
        n += 1
        for i in (1, 2, 3):
            make(ROOT / "img" / "works" / wid / f"{i}.svg", 960, 540, title, hue, wid, f"shot {i}/3")
            n += 1
    print(f"OK: {n} placeholder SVGs written under img/")


if __name__ == "__main__":
    main()
