import os
from PIL import Image
import numpy as np

def crop_and_make_transparent(input_path, output_path):
    # Load image and convert to RGBA
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # Extract RGB channels
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # Detect dark/non-white pixels (where R, G, B are not all white)
    # White is typically 255. We use a threshold of 245.
    min_rgb = np.minimum(np.minimum(r, g), b)
    is_non_white = min_rgb < 245
    
    # Find all coordinates of non-white pixels
    non_white_coords = np.argwhere(is_non_white)
    
    if len(non_white_coords) == 0:
        print("Error: No emblem detected in the image.")
        return
        
    # Get bounding box coordinates [y, x]
    y_min, x_min = non_white_coords.min(axis=0)
    y_max, x_max = non_white_coords.max(axis=0)
    
    # Calculate dimensions
    width = x_max - x_min
    height = y_max - y_min
    max_dim = max(width, height)
    
    # Center of the bounding box
    x_center = (x_min + x_max) // 2
    y_center = (y_min + y_max) // 2
    
    # Add a small padding (15 pixels) to prevent edge clipping
    padding = 20
    half_size = max_dim // 2 + padding
    
    # Calculate crop coordinates ensuring they are within image bounds
    crop_x1 = max(0, x_center - half_size)
    crop_y1 = max(0, y_center - half_size)
    crop_x2 = min(img.width, x_center + half_size)
    crop_y2 = min(img.height, y_center + half_size)
    
    # Crop the original image to a perfect centered square
    cropped_img = img.crop((crop_x1, crop_y1, crop_x2, crop_y2))
    
    # Process transparency on the cropped image
    cropped_data = np.array(cropped_img)
    cr, cg, cb, ca = cropped_data[:, :, 0], cropped_data[:, :, 1], cropped_data[:, :, 2], cropped_data[:, :, 3]
    
    cropped_min = np.minimum(np.minimum(cr, cg), cb)
    
    # Apply anti-aliasing and soft transparency
    threshold_dark = 200
    threshold_white = 248
    
    cropped_a = np.zeros_like(cropped_min)
    
    mask_dark = cropped_min <= threshold_dark
    mask_white = cropped_min >= threshold_white
    mask_mid = ~mask_dark & ~mask_white
    
    cropped_a[mask_dark] = 255
    cropped_a[mask_white] = 0
    cropped_a[mask_mid] = ((threshold_white - cropped_min[mask_mid]) / (threshold_white - threshold_dark) * 255).astype(np.uint8)
    
    # Clean up emblem color to pure grayscale slate black
    for i in range(3):
        cropped_data[:, :, i] = np.minimum(cropped_data[:, :, i], cropped_min)
        
    # Update alpha channel on the cropped data
    cropped_data[:, :, 3] = cropped_a
    
    # Save processed image
    result = Image.fromarray(cropped_data)
    result.save(output_path, "PNG")
    print(f"Successfully cropped empty margins (Size: {result.size}) and saved transparent logo to {output_path}")

if __name__ == "__main__":
    input_img = r"C:\Users\Abhay Pratap\.gemini\antigravity-ide\brain\2f7588a8-303d-4b68-a8fa-eb2578b26cf8\media__1780289194456.png"
    output_img = r"c:\Users\Abhay Pratap\OneDrive\Desktop\TrustPULSE X\client\public\logo.png"
    crop_and_make_transparent(input_img, output_img)
