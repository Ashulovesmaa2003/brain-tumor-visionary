
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion, useInView, useAnimation } from 'framer-motion';
import { cn } from "@/lib/utils";

const Hero = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const mainControls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      mainControls.start('visible');
    }
  }, [isInView, mainControls]);

  const renderFloatingElements = () => {
    const elements = [];
    const positions = [
      { top: '20%', left: '10%', delay: 0, duration: 7 },
      { top: '15%', right: '15%', delay: 1, duration: 8 },
      { bottom: '25%', left: '15%', delay: 0.5, duration: 6 },
      { bottom: '20%', right: '10%', delay: 1.5, duration: 9 },
    ];

    positions.forEach((pos, index) => {
      elements.push(
        <div
          key={index}
          className="absolute z-0"
          style={pos}
        >
          <div 
            className={cn(
              "rounded-full bg-primary/10 backdrop-blur-md",
              index % 2 === 0 ? "h-24 w-24 md:h-32 md:w-32" : "h-16 w-16 md:h-24 md:w-24"
            )}
            style={{ 
              animation: `float ${pos.duration}s ease-in-out ${pos.delay}s infinite` 
            }}
          />
        </div>
      );
    });

    return elements;
  };

  return (
    <section ref={ref} className="relative pt-32 pb-20 overflow-hidden">
      {renderFloatingElements()}
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            initial="hidden"
            animate={mainControls}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
              Advanced Brain Tumor Classification With <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">AI Precision</span>
            </h1>
          </motion.div>
          
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            initial="hidden"
            animate={mainControls}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
              A decision-support tool for doctors and radiologists to analyze brain MRI images with up to 99% accuracy.
            </p>
          </motion.div>
          
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            initial="hidden"
            animate={mainControls}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button 
              asChild
              size="lg" 
              className="rounded-full px-8 font-medium hover:shadow-lg transition-all"
            >
              <Link to="/dashboard">
                Upload Scan
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline" 
              size="lg" 
              className="rounded-full px-8 font-medium hover:shadow-sm transition-all border-primary/20"
            >
              <a href="#features">
                Learn More
              </a>
            </Button>
          </motion.div>
        </div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0 }
          }}
          initial="hidden"
          animate={mainControls}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-16 max-w-5xl mx-auto"
        >
          <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
            <div className="aspect-[16/9] w-full bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center">
              <div className="text-white text-xl font-medium">
                Brain MRI Visualization Preview
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
