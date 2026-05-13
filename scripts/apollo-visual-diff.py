#!/usr/bin/env python3

import argparse
import json
from pathlib import Path
from PIL import Image, ImageChops


def parse_args():
    parser = argparse.ArgumentParser(description="Compare a Figma source image with a local Apollo section crop.")
    parser.add_argument("--source", required=True)
    parser.add_argument("--local", required=True)
    parser.add_argument("--diff", required=True)
    parser.add_argument("--json", required=True)
    parser.add_argument("--threshold", type=float, default=0.02)
    return parser.parse_args()


def open_rgba(path):
    return Image.open(path).convert("RGBA")


def main():
    args = parse_args()
    source_path = Path(args.source)
    local_path = Path(args.local)
    diff_path = Path(args.diff)
    json_path = Path(args.json)
    diff_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.parent.mkdir(parents=True, exist_ok=True)

    source = open_rgba(source_path)
    local = open_rgba(local_path)
    size_mismatch = source.size != local.size
    if size_mismatch:
        local_for_compare = local.resize(source.size)
    else:
        local_for_compare = local

    diff = ImageChops.difference(source, local_for_compare)
    pixels = diff.getdata()
    changed = 0
    total_delta = 0
    max_delta = 0
    for pixel in pixels:
        delta = max(pixel[:3])
        total_delta += delta
        max_delta = max(max_delta, delta)
        if delta > 24:
            changed += 1

    total_pixels = source.size[0] * source.size[1]
    changed_ratio = changed / total_pixels if total_pixels else 1
    mean_delta = total_delta / (total_pixels * 255) if total_pixels else 1
    passed = (not size_mismatch) and changed_ratio <= args.threshold

    overlay = Image.new("RGBA", source.size, (0, 0, 0, 0))
    overlay_pixels = []
    for pixel in diff.getdata():
        if max(pixel[:3]) > 24:
            overlay_pixels.append((255, 0, 0, 160))
        else:
            overlay_pixels.append((0, 0, 0, 0))
    overlay.putdata(overlay_pixels)
    composed = Image.alpha_composite(local_for_compare, overlay)
    composed.save(diff_path)

    report = {
        "passed": passed,
        "threshold": args.threshold,
        "source": str(source_path),
        "local": str(local_path),
        "diff": str(diff_path),
        "source_size": source.size,
        "local_size": local.size,
        "size_mismatch": size_mismatch,
        "changed_ratio": changed_ratio,
        "mean_delta": mean_delta,
        "max_delta": max_delta,
    }
    json_path.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))
    raise SystemExit(0 if passed else 1)


if __name__ == "__main__":
    main()
