import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useAuth } from "@/context/auth-context";

export default function CtaSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-16 px-4 bg-white">
      <motion.div 
        className="max-w-7xl mx-auto bg-secondary rounded-2xl p-8 md:p-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-2/3 mb-8 md:mb-0">
            <h2 className="text-2xl md:text-3xl font-bold font-poppins mb-4">Ready to Find Your Perfect Student Housing?</h2>
            <p className="text-gray-600 mb-6">
              Join thousands of students who've found their ideal accommodations through Let Me Knock. Create an account today and start your search!
            </p>
            <div className="flex flex-wrap gap-4">
              {!isAuthenticated ? (
                <Button className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-600 transition-all btn-hover-effect">
                  Sign Up Now
                </Button>
              ) : null}
              <Link href="/listings">
                <Button variant="outline" className="border-primary text-primary px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition-all btn-hover-effect">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/3 flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="Happy students" 
              className="w-full max-w-xs rounded-xl"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
