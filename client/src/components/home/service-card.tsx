import { ReactNode } from "react";

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function ServiceCard({ icon, title, description }: ServiceCardProps) {
  return (
    <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 service-card">
      <div className="p-4 rounded-lg bg-blue-50 inline-block mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}