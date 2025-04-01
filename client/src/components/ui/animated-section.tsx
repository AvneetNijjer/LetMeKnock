import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

export interface AnimatedSectionProps extends MotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

// Default animation variants that can be used across the app
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 }
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1
    } 
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

export function AnimatedSection({ 
  children, 
  className, 
  initial = "hidden", 
  animate = "visible", 
  variants = fadeInUp, 
  transition = { duration: 0.5 },
  delay = 0,
  ...props 
}: AnimatedSectionProps) {
  return (
    <motion.div
      className={className}
      initial={initial}
      animate={animate}
      variants={variants}
      transition={{ ...transition, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedText({ 
  children, 
  className, 
  delay = 0, 
  ...props 
}: AnimatedSectionProps) {
  return (
    <motion.p
      className={className}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ duration: 0.3, delay }}
      {...props}
    >
      {children}
    </motion.p>
  );
}

export function AnimatedImage({ 
  children, 
  className, 
  delay = 0, 
  ...props 
}: AnimatedSectionProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={scaleIn}
      transition={{ duration: 0.5, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Container for animating a group of items with a stagger effect
export function AnimatedList({ 
  children, 
  className, 
  delay = 0, 
  ...props 
}: AnimatedSectionProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      transition={{ duration: 0.5, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// For individual items in a staggered list
export function AnimatedListItem({ 
  children, 
  className, 
  variants = fadeInUp, 
  ...props 
}: AnimatedSectionProps) {
  return (
    <motion.div
      className={className}
      variants={variants}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}