import os
from PIL import Image, ImageFilter
import numpy as np

def make_logo_bold(input_path, output_path):
    # Load original white-background image
    img = Image.open(input_path).convert("RGBA")
    
    # Bounding box detection to crop empty space
    data = np.array(img)
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    min_rgb = np.minimum(np.minimum(r, g), b)
    is_non_white = min_rgb < 245
    non_white_coords = np.argwhere(is_non_white)
    
    if len(non_white_coords) == 0:
        print("No logo found.")
        return
        
    y_min, x_min = non_white_coords.min(axis=0)
    y_max, x_max = non_white_coords.max(axis=0)
    
    width = x_max - x_min
    height = y_max - y_min
    max_dim = max(width, height)
    
    x_center = (x_min + x_max) // 2
    y_center = (y_min + y_max) // 2
    
    # Set padding for square crop
    padding = 24
    half_size = max_dim // 2 + padding
    
    crop_x1 = max(0, x_center - half_size)
    crop_y1 = max(0, y_center - half_size)
    crop_x2 = min(img.width, x_center + half_size)
    crop_y2 = min(img.height, y_center + half_size)
    
    cropped_img = img.crop((crop_x1, crop_y1, crop_x2, crop_y2))
    
    # Process transparency
    cropped_data = np.array(cropped_img)
    cr, cg, cb, ca = cropped_data[:, :, 0], cropped_data[:, :, 1], cropped_data[:, :, 2], cropped_data[:, :, 3]
    cropped_min = np.minimum(np.minimum(cr, cg), cb)
    
    # Thresholds for anti-aliasing
    threshold_dark = 210
    threshold_white = 248
    
    cropped_a = np.zeros_like(cropped_min)
    mask_dark = cropped_min <= threshold_dark
    mask_white = cropped_min >= threshold_white
    mask_mid = ~mask_dark & ~mask_white
    
    cropped_a[mask_dark] = 255
    cropped_a[mask_white] = 0
    cropped_a[mask_mid] = ((threshold_white - cropped_min[mask_mid]) / (threshold_white - threshold_dark) * 255).astype(np.uint8)
    
    # Color mapping: solid dark slate
    for i in range(3):
        cropped_data[:, :, i] = 15 # Red=15, Green=23, Blue=42 for ultra-crisp dark slate
        
    cropped_data[:, :, 3] = cropped_a
    
    # Reconstruct transparent image
    transparent_img = Image.fromarray(cropped_data)
    
    # DILATION: Use PIL's MaxFilter to widen the Alpha channel (make lines thicker and bolder!)
    # MaxFilter(3) expands the alpha mask by 1 pixel in all directions.
    # Widen twice or use a MaxFilter(3) to make the lines perfectly bold.
    r_chan, g_chan, b_chan, a_chan = transparent_img.split()
    dilated_a = a_chan.filter(ImageFilter.MaxFilter(3))
    
    # Merge channels back
    bold_img = Image.merge("RGBA", (r_chan, g_chan, b_chan, dilated_a))
    
    # Save the final processed bold image
    bold_img.save(output_path, "PNG")
    print(f"Successfully generated bold logo (Size: {bold_img.size}) at {output_path}")

if __name__ == "__main__":
    input_img = r"C:\Users\Abhay Pratap\OneDrive\Desktop\TrustPULSE X\media__1780035544554.png"
    # If the file is not in workspace, let's fall back to brain path:
    if not os.path.exists(input_img):
        input_img = r"C:\Users\Abhay Pratap\.gemini\antigravity-ide\brain\677575aa-807d-4d2d-b271-75c9d5d5f6b3\media__1780035544554.png"
        
    output_img = r"c:\Users\Abhay Pratap\OneDrive\Desktop\TrustPULSE X\client\public\logo.png"
    make_logo_bold(input_img, output_img)
