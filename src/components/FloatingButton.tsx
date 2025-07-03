
import React from 'react';
import { Plus } from 'lucide-react';

const FloatingButton = () => {
  return (
    <button className="fixed right-6 bottom-6 w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors z-50">
      <Plus size={24} />
      <div className="absolute -top-8 right-0 bg-white px-2 py-1 rounded shadow text-xs text-gray-800 whitespace-nowrap">
        New Requisition
      </div>
    </button>
  );
};

export default FloatingButton;
