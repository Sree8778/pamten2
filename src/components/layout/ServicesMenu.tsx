
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Search, Sparkles, ExternalLink } from 'lucide-react';

const ServicesMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const services = [
    {
      id: 'resume-builder',
      name: 'AI Resume Builder',
      description: 'Create professional resumes with AI',
      icon: <FileText size={20} />,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'resume-matcher',
      name: 'AI Resume Matcher',
      description: 'Match your resume to job requirements',
      icon: <Search size={20} />,
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const handleServiceClick = (serviceId: string) => {
    // Open in new tab
    const url = serviceId === 'resume-builder' ? '/resume-builder' : '/resume-matcher';
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:from-blue-600 hover:to-purple-700"
      >
        <Sparkles size={16} />
        Services
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3">AI-Powered Services</h3>
            <div className="space-y-3">
              {services.map(service => (
                <div
                  key={service.id}
                  onClick={() => handleServiceClick(service.id)}
                  className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group"
                >
                  <div className={`p-2 rounded-lg ${service.color} text-white mr-3`}>
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-800">{service.name}</h4>
                      <ExternalLink size={14} className="text-gray-400 group-hover:text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ServicesMenu;
