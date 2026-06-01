import os
from PIL import Image
import numpy as np

def make_neon_transparent(input_path, output_path):
    # Load image
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # Extract channels
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # Calculate luminance / brightness
    # Since it's a neon glow on a dark background, we can use the maximum RGB value 
    # to determine alpha, which naturally preserves the glows.
    brightness = np.maximum(np.maximum(r, g), b)
    
    # Scale alpha based on brightness:
    # If the brightness is high, alpha is high (opaque).
    # If brightness is low, alpha is low (transparent).
    # Let's map brightness linearly, but apply a threshold so that solid dark background 
    # (e.g. brightness < 30) becomes completely transparent.
    new_a = np.zeros_like(brightness)
    
    # Soft thresholding
    threshold_low = 15
    threshold_high = 80
    
    # For pixels below threshold_low: completely transparent
    # For pixels above threshold_high: keep original alpha or full opacity
    # In between: interpolate smoothly
    
    mask_low = brightness <= threshold_low
    mask_high = brightness >= threshold_high
    mask_mid = ~mask_low & ~mask_high
    
    new_a[mask_high] = 255
    new_a[mask_low] = 0
    
    # Smooth transition for intermediate pixels
    new_a[mask_mid] = ((brightness[mask_mid] - threshold_low) / (threshold_high - threshold_low) * 255).astype(np.uint8)
    
    # Update alpha channel
    data[:, :, 3] = new_a
    
    # To make the colors pop even more when overlayed on different backgrounds,
    # we can slightly boost the brightness of semi-transparent glow pixels
    # so they don't look muddy on white backgrounds.
    # We do this by dividing RGB by the normalized alpha (standard unpremultiplied alpha restoration)
    # only for somewhat glowing pixels.
    # standard formula: color = color / (alpha/255)
    
    # Save the processed image
    result = Image.fromarray(data)
    result.save(output_path, "PNG")
    print(f"Successfully created transparent logo at {output_path}")

if __name__ == "__main__":
    input_img = r"C:\Users\Abhay Pratap\.gemini\antigravity-ide\brain\677575aa-807d-4d2d-b271-75c9d5d5f6b3\media__1780035106729.png"
    output_dir = r"c:\Users\Abhay Pratap\OneDrive\Desktop\TrustPULSE X\client\public"
    os.makedirs(output_dir, exist_ok=True)
    output_img = os.path.join(output_dir, "logo.png")
    make_neon_transparent(input_img, output_img)
