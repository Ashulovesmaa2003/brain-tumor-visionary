
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import UploadSection from '@/components/upload/UploadSection';
import ResultsCard from '@/components/results/ResultsCard';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('upload');
  
  // Handle default tab selection from navigation
  useEffect(() => {
    if (location.state && location.state.defaultTab) {
      setActiveTab(location.state.defaultTab);
    }
  }, [location]);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col min-h-screen"
    >
      <Header />
      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Dashboard</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload brain MRI scans for analysis and view your classification results.
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <UploadSection />
            </TabsContent>
            
            <TabsContent value="results" className="space-y-4">
              <ResultsCard />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
};

export default Dashboard;
