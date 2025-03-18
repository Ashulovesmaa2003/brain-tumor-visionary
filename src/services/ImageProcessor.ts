
import * as tf from '@tensorflow/tfjs';

export class ImageProcessor {
  private imageSize: number;
  
  constructor(imageSize: number) {
    this.imageSize = imageSize;
  }

  // Preprocess the image to match the model's input requirements
  public preprocessImage(imageData: ImageData | HTMLImageElement): tf.Tensor {
    return tf.tidy(() => {
      // Convert to tensor
      let tensor = tf.browser.fromPixels(imageData);
      
      // Resize
      tensor = tf.image.resizeBilinear(tensor, [this.imageSize, this.imageSize]);
      
      // Normalize values to [0, 1]
      tensor = tensor.toFloat().div(tf.scalar(255));
      
      // Add batch dimension
      return tensor.expandDims(0);
    });
  }

  // Create a colored visualization of the segmentation map
  public async createColoredSegmentation(segmentationMap: tf.Tensor): Promise<ImageData> {
    // Get dimensions and data
    const [height, width] = segmentationMap.shape.slice(1);
    const segmentationData = await segmentationMap.array();
    
    // Flatten segmentation data if it's a multi-dimensional array
    const flatSegmentationData = Array.isArray(segmentationData[0]) 
      ? segmentationData[0] 
      : segmentationData;
    
    // Create a colored image (RGBA)
    const imageData = new ImageData(width, height);
    const data = imageData.data;
    
    // Color mapping for different classes
    // 0: background, 1: tumor class 1 (e.g., meningioma), 2: tumor class 2 (e.g., glioma), etc.
    const colorMap = [
      [0, 0, 0, 0],       // Background (transparent)
      [255, 0, 0, 192],   // Class 1 (red, semi-transparent)
      [0, 255, 0, 192],   // Class 2 (green, semi-transparent)
      [0, 0, 255, 192]    // Class 3 (blue, semi-transparent)
    ];
    
    // Ensure flatSegmentationData is treated as an array
    const dataLength = Array.isArray(flatSegmentationData) ? flatSegmentationData.length : 0;
    
    for (let i = 0; i < dataLength; i++) {
      const pixelClass = flatSegmentationData[i];
      const color = colorMap[pixelClass] || [0, 0, 0, 0];
      
      data[i * 4] = color[0];     // R
      data[i * 4 + 1] = color[1]; // G
      data[i * 4 + 2] = color[2]; // B
      data[i * 4 + 3] = color[3]; // A
    }
    
    return imageData;
  }
}
