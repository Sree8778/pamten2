
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Calendar, User } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'interview',
    title: 'Interview Scheduled',
    description: 'John Smith for Sr. Developer position',
    time: '1h ago',
    icon: <Calendar size={16} />
  },
  {
    id: 2,
    type: 'check',
    title: 'Background Check Cleared',
    description: 'Maria Garcia for Product Manager role',
    time: '3h ago',
    icon: <Check size={16} />
  },
  {
    id: 3,
    type: 'candidate',
    title: 'New Candidate Match',
    description: 'Alex Wong matches Frontend Developer at 92%',
    time: '5h ago',
    icon: <User size={16} />
  },
  {
    id: 4,
    type: 'interview',
    title: 'Interview Feedback Added',
    description: 'Feedback for UX Designer candidate',
    time: '1d ago',
    icon: <Calendar size={16} />
  }
];

const ActivityFeed = () => {
  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-md font-bold text-gray-800">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {activities.map(activity => (
            <div key={activity.id} className="p-4 flex items-start">
              <div className={`mr-3 p-2 rounded-full bg-gray-100`}>
                {activity.icon}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-800">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.description}</p>
              </div>
              <div className="text-xs text-gray-400">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
