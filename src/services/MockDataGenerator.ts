
export class MockDataGenerator {
  // Generate mock results for testing (used as fallback)
  public getMockResults(imageElement: HTMLImageElement): {
    prediction: string;
    confidence: number;
    segmentation?: ImageData;
  } {
    const tumorTypes = ['No Tumor', 'Meningioma', 'Glioma', 'Pituitary'];
    const randomIndex = Math.floor(Math.random() * tumorTypes.length);
    const confidence = 70 + Math.random() * 25; // Random confidence between 70-95%
    
    // Create a simple segmentation overlay
    const segmentation = this.createMockSegmentation(imageElement.width, imageElement.height, randomIndex);
    
    return {
      prediction: tumorTypes[randomIndex],
      confidence: parseFloat(confidence.toFixed(1)),
      segmentation
    };
  }
  
  // Create a simple mock segmentation for testing
  private createMockSegmentation(width: number, height: number, tumorType: number): ImageData {
    const imageData = new ImageData(width, height);
    const data = imageData.data;
    
    // Only add segmentation overlay if there's a tumor (type > 0)
    if (tumorType > 0) {
      // Draw a simple circle in the center as the "tumor"
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 4;
      
      // Color mapping for different tumor types
      const colorMap = [
        [0, 0, 0, 0],       // No tumor (transparent)
        [255, 0, 0, 128],   // Type 1 (red, semi-transparent)
        [0, 255, 0, 128],   // Type 2 (green, semi-transparent)
        [0, 0, 255, 128]    // Type 3 (blue, semi-transparent)
      ];
      
      const color = colorMap[tumorType];
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          
          if (distance < radius) {
            const index = (y * width + x) * 4;
            data[index] = color[0];     // R
            data[index + 1] = color[1]; // G
            data[index + 2] = color[2]; // B
            data[index + 3] = color[3]; // A
          }
        }
      }
    }
    
    return imageData;
  }
}
