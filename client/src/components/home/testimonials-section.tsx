import { useState } from "react";
import TestimonialCard from "./testimonial-card";

export default function TestimonialsSection() {
  const [hovered, setHovered] = useState(false);
  
  // Sample testimonial data - in a real application, this would come from an API
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Student, UC Berkeley",
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      rating: 5,
      text: "Finding housing near campus had always been stressful until I found LetMeKnock. I secured my dream apartment within days!"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Graduate Student, UCLA",
      image: "https://randomuser.me/api/portraits/men/2.jpg",
      rating: 5,
      text: "As an international student, I was worried about finding safe housing. LetMeKnock connected me with verified landlords and I couldn't be happier with my place."
    },
    {
      id: 3,
      name: "Jessica Williams",
      role: "Student, NYU",
      image: "https://randomuser.me/api/portraits/women/3.jpg",
      rating: 4,
      text: "The search filters are so helpful! I found an affordable apartment with all the amenities I needed within walking distance to campus."
    },
    {
      id: 4,
      name: "David Patel",
      role: "Student, University of Michigan",
      image: "https://randomuser.me/api/portraits/men/4.jpg",
      rating: 5,
      text: "The virtual tours saved me so much time. I was able to secure housing before even arriving on campus!"
    },
    {
      id: 5,
      name: "Emma Rodriguez",
      role: "Student, UT Austin",
      image: "https://randomuser.me/api/portraits/women/5.jpg",
      rating: 5,
      text: "Responsive landlords and detailed listings made my housing search stress-free. Highly recommend to all students!"
    },
    {
      id: 6,
      name: "Marcus Thompson",
      role: "Student, Stanford",
      image: "https://randomuser.me/api/portraits/men/6.jpg",
      rating: 4,
      text: "The payment system is secure and the customer service team is always helpful. Great experience overall!"
    },
    {
      id: 7,
      name: "Olivia Kim",
      role: "Student, Columbia University",
      image: "https://randomuser.me/api/portraits/women/7.jpg",
      rating: 5,
      text: "I love how easy it is to filter for pet-friendly apartments. Found a great place that welcomes my cat!"
    },
    {
      id: 8,
      name: "Tyler Washington",
      role: "Student, USC",
      image: "https://randomuser.me/api/portraits/men/8.jpg",
      rating: 5,
      text: "The roommate matching feature is amazing! Found someone compatible with my schedule and habits."
    }
  ];
  
  // We'll create three columns of testimonials for the animation
  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);
  const thirdColumn = testimonials.slice(6, 8);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-lg text-gray-600">
            Don't just take our word for it. Here's what students across the country are saying about 
            their experience with LetMeKnock.
          </p>
        </div>
        
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 overflow-hidden"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* First Column */}
          <div className="flex flex-col space-y-6 md:space-y-8">
            <div className={`flex flex-col space-y-6 md:space-y-8 ${hovered ? 'pause-animation' : 'animate-scroll-slow'}`}>
              {firstColumn.map(testimonial => (
                <TestimonialCard 
                  key={testimonial.id}
                  name={testimonial.name}
                  role={testimonial.role}
                  image={testimonial.image}
                  rating={testimonial.rating}
                  text={testimonial.text}
                />
              ))}
              {/* Clone the same items to create a seamless loop */}
              {firstColumn.map(testimonial => (
                <TestimonialCard 
                  key={`clone-${testimonial.id}`}
                  name={testimonial.name}
                  role={testimonial.role}
                  image={testimonial.image}
                  rating={testimonial.rating}
                  text={testimonial.text}
                />
              ))}
            </div>
          </div>
          
          {/* Second Column - Delayed animation */}
          <div className="flex flex-col space-y-6 md:space-y-8">
            <div className={`flex flex-col space-y-6 md:space-y-8 ${hovered ? 'pause-animation' : 'animate-scroll-medium'}`}>
              {secondColumn.map(testimonial => (
                <TestimonialCard 
                  key={testimonial.id}
                  name={testimonial.name}
                  role={testimonial.role}
                  image={testimonial.image}
                  rating={testimonial.rating}
                  text={testimonial.text}
                />
              ))}
              {/* Clone the same items to create a seamless loop */}
              {secondColumn.map(testimonial => (
                <TestimonialCard 
                  key={`clone-${testimonial.id}`}
                  name={testimonial.name}
                  role={testimonial.role}
                  image={testimonial.image}
                  rating={testimonial.rating}
                  text={testimonial.text}
                />
              ))}
            </div>
          </div>
          
          {/* Third Column - Different speed animation */}
          <div className="flex flex-col space-y-6 md:space-y-8">
            <div className={`flex flex-col space-y-6 md:space-y-8 ${hovered ? 'pause-animation' : 'animate-scroll-fast'}`}>
              {thirdColumn.map(testimonial => (
                <TestimonialCard 
                  key={testimonial.id}
                  name={testimonial.name}
                  role={testimonial.role}
                  image={testimonial.image}
                  rating={testimonial.rating}
                  text={testimonial.text}
                />
              ))}
              {/* Clone the same items to create a seamless loop */}
              {thirdColumn.map(testimonial => (
                <TestimonialCard 
                  key={`clone-${testimonial.id}`}
                  name={testimonial.name}
                  role={testimonial.role}
                  image={testimonial.image}
                  rating={testimonial.rating}
                  text={testimonial.text}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}