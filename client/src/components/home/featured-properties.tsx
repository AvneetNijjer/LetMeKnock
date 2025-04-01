import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/property-card";
import { ArrowRight } from "lucide-react";
import { Property } from "@shared/schema";
import { AnimatedSection, fadeIn, staggerContainer } from "@/components/ui/animated-section";
import { motion } from "framer-motion";

export default function FeaturedProperties() {
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties/featured'],
  });

  return (
    <AnimatedSection className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="flex justify-between items-center mb-10"
        >
          <h2 className="text-3xl font-bold font-poppins">Featured Student Accommodations</h2>
          <Link href="/listings">
            <Button variant="link" className="text-primary font-medium hover:underline flex items-center group">
              View All 
              <motion.span
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <ArrowRight className="ml-2 h-4 w-4 group-hover:text-primary-dark" />
              </motion.span>
            </Button>
          </Link>
        </motion.div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-96"></div>
            ))}
          </div>
        ) : properties && properties.length > 0 ? (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {properties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No featured properties available at the moment.</p>
          </div>
        )}
      </div>
    </AnimatedSection>
  );
}
