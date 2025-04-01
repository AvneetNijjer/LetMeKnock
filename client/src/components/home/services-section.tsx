import {
  Building,
  HeartHandshake,
  SearchCheck,
  ShieldCheck,
  Wallet,
  Users,
} from "lucide-react";
import ServiceCard from "./service-card";

export default function ServicesSection() {
  // Service data with icons and descriptions
  const services = [
    {
      id: 1,
      icon: <SearchCheck size={24} />,
      title: "Verified Listings",
      description: "All properties are verified by our team to ensure accurate information and safety standards."
    },
    {
      id: 2,
      icon: <Building size={24} />,
      title: "Campus Proximity",
      description: "Find housing options near your campus with our specialized location-based search feature."
    },
    {
      id: 3,
      icon: <Wallet size={24} />,
      title: "Student Budgets",
      description: "Filter by price ranges designed specifically for student budgets and financial aid packages."
    },
    {
      id: 4,
      icon: <HeartHandshake size={24} />,
      title: "Trusted Landlords",
      description: "Connect with landlords who understand student needs and are responsive to maintenance requests."
    },
    {
      id: 5,
      icon: <ShieldCheck size={24} />,
      title: "Secure Payments",
      description: "Our secure payment system protects both students and property owners during transactions."
    },
    {
      id: 6,
      icon: <Users size={24} />,
      title: "Roommate Matching",
      description: "Find compatible roommates with our matching system based on lifestyle and study habits."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose LetMeKnock</h2>
          <p className="text-lg text-gray-600">
            We've tailored our platform specifically for students searching for their ideal housing near campus.
            Here's what makes us different.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}