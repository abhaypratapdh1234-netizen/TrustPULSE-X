import os
from PIL import Image
import numpy as np

def make_white_transparent(input_path, output_path):
    # Load image
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # Extract channels
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # Calculate average / minimum of RGB to detect whiteness
    # A pixel is white when all channels are very high
    min_rgb = np.minimum(np.minimum(r, g), b)
    
    # We want a threshold-based alpha mapping.
    # Below 220, the emblem is dark (keep it opaque or semi-opaque).
    # Above 245, it is white background (make it completely transparent).
    # Between 220 and 245, interpolate to get smooth, anti-aliased edges.
    threshold_dark = 200
    threshold_white = 248
    
    new_a = np.zeros_like(min_rgb)
    
    mask_dark = min_rgb <= threshold_dark
    mask_white = min_rgb >= threshold_white
    mask_mid = ~mask_dark & ~mask_white
    
    # Dark pixels: fully opaque
    new_a[mask_dark] = 255
    # White pixels: fully transparent
    new_a[mask_white] = 0
    # Intermediate edge pixels: smooth transition
    new_a[mask_mid] = ((threshold_white - min_rgb[mask_mid]) / (threshold_white - threshold_dark) * 255).astype(np.uint8)
    
    # We also want to normalize the emblem color to a rich slate black (e.g. RGB 20, 25, 35)
    # for the non-transparent parts, so it is solid and uniform.
    # To do this, let's keep the dark gray emblem's original shade but clean up any stray colors.
    # Since it is a grayscale emblem, we can set R=G=B to the minimum value so it's a perfect neutral dark tone.
    for i in range(3):
        data[:, :, i] = np.minimum(data[:, :, i], min_rgb)
        
    # Update alpha channel
    data[:, :, 3] = new_a
    
    # Save the processed image
    result = Image.fromarray(data)
    result.save(output_path, "PNG")
    print(f"Successfully processed logo and saved transparent PNG to {output_path}")

if __name__ == "__main__":
    input_img = r"C:\Users\Abhay Pratap\.gemini\antigravity-ide\brain\677575aa-807d-4d2d-b271-75c9d5d5f6b3\media__1780035544554.png"
    output_img = r"c:\Users\Abhay Pratap\OneDrive\Desktop\TrustPULSE X\client\public\logo.png"
    make_white_transparent(input_img, output_img)
