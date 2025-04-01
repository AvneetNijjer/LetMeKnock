import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const amenities = [
  {
    icon: "wifi",
    title: "High-Speed WiFi",
    description: "Stay connected with reliable internet.",
  },
  {
    icon: "dumbbell",
    title: "Fitness Centers",
    description: "Stay active with on-site gyms.",
  },
  {
    icon: "book",
    title: "Study Lounges",
    description: "Quiet spaces optimized for focus.",
  },
  {
    icon: "users",
    title: "Community Events",
    description: "Build connections with fellow students.",
  },
  {
    icon: "shield",
    title: "Security Systems",
    description: "24/7 secure access for peace of mind.",
  },
  {
    icon: "shirt",
    title: "Laundry Facilities",
    description: "On-site laundry for convenience.",
  },
];

export default function AmenitiesSection() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start gap-10">
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-secondary text-primary text-sm font-bold px-4 py-1 rounded-full mb-3">Student Living</span>
            <h2 className="text-3xl font-bold font-poppins mb-6">Amenities Designed for Student Life</h2>
            <p className="text-gray-600 mb-8">
              Our student accommodations are equipped with everything you need to excel in your studies while enjoying a balanced lifestyle. From high-speed internet to dedicated study spaces, we've thought of everything to make your student housing experience exceptional.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {amenities.map((amenity, index) => (
                <motion.div 
                  key={amenity.title}
                  className="flex items-start"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <div className="text-primary text-xl mt-1 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-${amenity.icon}`}>
                      {amenity.icon === 'wifi' && (
                        <>
                          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                          <line x1="12" y1="20" x2="12.01" y2="20" />
                        </>
                      )}
                      {amenity.icon === 'dumbbell' && (
                        <>
                          <path d="m6.5 6.5 11 11" />
                          <path d="m21 21-1-1" />
                          <path d="m3 3 1 1" />
                          <path d="m18 22 4-4" />
                          <path d="m2 6 4-4" />
                          <path d="m3 10 7-7" />
                          <path d="m14 21 7-7" />
                        </>
                      )}
                      {amenity.icon === 'book' && (
                        <>
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                        </>
                      )}
                      {amenity.icon === 'users' && (
                        <>
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </>
                      )}
                      {amenity.icon === 'shield' && (
                        <>
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        </>
                      )}
                      {amenity.icon === 'shirt' && (
                        <>
                          <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23" />
                        </>
                      )}
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{amenity.title}</h4>
                    <p className="text-gray-600 text-sm">{amenity.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <Button
              className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-600 transition-all btn-hover-effect"
            >
              Explore All Amenities
            </Button>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2 grid grid-cols-2 gap-4 mt-8 md:mt-0"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1564069114553-7215e1ff1890?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80" 
                alt="Student gym" 
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80" 
                alt="Study lounge" 
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Community event" 
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1521783593447-5702b9bfd267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80" 
                alt="Common area" 
                className="w-full h-48 object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
