
import * as tf from '@tensorflow/tfjs';
import { useToast } from '@/hooks/use-toast';

// Model constants
const MODEL_URL = 'https://storage.googleapis.com/tfjs-models/savedmodel/'; // Replace with your actual model URL
const IMAGE_SIZE = 224; // DeepLab typically uses 224x224 or 512x512 images

class ModelService {
  private model: tf.GraphModel | null = null;
  private isLoading: boolean = false;
  
  // Singleton pattern to ensure only one model instance
  private static instance: ModelService;
  
  private constructor() {}
  
  public static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  // Load the model
  public async loadModel(): Promise<boolean> {
    if (this.model) return true; // Model already loaded
    if (this.isLoading) return false; // Model is currently loading
    
    try {
      this.isLoading = true;
      console.log('Loading brain tumor detection model...');
      
      // Load the model
      this.model = await tf.loadGraphModel(MODEL_URL);
      
      console.log('Model loaded successfully!');
      this.isLoading = false;
      return true;
    } catch (error) {
      console.error('Failed to load model:', error);
      this.isLoading = false;
      return false;
    }
  }

  // Preprocess the image to match the model's input requirements
  private preprocessImage(imageData: ImageData | HTMLImageElement): tf.Tensor {
    return tf.tidy(() => {
      // Convert to tensor
      let tensor = tf.browser.fromPixels(imageData);
      
      // Resize
      tensor = tf.image.resizeBilinear(tensor, [IMAGE_SIZE, IMAGE_SIZE]);
      
      // Normalize values to [-1, 1]
      tensor = tensor.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1));
      
      // Add batch dimension
      return tensor.expandDims(0);
    });
  }

  // Run inference on an image
  public async detectTumor(imageElement: HTMLImageElement): Promise<{
    prediction: string;
    confidence: number;
    segmentation?: ImageData;
  }> {
    if (!this.model) {
      const loaded = await this.loadModel();
      if (!loaded) {
        throw new Error('Model failed to load');
      }
    }

    // Process input image using tf.tidy()
    const input = this.preprocessImage(imageElement);
    
    try {
      // Run the model
      const outputTensor = this.model!.predict(input) as tf.Tensor;
      
      // Process the model output
      const segmentationMap = outputTensor.argMax(-1);
      
      // Create a visualization of the segmentation
      const coloredSegmentation = await this.createColoredSegmentation(segmentationMap);
      
      // Get the tumor type and confidence
      const { tumorType, confidence } = this.analyzeTumorType(outputTensor);
      
      // Clean up tensors
      tf.dispose([input, outputTensor, segmentationMap]);
      
      return {
        prediction: tumorType,
        confidence: confidence,
        segmentation: coloredSegmentation
      };
    } catch (error) {
      // Clean up tensors on error
      tf.dispose(input);
      throw error;
    }
  }

  // Create a colored visualization of the segmentation map
  private async createColoredSegmentation(segmentationMap: tf.Tensor): Promise<ImageData> {
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
    
    for (let i = 0; i < flatSegmentationData.length; i++) {
      const pixelClass = flatSegmentationData[i];
      const color = colorMap[pixelClass] || [0, 0, 0, 0];
      
      data[i * 4] = color[0];     // R
      data[i * 4 + 1] = color[1]; // G
      data[i * 4 + 2] = color[2]; // B
      data[i * 4 + 3] = color[3]; // A
    }
    
    return imageData;
  }

  // Analyze the model output to determine tumor type and confidence
  private analyzeTumorType(output: tf.Tensor): { tumorType: string; confidence: number } {
    // Get class probabilities
    const probabilities = output.softmax().dataSync();
    
    // Find the class with the highest probability
    const classes = ['No Tumor', 'Meningioma', 'Glioma', 'Pituitary'];
    const classIndex = tf.argMax(probabilities).dataSync()[0];
    const confidence = probabilities[classIndex] * 100;
    
    return {
      tumorType: classes[classIndex],
      confidence: parseFloat(confidence.toFixed(1))
    };
  }
}

export default ModelService.getInstance();

// Hook for using model service in components
export const useModelService = () => {
  const { toast } = useToast();
  const modelService = ModelService.getInstance();
  
  const analyzeImage = async (file: File): Promise<any> => {
    try {
      // Create an HTMLImageElement from the file
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = imageUrl;
      
      // Wait for the image to load
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Run detection
      const result = await modelService.detectTumor(img);
      
      // Clean up URL object
      URL.revokeObjectURL(imageUrl);
      
      return result;
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: 'Analysis failed',
        description: 'There was an error analyzing your image. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  return {
    analyzeImage,
    loadModel: modelService.loadModel.bind(modelService),
  };
};
