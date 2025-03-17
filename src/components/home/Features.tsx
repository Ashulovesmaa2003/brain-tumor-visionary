
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Upload, 
  Brain, 
  BarChart3, 
  FileText, 
  Cloud, 
  Lock, 
  History, 
  Building, 
  Scale,
  Mail
} from 'lucide-react';

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  
  const features = [
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Batch Uploads",
      description: "Upload multiple MRI images at once for efficient processing.",
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Tumor Classification",
      description: "Detects and classifies tumors with 95-99% accuracy.",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Visual Explanations",
      description: "Heatmaps highlight key regions in the MRI scan for better interpretability.",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Detailed Reports",
      description: "Comprehensive reports including tumor type, confidence score, and recommendations.",
    },
    {
      icon: <Cloud className="h-6 w-6" />,
      title: "Cloud Storage",
      description: "Secure storage for MRI images and analysis results.",
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "User Authentication",
      description: "Secure login system for doctors and medical professionals.",
    },
    {
      icon: <History className="h-6 w-6" />,
      title: "Past Analysis Storage",
      description: "Access and review historical diagnosis results anytime.",
    },
    {
      icon: <Building className="h-6 w-6" />,
      title: "Hospital Integration",
      description: "Connects with PACS/EHR to retrieve MRI images directly.",
    },
    {
      icon: <Scale className="h-6 w-6" />,
      title: "Scalability",
      description: "Designed to support multiple hospitals and institutes.",
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Notifications",
      description: "Get notified when analysis is complete.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <section id="features" className="py-20 bg-secondary/50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comprehensive Features
          </h2>
          <p className="text-muted-foreground">
            Our platform offers a complete suite of tools designed specifically for medical professionals.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-card rounded-xl p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <div className="text-primary">
                  {feature.icon}
                </div>
              </div>
              <h3 className="font-medium text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
