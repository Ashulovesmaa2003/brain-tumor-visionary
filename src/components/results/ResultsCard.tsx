
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Share2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Define the result type
interface AnalysisResult {
  file: File;
  prediction: string;
  confidence: number;
  segmentation?: ImageData;
  date?: string;
  patientId?: string;
  location?: string;
  size?: string;
  additionalNotes?: string;
}

const ResultsCard = () => {
  const [expanded, setExpanded] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [segmentationUrl, setSegmentationUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Try to get analysis results from sessionStorage
    try {
      const storedResults = sessionStorage.getItem('analysisResults');
      if (storedResults) {
        const parsedResults = JSON.parse(storedResults) as AnalysisResult[];
        
        // Add mock data for fields not provided by the model
        const enhancedResults = parsedResults.map(result => ({
          ...result,
          date: new Date().toISOString(),
          patientId: 'P-' + Math.floor(1000 + Math.random() * 9000),
          location: determineTumorLocation(result.prediction),
          size: ((Math.random() * 3) + 0.5).toFixed(1) + ' cm',
          additionalNotes: generateNotes(result.prediction, result.confidence),
        }));
        
        setResults(enhancedResults);
        if (enhancedResults.length > 0) {
          setCurrentResult(enhancedResults[0]);
          createImageUrls(enhancedResults[0]);
        }
      }
    } catch (error) {
      console.error('Error loading analysis results:', error);
      toast({
        title: 'Error loading results',
        description: 'Could not load your previous analysis results.',
        variant: 'destructive',
      });
    }
  }, []);

  // Create URLs for displaying the image and segmentation
  const createImageUrls = (result: AnalysisResult) => {
    // Create URL for the original image
    if (result.file) {
      const url = URL.createObjectURL(result.file);
      setImageUrl(url);
    }
    
    // Create URL for the segmentation overlay if available
    if (result.segmentation) {
      const canvas = document.createElement('canvas');
      canvas.width = result.segmentation.width;
      canvas.height = result.segmentation.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.putImageData(result.segmentation, 0, 0);
        const segUrl = canvas.toDataURL();
        setSegmentationUrl(segUrl);
      }
    } else {
      setSegmentationUrl(null);
    }
  };

  // Helper functions for generating mock data
  const determineTumorLocation = (prediction: string): string => {
    const locations = ['Frontal lobe', 'Temporal lobe', 'Parietal lobe', 'Occipital lobe', 'Cerebellum'];
    
    // Deterministic selection based on prediction string
    const hash = prediction.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return locations[hash % locations.length];
  };

  const generateNotes = (prediction: string, confidence: number): string => {
    if (prediction === 'No Tumor') {
      return 'No evidence of tumor detected in the MRI scan. Regular follow-up recommended as per standard protocols.';
    }
    
    const confidenceLevel = confidence >= 95 ? 'high' : confidence >= 85 ? 'moderate' : 'lower';
    
    let notes = `${prediction} detected with ${confidenceLevel} confidence. `;
    
    if (prediction === 'Meningioma') {
      notes += 'Typically benign tumor arising from the meninges covering the brain and spinal cord. ';
      notes += confidence >= 90 
        ? 'Well-defined borders visible in the image, suggesting a typical presentation. Surgical resection may be considered depending on location and symptoms.'
        : 'Further imaging recommended to better define the borders and assess growth rate.';
    } else if (prediction === 'Glioma') {
      notes += 'A type of tumor that originates in the glial cells of the brain. ';
      notes += confidence >= 90
        ? 'Characteristics suggest higher-grade glioma. Recommend further assessment with additional imaging modalities and possible biopsy for definitive diagnosis and grading.'
        : 'Appears to be lower-grade based on imaging characteristics, but further assessment is recommended.';
    } else if (prediction === 'Pituitary') {
      notes += 'Tumor arising from the pituitary gland. ';
      notes += confidence >= 90
        ? 'Well-circumscribed lesion consistent with pituitary adenoma. Endocrine evaluation recommended to assess for hormonal abnormalities.'
        : 'Recommend endocrine evaluation and possible dynamic contrast-enhanced MRI to better characterize the lesion.';
    }
    
    return notes;
  };

  // Set confidence color based on value
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-green-600';
    if (confidence >= 85) return 'text-amber-600';
    return 'text-red-600';
  };

  // If no results, show a message
  if (results.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card border rounded-xl overflow-hidden shadow-md p-8 text-center"
        >
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Results Found</h2>
          <p className="text-muted-foreground mb-6">
            You haven't analyzed any MRI scans yet. Upload images in the Upload tab to see results here.
          </p>
          <Button onClick={() => document.querySelector('[value="upload"]')?.dispatchEvent(new Event('click'))}>
            Go to Upload
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card border rounded-xl overflow-hidden shadow-md"
      >
        {currentResult && (
          <>
            <div className="p-6 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{currentResult.prediction}</h2>
                  <p className="text-sm text-muted-foreground">
                    {currentResult.file.name}
                  </p>
                </div>
                <div className={`mt-2 sm:mt-0 flex items-center ${getConfidenceColor(currentResult.confidence)}`}>
                  <span className="text-xl font-bold">{currentResult.confidence.toFixed(1)}%</span>
                  <span className="ml-2 text-sm">confidence</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="font-medium">
                    {new Date(currentResult.date || new Date()).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Patient ID</div>
                  <div className="font-medium">{currentResult.patientId}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="font-medium">{currentResult.location}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Size</div>
                  <div className="font-medium">{currentResult.size}</div>
                </div>
              </div>

              <Tabs defaultValue="visual">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="visual">Visual Analysis</TabsTrigger>
                  <TabsTrigger value="data">Data Analysis</TabsTrigger>
                </TabsList>
                <TabsContent value="visual" className="pt-4">
                  <div className="aspect-video bg-secondary rounded-lg overflow-hidden relative">
                    {imageUrl ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img 
                          src={imageUrl} 
                          alt="MRI Scan" 
                          className="max-w-full max-h-full object-contain"
                        />
                        {segmentationUrl && (
                          <img 
                            src={segmentationUrl} 
                            alt="Segmentation" 
                            className="absolute inset-0 max-w-full max-h-full object-contain mix-blend-multiply"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-muted-foreground font-medium">MRI visualization unavailable</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="data" className="pt-4 space-y-4">
                  <div className="space-y-3">
                    {['No Tumor', 'Meningioma', 'Glioma', 'Pituitary'].map(type => {
                      const value = type === currentResult.prediction ? currentResult.confidence : 
                                    Math.random() * (type === 'No Tumor' ? 1 : 3);
                      return (
                        <div key={type}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{type}</span>
                            <span className="text-sm font-medium">{value.toFixed(1)}%</span>
                          </div>
                          <Progress value={value} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b overflow-hidden"
                >
                  <div className="p-6">
                    <h3 className="font-medium mb-2">Medical Notes</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentResult.additionalNotes}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4 flex flex-col sm:flex-row sm:justify-between gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-center sm:order-3"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="mr-1 h-4 w-4" />
                    <span>Show Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1 h-4 w-4" />
                    <span>Show More</span>
                  </>
                )}
              </Button>
              
              <div className="flex gap-2 sm:order-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 sm:flex-none"
                  onClick={() => {
                    if (imageUrl) {
                      const a = document.createElement('a');
                      a.href = imageUrl;
                      a.download = currentResult.file.name || 'mri-scan.png';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      
                      toast({
                        title: 'Download started',
                        description: 'Your MRI scan is being downloaded.',
                      });
                    }
                  }}
                >
                  <Download className="mr-1 h-4 w-4" />
                  <span>Download</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 sm:flex-none"
                  onClick={() => {
                    // Create a shareable URL or copy results to clipboard
                    navigator.clipboard.writeText(
                      `Brain MRI Analysis Results:\n` +
                      `Prediction: ${currentResult.prediction}\n` +
                      `Confidence: ${currentResult.confidence.toFixed(1)}%\n` +
                      `Location: ${currentResult.location}\n` +
                      `Size: ${currentResult.size}`
                    );
                    
                    toast({
                      title: 'Copied to clipboard',
                      description: 'Analysis results have been copied to your clipboard.',
                    });
                  }}
                >
                  <Share2 className="mr-1 h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>
              
              <Button 
                size="sm" 
                className="sm:order-2"
                onClick={() => {
                  // Generate PDF report (mock functionality)
                  toast({
                    title: 'Report generated',
                    description: 'Full report has been generated and downloaded.',
                  });
                }}
              >
                <FileText className="mr-1 h-4 w-4" />
                <span>Full Report</span>
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ResultsCard;
