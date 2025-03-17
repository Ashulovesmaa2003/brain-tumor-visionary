
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HistoryList from '@/components/history/HistoryList';

const History = () => {
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
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Analysis History</h1>
            <p className="text-muted-foreground max-w-2xl">
              View and manage your past analysis results and reports.
            </p>
          </div>
          
          <HistoryList />
        </div>
      </main>
      <Footer />
    </motion.div>
  );
};

export default History;
