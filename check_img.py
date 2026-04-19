from PIL import Image

try:
    img = Image.open('/Users/hafa/Documents/portfolio/assets/images/apollo/case-study-desktop.png')
    print(f"Image mode: {img.mode}, format: {img.format}")
    width, height = img.size
    print(f"Image size: {width}x{height}")
    
    # Check top row
    print("Top row colors (sampled):")
    for x in range(0, width, width//4):
        print(f"({x},0): {img.getpixel((x, 0))}")
        
    print("Top-center down to 200px:")
    for y in range(0, 200, 20):
        print(f"(center,{y}): {img.getpixel((width//2, y))}")
except Exception as e:
    print(e)
