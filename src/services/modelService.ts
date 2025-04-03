
import * as tf from '@tensorflow/tfjs';
import { ImageProcessor } from './ImageProcessor';
import { MockDataGenerator } from './MockDataGenerator';

class ModelService {
  private model: tf.GraphModel | tf.LayersModel | null = null;
  private mockGenerator: MockDataGenerator;
  private imageProcessor: ImageProcessor;
  private mockMode: boolean = false;
  
  constructor() {
    this.mockGenerator = new MockDataGenerator();
    this.imageProcessor = new ImageProcessor(224); // Standard image size for many models
  }
  
  async loadModel(): Promise<boolean> {
    try {
      console.log('Loading brain tumor detection model...');
      
      // Initialize TensorFlow.js
      await tf.ready();
      console.log('TensorFlow.js is ready');
      console.log('Using backend:', tf.getBackend());
      
      // Try to load the model
      // Using MobileNet as a fallback model for demo purposes
      const modelUrl = 'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_224/classification/3/default/1';
      console.log('Attempting to load model from:', modelUrl);
      
      try {
        // First try to load as a GraphModel
        this.model = await tf.loadGraphModel(modelUrl, { fromTFHub: true });
        return true;
      } catch (graphModelError) {
        console.log('Failed to load as GraphModel:', graphModelError);
        
        console.log('Trying to load as a LayersModel...');
        try {
          // Then try to load as a LayersModel
          this.model = await tf.loadLayersModel(modelUrl);
          return true;
        } catch (layersModelError) {
          console.log('Failed to load as LayersModel:', layersModelError);
          throw new Error('Could not load model in any supported format');
        }
      }
    } catch (error) {
      console.log('Failed to load model:', error);
      this.mockMode = true;
      console.log('Switching to mock mode due to load failure');
      return false;
    }
  }
  
  async detectTumor(imageElement: HTMLImageElement): Promise<{ prediction: string; confidence: number; segmentation?: ImageData }> {
    if (this.mockMode || !this.model) {
      return this.mockGenerator.getMockResults(imageElement);
    }
    
    try {
      // Preprocess the image
      const imageTensor = this.imageProcessor.preprocessImage(imageElement);
      
      // Run inference
      const predictions = await this.model.predict(imageTensor) as tf.Tensor;
      
      // Get the results
      const data = await predictions.data();
      
      // Find the index with the highest probability
      let maxProbIndex = 0;
      let maxProb = 0;
      
      for (let i = 0; i < data.length; i++) {
        if (data[i] > maxProb) {
          maxProb = data[i];
          maxProbIndex = i;
        }
      }
      
      // Clean up tensors
      tf.dispose([imageTensor, predictions]);
      
      // Map result to tumor class
      // This is a simplified mapping - in practice, with a real model,
      // you'd map the class index to the actual tumor types
      const tumorTypes = ['No Tumor', 'Meningioma', 'Glioma', 'Pituitary'];
      const prediction = tumorTypes[maxProbIndex % tumorTypes.length];
      const confidence = maxProb * 100;
      
      return {
        prediction,
        confidence,
        // No real segmentation in this demo, could be added with a segmentation model
      };
    } catch (error) {
      console.error('Error in tumor detection:', error);
      return this.mockGenerator.getMockResults(imageElement);
    }
  }
  
  isMockMode(): boolean {
    return this.mockMode;
  }
}

// Create a singleton instance
const modelServiceInstance = new ModelService();

export default modelServiceInstance;
