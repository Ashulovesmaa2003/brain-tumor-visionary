
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileUp, X, Image, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useModelService } from '@/services/modelService';
import { useNavigate } from 'react-router-dom';

const UploadSection = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [mockModeActive, setMockModeActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { analyzeImage, loadModel, isMockMode } = useModelService();
  const navigate = useNavigate();

  useEffect(() => {
    const initModel = async () => {
      try {
        setIsModelLoading(true);
        const success = await loadModel();
        
        // Check if we're in mock mode after loading attempt
        const mockMode = isMockMode();
        setMockModeActive(mockMode);
        
        if (success && !mockMode) {
          toast({
            title: "Model loaded",
            description: "Brain tumor detection model loaded successfully",
          });
        } else if (mockMode) {
          toast({
            title: "Using demo mode",
            description: "Model could not be loaded. Operating in demo mode with sample results.",
            variant: "warning",
          });
        } else {
          toast({
            title: "Model loading delayed",
            description: "Still loading the model, please wait a moment",
          });
        }
      } catch (error) {
        console.error("Failed to load model:", error);
        setMockModeActive(true);
        toast({
          title: "Using demo mode",
          description: "Could not load the brain tumor detection model. Using demo mode instead.",
          variant: "warning",
        });
      } finally {
        setIsModelLoading(false);
      }
    };

    initModel();
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const inputFiles = Array.from(e.target.files);
      handleFiles(inputFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== newFiles.length) {
      toast({
        title: "Invalid file type",
        description: "Only image files are accepted.",
        variant: "destructive",
      });
    }
    
    setFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);
    
    try {
      const results = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < totalFiles; i++) {
        setProgress(Math.round((i / totalFiles) * 90));
        const result = await analyzeImage(files[i]);
        results.push({
          file: files[i],
          ...result
        });
      }
      
      sessionStorage.setItem('analysisResults', JSON.stringify(results));
      setProgress(100);
      
      const modeMessage = mockModeActive ? ' (demo mode)' : '';
      
      toast({
        title: `Analysis complete${modeMessage}`,
        description: `Successfully analyzed ${files.length} file${files.length > 1 ? 's' : ''}.`,
      });
      
      setTimeout(() => {
        navigate('/dashboard', { state: { defaultTab: 'results' } });
        setIsUploading(false);
        setProgress(0);
      }, 500);
      
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your images. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="space-y-6">
        {mockModeActive && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800">Demo Mode Active</h4>
              <p className="text-sm text-amber-700 mt-1">
                The model couldn't be loaded, so you're seeing demo results. Your images will be analyzed but
                the results will be randomized for demonstration purposes.
              </p>
            </div>
          </div>
        )}
      
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-border bg-secondary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            multiple
            accept="image/*"
            className="hidden"
          />
          
          <motion.div 
            initial={{ scale: 1 }}
            animate={{ scale: isDragging ? 1.05 : 1 }}
            className="flex flex-col items-center justify-center space-y-4"
          >
            <div className={`rounded-full p-4 transition-colors ${
              isDragging ? 'bg-primary/10' : 'bg-secondary'
            }`}>
              <Upload className={`h-10 w-10 ${
                isDragging ? 'text-primary' : 'text-primary/60'
              }`} />
            </div>
            
            <div>
              <h3 className="text-lg font-medium">
                {isDragging ? 'Drop your files here' : 'Drag & drop your MRI images'}
              </h3>
              <p className="text-muted-foreground mt-1">or</p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="ghost" 
                className="mt-2 font-medium text-primary hover:text-primary/80 hover:bg-primary/10"
              >
                Browse files
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Supported formats: JPEG, PNG, DICOM
            </p>
          </motion.div>
        </div>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card border rounded-xl overflow-hidden"
            >
              <div className="p-4 border-b">
                <h3 className="font-medium">Selected Files ({files.length})</h3>
              </div>
              
              <ul className="divide-y max-h-60 overflow-y-auto">
                {files.map((file, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="rounded-md bg-secondary h-10 w-10 flex items-center justify-center">
                        <Image className="h-5 w-5 text-primary/60" />
                      </div>
                      <div className="truncate max-w-[200px] md:max-w-md">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-card border rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Analyzing Images</h3>
                <p className="text-xs font-medium">{progress}%</p>
              </div>
              
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={handleUpload}
          className="w-full rounded-xl py-6 font-medium transition-all"
          disabled={files.length === 0 || isUploading || (isModelLoading && !mockModeActive)}
        >
          {isModelLoading && !mockModeActive ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Loading Model...</span>
            </div>
          ) : isUploading ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <FileUp className="h-5 w-5" />
              <span>{mockModeActive ? 'Upload & Analyze (Demo)' : 'Upload & Analyze'}</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default UploadSection;
