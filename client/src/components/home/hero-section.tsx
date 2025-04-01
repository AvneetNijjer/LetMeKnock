import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  AnimatedSection, 
  AnimatedText,
  fadeInDown, 
  fadeInUp 
} from '@/components/ui/animated-section';

export default function HeroSection() {
  const [, navigate] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);
  const y = useTransform(scrollY, [0, 300], [0, 100]);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  return (
    <header className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      <motion.div 
        style={{ opacity, scale }}
        className="absolute inset-0"
      >
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80"
          alt="Modern apartment building"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </motion.div>
      
      <motion.div 
        style={{ y }}
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 pb-24"
      >
        <AnimatedSection 
          variants={fadeInDown}
          transition={{ duration: 0.7 }}
          className="mb-6"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            Find Your Dream Student Home
          </h1>
        </AnimatedSection>
        
        <AnimatedText 
          className="text-xl text-gray-200 mb-8 max-w-2xl"
          delay={0.2}
        >
          Let us guide you through the journey of finding the perfect property near McMaster University that matches your lifestyle and budget.
        </AnimatedText>
        
        <AnimatedSection 
          variants={fadeInUp}
          delay={0.4}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            size="lg"
            onClick={() => navigate('/listings')}
            className="bg-white text-blue-900 hover:bg-gray-100 border-2 border-white transition-all hover:shadow-lg"
          >
            Browse Properties
          </Button>
          <Button
            
            size="lg"
            onClick={() => navigate('/map-view')}
            className="bg-white text-blue-900 hover:bg-gray-100 border-2 border-white transition-all hover:shadow-lg"
          >
            View Map
          </Button>
        </AnimatedSection>
      </motion.div>
    </header>
  );
}