#!/usr/bin/env python3
import json
import re
import sys
from urllib.parse import parse_qs, urlparse


def parse_figma_url(label, url):
    parsed = urlparse(url)
    path_parts = [part for part in parsed.path.split("/") if part]

    file_key = ""
    for index, part in enumerate(path_parts):
        if part in {"design", "file"} and index + 1 < len(path_parts):
            file_key = path_parts[index + 1]
            break

    query = parse_qs(parsed.query)
    raw_node_id = query.get("node-id", [""])[0]
    node_id = raw_node_id.replace("-", ":")

    return {
        "label": label,
        "url": url,
        "fileKey": file_key,
        "nodeId": node_id,
        "isValid": bool(file_key and node_id),
    }


def main(argv):
    if len(argv) != 4:
        print(
            "Usage: extract-figma-links.py DESKTOP_URL TABLET_URL MOBILE_URL",
            file=sys.stderr,
        )
        return 2

    labels = ["Desktop", "Tablet", "Mobile"]
    results = [parse_figma_url(label, url) for label, url in zip(labels, argv[1:])]
    invalid = [result["label"] for result in results if not result["isValid"]]

    print(json.dumps(results, indent=2, ensure_ascii=False))

    if invalid:
        print(
            "Invalid Figma links missing fileKey or nodeId: " + ", ".join(invalid),
            file=sys.stderr,
        )
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
