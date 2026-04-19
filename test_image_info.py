from PIL import Image

def analyze_image(path):
    try:
        with Image.open(path) as img:
            print(f"File: {path}")
            print(f"Format: {img.format}")
            print(f"Size: {img.size}")
            print(f"Mode: {img.mode}")
            
    except Exception as e:
        print(f"Error processing {path}: {e}")

analyze_image("/Users/hafa/.gemini/antigravity/brain/776cf3d1-596d-480f-8fbe-bb3e7700e9a5/media__1776569567597.png")
