import struct
import zlib

def read_png_alpha(filename):
    with open(filename, 'rb') as f:
        # Read signature
        f.read(8)
        # Read IHDR
        f.read(4) # length
        assert f.read(4) == b'IHDR'
        width, height, bit_depth, color_type, compress_method, filter_method, interlace_method = struct.unpack('>IIBBBBB', f.read(13))
        f.read(4) # CRC
        print(f"Color type: {color_type}") # 6 means RGBA, 4 means Gray+Alpha, 2 means RGB
        if color_type not in (4, 6):
            print("Image does NOT have an alpha channel")

        # Now I want to read the first IDAT to check if the first pixel is actually transparent
        idat_data = b''
        while True:
            len_b = f.read(4)
            if not len_b: break
            length = struct.unpack('>I', len_b)[0]
            chunk_type = f.read(4)
            if chunk_type == b'IDAT':
                idat_data += f.read(length)
                f.read(4) # CRC
                if len(idat_data) > 100000: break # Just enough to decompress the first few rows
            else:
                f.read(length + 4)

        try:
            decompressed = zlib.decompress(idat_data)
            # each row has a filter byte at the start
            bytes_per_pixel = 4 if color_type == 6 else 3
            first_pixel = decompressed[1:1+bytes_per_pixel]
            print(f"First pixel bytes: {first_pixel.hex()}")
        except Exception as e:
            print("Could not decompress: ", e)

read_png_alpha('/Users/hafa/Documents/portfolio/assets/images/apollo/case-study-desktop.png')
