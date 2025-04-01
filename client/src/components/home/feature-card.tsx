import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="text-center p-6 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <div className="mx-auto mb-4 p-3 rounded-full bg-blue-100 text-blue-600 inline-flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}