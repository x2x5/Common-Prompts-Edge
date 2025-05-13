from PIL import Image
import os

# 创建不同尺寸的图标
sizes = [16, 48, 128]
source_image = 'image.png'

for size in sizes:
    img = Image.open(source_image)
    img = img.resize((size, size), Image.LANCZOS)
    output_path = f'images/icon{size}.png'
    img.save(output_path)
    print(f'已创建: {output_path} ({size}x{size})')

print('所有图标已创建完成') 