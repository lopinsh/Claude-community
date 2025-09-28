import Link from 'next/link';
import { Tag } from '@prisma/client';
import { IconMapPin, IconUsers, IconClock, IconCalendar } from '@tabler/icons-react';

// Define the type for the data expected by the card.
// We are expecting a subset of the Activity model, including related data.
export interface ActivityWithRelations {
  id: string;
  title: string;
  description: string | null;
  type: 'Online' | 'InPerson' | 'Hybrid' | 'Other';
  location: string;
  maxMembers: number | null;
  createdAt: Date;
  creator: {
    id: string;
    name: string | null;
  };
  _count: {
    applications: number; // Represents the number of accepted members
  };
  tags: { tag: Tag }[];
}

interface ActivityCardProps {
  activity: ActivityWithRelations;
}

// Helper to determine the color for the activity type badge
const getTypeColor = (type: ActivityWithRelations['type']) => {
  switch (type) {
    case 'Online':
      return 'bg-blue-100 text-blue-800';
    case 'InPerson':
      return 'bg-green-100 text-green-800';
    case 'Hybrid':
      return 'bg-yellow-100 text-yellow-800';
    case 'Other':
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper to get the correct icon for the activity type
const TypeIcon: React.FC<{ type: ActivityWithRelations['type'] }> = ({ type }) => {
    switch (type) {
        case 'Online':
            return <IconClock className="w-4 h-4 text-blue-500" />;
        case 'InPerson':
            return <IconMapPin className="w-4 h-4 text-green-500" />;
        case 'Hybrid':
            return <IconCalendar className="w-4 h-4 text-yellow-500" />;
        default:
            return <IconClock className="w-4 h-4 text-gray-500" />;
    }
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const currentMembers = activity._count.applications;
  const maxMembers = activity.maxMembers;
  const typeColor = getTypeColor(activity.type);
  const formattedDate = activity.createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link href={`/activities/${activity.id}`} passHref>
      <div className="block cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
        <div className="p-5 flex flex-col h-full">
          
          {/* Header Row: Title and Type Badge */}
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 pr-4">
              {activity.title}
            </h2>
            <div className={`flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full ${typeColor}`}>
              {activity.type.replace('InPerson', 'In-Person')}
            </div>
          </div>
          
          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow">
            {activity.description || 'No description provided.'}
          </p>

          {/* Metadata Section */}
          <div className="space-y-2 mb-4">
            
            {/* Location/Type Detail */}
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <TypeIcon type={activity.type} />
                <span className="ml-2">
                    {activity.type === 'Online' ? 'Remote / Online' : activity.location}
                </span>
            </div>

            {/* Member Count */}
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <IconUsers className="w-4 h-4 text-indigo-500" />
              <span className="ml-2">
                {currentMembers} members 
                {maxMembers && maxMembers > 0 ? ` of ${maxMembers} spots filled` : ' (No limit specified)'}
              </span>
            </div>
            
            {/* Creation Date */}
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <IconCalendar className="w-4 h-4 text-pink-500" />
              <span className="ml-2">
                Posted on {formattedDate}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {activity.tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500 text-white shadow-md"
              >
                {tag.name}
              </span>
            ))}
          </div>

          {/* Footer: Creator Info */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Created by <span className="font-semibold text-gray-800 dark:text-gray-200">{activity.creator.name || 'Anonymous'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
