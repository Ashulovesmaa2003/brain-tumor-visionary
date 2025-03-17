
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Microscope, ArrowRight, BrainCircuit, FileCheck, BarChart3 } from 'lucide-react';

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  const steps = [
    {
      icon: <Microscope className="h-6 w-6" />,
      title: "Upload MRI Scans",
      description: "Upload single or multiple brain MRI scans through our secure platform."
    },
    {
      icon: <BrainCircuit className="h-6 w-6" />,
      title: "AI Analysis",
      description: "Our advanced deep learning model processes the images with 95-99% accuracy."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Visual Explanations",
      description: "Heatmaps highlight the key regions that influenced the model's decision."
    },
    {
      icon: <FileCheck className="h-6 w-6" />,
      title: "Detailed Report",
      description: "Receive a comprehensive report with classification, confidence scores, and recommendations."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="how-it-works" className="py-20 bg-card/30">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground">
            Our platform simplifies the tumor detection process while providing accurate and interpretable results.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-4xl mx-auto"
        >
          <div className="relative">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex mb-14 md:mb-20 relative"
              >
                <div className="flex-shrink-0 z-10">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <div className="text-primary-foreground">
                      {step.icon}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute left-6 top-12 w-[2px] h-[calc(100%-8px)] bg-primary/20"></div>
                  )}
                </div>
                
                <div className="ml-6 flex-grow">
                  <div className="glass-card p-6 rounded-xl">
                    <h3 className="font-medium text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="hidden md:flex justify-center my-4">
                      <ArrowRight className="text-primary/60 h-5 w-5" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
