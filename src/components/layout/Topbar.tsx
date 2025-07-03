
import React from 'react';
import { Search, Bell, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ServicesMenu from './ServicesMenu';

const Topbar = () => {
  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center px-6">
      <div className="relative w-80">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Universal Search..."
          className="w-full h-10 pl-10 pr-4 rounded-md bg-gray-100 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <div className="annotation absolute -bottom-5 left-0">Universal Search</div>
      </div>
      
      <div className="flex-1" />
      
      <div className="flex items-center space-x-4">
        <ServicesMenu />
        <Button variant="outline" size="sm" className="flex items-center gap-1 h-9 px-3 bg-gray-100">
          <Plus size={16} />
          <span>New Req</span>
        </Button>
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-gray-700 rounded-full" />
          </Button>
        </div>
        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
          <User size={16} className="text-gray-600" />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
