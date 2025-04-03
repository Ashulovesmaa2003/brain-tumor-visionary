
import { useToast } from '@/hooks/use-toast';
import ModelService from './modelService';

// Hook for using model service in components
export const useModelService = () => {
  const { toast } = useToast();
  
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
      const result = await ModelService.detectTumor(img);
      
      // Clean up URL object
      URL.revokeObjectURL(imageUrl);
      
      // If in mock mode, let the user know
      if (ModelService.isMockMode()) {
        toast({
          title: 'Mock Results',
          description: 'Showing sample results as the model could not be loaded.',
          variant: 'default',
        });
      }
      
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
    loadModel: ModelService.loadModel.bind(ModelService),
    isMockMode: ModelService.isMockMode.bind(ModelService),
  };
};
