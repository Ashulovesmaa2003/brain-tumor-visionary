
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// This is a mock result, in a real app this would come from the backend
const mockResult = {
  id: 'analysis-123456',
  date: new Date().toISOString(),
  patientId: 'P-9876',
  tumorType: 'Glioma',
  confidence: 97.8,
  location: 'Frontal lobe',
  size: '2.3 cm',
  additionalNotes: 'High-grade glioma with distinct border characteristics. Recommend further clinical correlation and possible surgical intervention based on patient symptoms and clinical status.',
};

const ResultsCard = () => {
  const [expanded, setExpanded] = useState(false);

  // Set confidence color based on value
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-green-600';
    if (confidence >= 85) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card border rounded-xl overflow-hidden shadow-md"
      >
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{mockResult.tumorType}</h2>
              <p className="text-sm text-muted-foreground">
                Analysis ID: {mockResult.id}
              </p>
            </div>
            <div className={`mt-2 sm:mt-0 flex items-center ${getConfidenceColor(mockResult.confidence)}`}>
              <span className="text-xl font-bold">{mockResult.confidence}%</span>
              <span className="ml-2 text-sm">confidence</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Date</div>
              <div className="font-medium">
                {new Date(mockResult.date).toLocaleDateString('en-US', { 
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
              <div className="font-medium">{mockResult.patientId}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Location</div>
              <div className="font-medium">{mockResult.location}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Size</div>
              <div className="font-medium">{mockResult.size}</div>
            </div>
          </div>

          <Tabs defaultValue="visual">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="visual">Visual Analysis</TabsTrigger>
              <TabsTrigger value="data">Data Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="visual" className="pt-4">
              <div className="aspect-video bg-secondary rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground font-medium">MRI with heatmap visualization</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="data" className="pt-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Glioma</span>
                    <span className="text-sm font-medium">{mockResult.confidence}%</span>
                  </div>
                  <Progress value={mockResult.confidence} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Meningioma</span>
                    <span className="text-sm font-medium">1.2%</span>
                  </div>
                  <Progress value={1.2} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Pituitary</span>
                    <span className="text-sm font-medium">1.0%</span>
                  </div>
                  <Progress value={1.0} className="h-2" />
                </div>
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
                  {mockResult.additionalNotes}
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
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Download className="mr-1 h-4 w-4" />
              <span>Download</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Share2 className="mr-1 h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
          
          <Button size="sm" className="sm:order-2">
            <FileText className="mr-1 h-4 w-4" />
            <span>Full Report</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsCard;
