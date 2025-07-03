
import React from 'react';
import { Sparkles, Rocket, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onNext: () => void;
}

const WelcomeScreen = ({ onNext }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8 relative">
          <div className="absolute -top-4 -left-4 text-yellow-400">
            <Sparkles size={32} />
          </div>
          <div className="absolute -top-4 -right-4 text-blue-400">
            <Star size={32} />
          </div>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-purple-400">
            <Rocket size={32} />
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-4">
            Welcome to the
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent block mt-2">
              Future of Your Career
            </span>
          </h1>
        </div>
        
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Discover your tech destiny, unlock hidden opportunities, and join millions who've transformed their careers with AI-powered insights.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="text-3xl mb-3">🎮</div>
            <h3 className="text-white font-semibold mb-2">Gamified Journey</h3>
            <p className="text-gray-400 text-sm">Level up your career like your favorite game</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-white font-semibold mb-2">AI-Powered Matching</h3>
            <p className="text-gray-400 text-sm">Smart algorithms find your perfect role</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-white font-semibold mb-2">Real Salary Data</h3>
            <p className="text-gray-400 text-sm">Know your worth in the market</p>
          </div>
        </div>
        
        <Button 
          onClick={onNext}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          Start Your Tech Journey 🚀
        </Button>
        
        <p className="text-gray-500 text-sm mt-4">
          Takes less than 2 minutes • No credit card required
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
