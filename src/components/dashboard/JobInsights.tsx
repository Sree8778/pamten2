
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, TrendingUp, Users, Briefcase, Star, Target } from 'lucide-react';

const JobInsights = () => {
  const insights = [
    {
      title: "🌎 Global Opportunities",
      value: "2.4M",
      subtitle: "Open positions worldwide",
      icon: <MapPin className="text-blue-500" size={24} />,
      trend: "+12% this month",
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "🏆 Top Skills in Demand",
      value: "React, AI/ML",
      subtitle: "Your skills are trending",
      icon: <Star className="text-yellow-500" size={24} />,
      trend: "85% match rate",
      color: "bg-yellow-50 border-yellow-200"
    },
    {
      title: "📊 Salary Growth",
      value: "+23%",
      subtitle: "Average yearly increase",
      icon: <TrendingUp className="text-green-500" size={24} />,
      trend: "Above industry avg",
      color: "bg-green-50 border-green-200"
    },
    {
      title: "🎯 Career Progression",
      value: "Senior Dev",
      subtitle: "Next logical step",
      icon: <Target className="text-purple-500" size={24} />,
      trend: "18 months avg",
      color: "bg-purple-50 border-purple-200"
    }
  ];

  const hotLocations = [
    { city: "San Francisco", jobs: "45K", salary: "$145K", growth: "+15%" },
    { city: "New York", jobs: "38K", salary: "$125K", growth: "+12%" },
    { city: "Seattle", jobs: "29K", salary: "$135K", growth: "+18%" },
    { city: "Austin", jobs: "22K", salary: "$115K", growth: "+22%" },
    { city: "Remote", jobs: "67K", salary: "$120K", growth: "+28%" }
  ];

  return (
    <div className="space-y-8">
      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight, index) => (
          <Card key={index} className={`${insight.color} transform hover:scale-105 transition-all duration-200 cursor-pointer`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                {insight.icon}
                <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-full">
                  {insight.trend}
                </span>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-1">{insight.title}</h3>
              <div className="text-2xl font-bold text-gray-900 mb-1">{insight.value}</div>
              <p className="text-sm text-gray-600">{insight.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hot Job Markets */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardTitle className="flex items-center gap-2">
            🔥 Hottest Job Markets Right Now
            <span className="text-sm bg-white/20 px-2 py-1 rounded-full">Live Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Location</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Open Jobs</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Avg Salary</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Growth</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {hotLocations.map((location, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="font-medium">{location.city}</span>
                        {location.city === 'Remote' && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">🌍 Global</span>}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-blue-600">{location.jobs}</td>
                    <td className="p-4 font-semibold text-green-600">{location.salary}</td>
                    <td className="p-4">
                      <span className="text-green-600 font-medium">{location.growth}</span>
                    </td>
                    <td className="p-4">
                      <button className="text-purple-600 hover:text-purple-800 font-medium text-sm hover:underline">
                        View Jobs →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Skills Trending */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              🚀 Skills Trending Up
              <span className="text-xs bg-purple-100 px-2 py-1 rounded-full">Hot</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { skill: 'AI/Machine Learning', demand: '+45%', match: '85%' },
                { skill: 'React/Next.js', demand: '+32%', match: '92%' },
                { skill: 'Python', demand: '+28%', match: '78%' },
                { skill: 'Cloud (AWS/Azure)', demand: '+41%', match: '45%' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="font-medium">{item.skill}</span>
                  <div className="flex gap-2 text-sm">
                    <span className="text-green-600 font-semibold">{item.demand}</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-purple-600">Your match: {item.match}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              💎 Premium Opportunities
              <span className="text-xs bg-green-100 px-2 py-1 rounded-full">VIP</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { company: 'Meta', role: 'Senior React Dev', salary: '$180K+', type: 'Remote' },
                { company: 'Google', role: 'AI Engineer', salary: '$200K+', type: 'Hybrid' },
                { company: 'Netflix', role: 'Full Stack Dev', salary: '$165K+', type: 'On-site' },
                { company: 'Stripe', role: 'Frontend Lead', salary: '$190K+', type: 'Remote' }
              ].map((job, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <div className="font-medium">{job.role}</div>
                    <div className="text-sm text-gray-600">{job.company} • {job.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">{job.salary}</div>
                    <button className="text-xs text-blue-600 hover:underline">Apply →</button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobInsights;
