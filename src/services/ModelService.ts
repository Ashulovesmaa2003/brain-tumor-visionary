
import * as tf from '@tensorflow/tfjs';
import { ImageProcessor } from './ImageProcessor';
import { MockDataGenerator } from './MockDataGenerator';

// Model constants
const MODEL_URL = 'https://raw.githubusercontent.com/ml-for-health/medical-models/main/brain_tumor_segmentation/model.json';
const IMAGE_SIZE = 224; // Standard size for medical image analysis models
const MOCK_MODE = false; // Disable mock mode by default

class ModelService {
  private model: tf.GraphModel | null = null;
  private isLoading: boolean = false;
  private mockMode: boolean = MOCK_MODE;
  private imageProcessor: ImageProcessor;
  private mockDataGenerator: MockDataGenerator;
  
  // Singleton pattern to ensure only one model instance
  private static instance: ModelService;
  
  private constructor() {
    this.imageProcessor = new ImageProcessor(IMAGE_SIZE);
    this.mockDataGenerator = new MockDataGenerator();
  }
  
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
    if (this.mockMode) return true; // In mock mode, pretend loading succeeded
    
    try {
      this.isLoading = true;
      console.log('Loading brain tumor detection model...');
      
      // Initialize TensorFlow.js environment
      await tf.ready();
      console.log('TensorFlow.js is ready');
      
      // Configure for optimal performance
      await tf.setBackend('webgl');
      console.log('Using backend:', tf.getBackend());
      
      // Enable debugging if needed
      // tf.env().set('DEBUG', true);
      
      console.log('Attempting to load model from:', MODEL_URL);
      
      try {
        // Try primary loading as GraphModel (TensorFlow.js format)
        this.model = await tf.loadGraphModel(MODEL_URL);
        console.log('Model loaded successfully as GraphModel');
      } catch (graphModelError) {
        console.error('Failed to load as GraphModel:', graphModelError);
        
        try {
          // Fallback to LayersModel (Keras format)
          console.log('Trying to load as a LayersModel...');
          this.model = await tf.loadLayersModel(MODEL_URL) as unknown as tf.GraphModel;
          console.log('Model loaded successfully as LayersModel');
        } catch (layersModelError) {
          console.error('Failed to load as LayersModel:', layersModelError);
          throw new Error('Could not load model in any supported format');
        }
      }
      
      // Warmup the model with a dummy tensor
      const warmupResult = await this.warmupModel();
      if (!warmupResult) {
        throw new Error('Model warmup failed');
      }
      
      this.isLoading = false;
      return true;
    } catch (error) {
      console.error('Failed to load model:', error);
      this.isLoading = false;
      
      // Fallback to mock mode if model fails to load
      console.log('Switching to mock mode due to load failure');
      this.mockMode = true;
      
      return false;
    }
  }

  // Warm up the model with a dummy tensor to ensure it's working properly
  private async warmupModel(): Promise<boolean> {
    if (!this.model) return false;
    
    try {
      // Create a dummy tensor with the expected input shape
      const dummyTensor = tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3]);
      
      // Run a prediction - fixed TypeScript error by checking model.predict type
      const result = this.model.predict(dummyTensor);
      
      // Dispose of tensors to prevent memory leaks
      if (Array.isArray(result)) {
        result.forEach(tensor => tensor.dispose());
      } else {
        result.dispose();
      }
      dummyTensor.dispose();
      
      console.log('Model warmup successful');
      return true;
    } catch (error) {
      console.error('Model warmup failed:', error);
      return false;
    }
  }

  // Run inference on an image
  public async detectTumor(imageElement: HTMLImageElement): Promise<{
    prediction: string;
    confidence: number;
    segmentation?: ImageData;
  }> {
    // Use mock results if in mock mode or if model loading fails
    if (this.mockMode) {
      return this.mockDataGenerator.getMockResults(imageElement);
    }
    
    if (!this.model) {
      const loaded = await this.loadModel();
      if (!loaded) {
        // Fall back to mock mode if loading fails
        this.mockMode = true;
        return this.mockDataGenerator.getMockResults(imageElement);
      }
    }

    // Process input image
    const input = this.imageProcessor.preprocessImage(imageElement);
    
    try {
      // Verify model is properly initialized
      if (!this.model || !this.model.predict) {
        throw new Error('Model not properly initialized');
      }
      
      // Run the model - fixed TypeScript error here
      console.log('Running inference with input shape:', input.shape);
      const outputTensor = this.model.predict(input);
      
      // Process the model output to get tumor classification
      const { tumorType, confidence } = await this.processModelOutput(outputTensor);
      
      // Create segmentation mask if applicable
      let segmentationMap: tf.Tensor;
      
      if (Array.isArray(outputTensor)) {
        // If model outputs multiple tensors, use the appropriate one for segmentation
        segmentationMap = outputTensor[0].argMax(-1);
      } else {
        // Fixed TypeScript error by ensuring argMax is called as a method
        segmentationMap = outputTensor.argMax(-1);
      }
      
      const coloredSegmentation = await this.imageProcessor.createColoredSegmentation(segmentationMap);
      
      // Clean up tensors
      if (Array.isArray(outputTensor)) {
        outputTensor.forEach(tensor => tensor.dispose());
      } else {
        outputTensor.dispose();
      }
      input.dispose();
      segmentationMap.dispose();
      
      return {
        prediction: tumorType,
        confidence: confidence,
        segmentation: coloredSegmentation
      };
    } catch (error) {
      // Clean up tensors on error
      input.dispose();
      console.error("Model inference error:", error);
      
      // Fall back to mock results
      this.mockMode = true;
      return this.mockDataGenerator.getMockResults(imageElement);
    }
  }

  // Process model output to determine tumor type and confidence
  private async processModelOutput(outputTensor: tf.Tensor | tf.Tensor[]): Promise<{ tumorType: string; confidence: number }> {
    // Handle both single tensor and array of tensors
    let probabilities: tf.Tensor;
    
    if (Array.isArray(outputTensor)) {
      // If model outputs multiple tensors, use the one for classification
      // Usually the first one is for segmentation and the second one for classification
      const classificationTensor = outputTensor[outputTensor.length > 1 ? 1 : 0];
      probabilities = classificationTensor.softmax();
    } else {
      // Single tensor output case
      probabilities = outputTensor.softmax();
    }
    
    // Get class with highest probability
    const classIndex = probabilities.argMax(1).dataSync()[0];
    
    // Get the confidence score (probability value)
    const confidenceValue = probabilities.max().dataSync()[0] * 100;
    
    // Map index to tumor type
    const tumorTypes = ['No Tumor', 'Meningioma', 'Glioma', 'Pituitary'];
    const tumorType = tumorTypes[classIndex] || 'Unknown';
    
    // Clean up
    probabilities.dispose();
    
    return {
      tumorType,
      confidence: parseFloat(confidenceValue.toFixed(1))
    };
  }

  // Check if we're in mock mode
  public isMockMode(): boolean {
    return this.mockMode;
  }
  
  // Allow enabling/disabling mock mode
  public setMockMode(enable: boolean): void {
    this.mockMode = enable;
  }
}

export default ModelService.getInstance();
