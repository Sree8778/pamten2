
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, Brain, Target, Zap } from 'lucide-react';

interface TechQuestionnaireProps {
  onComplete: (data: any) => void;
}

const TechQuestionnaire = ({ onComplete }: TechQuestionnaireProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 'techRole',
      title: 'Level 1: Who Are You in the Tech Universe?',
      subtitle: 'If tech were a video game, what role would you pick?',
      icon: <Brain className="text-purple-400" size={32} />,
      options: [
        { value: 'coder', label: 'The Coder', emoji: '👨‍💻', desc: 'builds worlds from scratch' },
        { value: 'designer', label: 'The Designer', emoji: '🎨', desc: 'makes things beautiful and useful' },
        { value: 'hacker', label: 'The Hacker', emoji: '🛡️', desc: 'lives for the challenge' },
        { value: 'dreamer', label: 'The Dreamer', emoji: '💭', desc: 'has ideas nobody else does' },
        { value: 'manager', label: 'The Manager', emoji: '👑', desc: 'leads the squad to victory' }
      ]
    },
    {
      id: 'computerActivity',
      title: 'What\'s your favorite thing to do on a computer or phone?',
      subtitle: 'Choose what excites you most',
      icon: <Target className="text-blue-400" size={32} />,
      options: [
        { value: 'gaming', label: 'Play games', emoji: '🎮' },
        { value: 'building', label: 'Build stuff', emoji: '💻' },
        { value: 'design', label: 'Design/art', emoji: '🎨' },
        { value: 'solving', label: 'Solve problems', emoji: '🧩' },
        { value: 'ai', label: 'Talk to AI', emoji: '🤖' },
        { value: 'learning', label: 'Watch tutorials', emoji: '🎓' }
      ]
    },
    {
      id: 'dreamJob',
      title: 'Level 2: Your Future Tech Self',
      subtitle: 'Which of these sounds like your dream job?',
      icon: <Zap className="text-yellow-400" size={32} />,
      options: [
        { value: 'gamedev', label: 'Game Developer', emoji: '🎮' },
        { value: 'ai-engineer', label: 'AI Engineer', emoji: '🤖' },
        { value: 'cybersecurity', label: 'Cybersecurity Expert', emoji: '🛡️' },
        { value: 'designer', label: 'UI/UX Designer', emoji: '🎨' },
        { value: 'app-creator', label: 'App Creator', emoji: '📱' },
        { value: 'youtuber-coder', label: 'YouTuber + Coder', emoji: '📺' }
      ]
    },
    {
      id: 'workStyle',
      title: 'How would you like to work in the future?',
      subtitle: 'Pick your ideal work environment',
      icon: <Target className="text-green-400" size={32} />,
      options: [
        { value: 'remote', label: 'From home in pajamas', emoji: '🏠' },
        { value: 'office', label: 'In a space-age office', emoji: '🏢' },
        { value: 'travel', label: 'While traveling the world', emoji: '✈️' },
        { value: 'startup', label: 'From my own startup', emoji: '🚀' }
      ]
    },
    {
      id: 'salaryGuess',
      title: 'Level 3: Your Current Skills & Secret Powers',
      subtitle: 'How much do you think a junior developer can earn per year?',
      icon: <Brain className="text-purple-400" size={32} />,
      options: [
        { value: '20k', label: '$20,000', emoji: '💵' },
        { value: '50k', label: '$50,000', emoji: '💰' },
        { value: '100k', label: '$100,000', emoji: '💎' },
        { value: '200k', label: '$200,000', emoji: '🤑' }
      ],
      reveal: "Surprise! Junior developers actually earn $65,000-$85,000 on average! 🎉"
    },
    {
      id: 'skills',
      title: 'Have you ever done any of the following?',
      subtitle: 'Check all that apply to unlock your skill level',
      icon: <Zap className="text-yellow-400" size={32} />,
      options: [
        { value: 'website', label: 'Built a website', emoji: '🌐' },
        { value: 'game', label: 'Made a game', emoji: '🎮' },
        { value: 'design', label: 'Designed a logo or app screen', emoji: '🎨' },
        { value: 'code', label: 'Wrote code in Python, JavaScript, or Scratch', emoji: '💻' },
        { value: 'debug', label: 'Debugged something and felt like a genius', emoji: '🧠' }
      ],
      multiple: true
    }
  ];

  const handleAnswer = (value: string | string[]) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(prev => prev + 1), 300);
    } else {
      setTimeout(() => onComplete(newAnswers), 300);
    }
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Progress value={progress} className="w-full h-2 mb-4" />
          <p className="text-gray-400 text-sm text-center">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
          <div className="flex items-center mb-6">
            {currentQ.icon}
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-white">{currentQ.title}</h2>
              <p className="text-gray-300">{currentQ.subtitle}</p>
            </div>
          </div>

          <div className="space-y-3">
            {currentQ.options.map((option) => (
              <Button
                key={option.value}
                onClick={() => handleAnswer(currentQ.multiple ? [option.value] : option.value)}
                variant="outline"
                className="w-full p-6 h-auto bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-blue-400 text-left justify-start group transition-all duration-200"
              >
                <div className="flex items-center w-full">
                  <span className="text-2xl mr-4">{option.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-white group-hover:text-blue-300">
                      {option.label}
                    </div>
                    {option.desc && (
                      <div className="text-gray-400 text-sm">{option.desc}</div>
                    )}
                  </div>
                  <ChevronRight className="text-gray-400 group-hover:text-blue-400" size={20} />
                </div>
              </Button>
            ))}
          </div>

          {currentQ.reveal && answers[currentQ.id] && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-400/30">
              <p className="text-blue-300 font-medium">{currentQ.reveal}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechQuestionnaire;
