import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CommitteePersonData } from '@/types/committee';
import { Mail, Instagram } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import defaultCover from '@/assets/img/committee/tradAlpine2Cover.jpg';

interface UserCardProps {
  person: CommitteePersonData;
}

const UserCard: React.FC<UserCardProps> = ({ person }) => {
  const [coverError, setCoverError] = React.useState(false);

  return (
    <Card className="overflow-hidden border-zinc-200 pt-0 gap-0 shadow-sm hover:shadow-xl transition-all duration-300 group">
      <div className="h-36 w-full overflow-hidden bg-zinc-400">
        {!coverError && (
          <img
            src={person.cover}
            alt={`${person.name} cover`}
            className="w-full h-full object-cover transition-transform duration-500 opacity-90"
            onError={() => setCoverError(true)}
          />
        )}
      </div>

      <CardContent className="relative  text-center">
        <div className="flex justify-center -mt-12 mb-4">
          <div className="p-1 bg-white rounded-full shadow-md">
            <Avatar className="h-24 w-24 rounded-full border-2 border-white object-cover">
              <AvatarImage
                src={person.profile || undefined}
                alt={person.name}
              />
              <AvatarFallback>
                {person.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">
            {person.role}
          </p>
          <h4 className="text-xl font-bold tracking-tight text-zinc-900 leading-tight">
            {person.name}
          </h4>
        </div>

        {/* Social / Email Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-center gap-4">
          {/* If social is an email, we show mail icon, otherwise instagram */}
          <div className="flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors cursor-pointer">
            {person.social?.includes('@') ? (
              <Mail className="h-4 w-4" />
            ) : (
              <Instagram className="h-4 w-4" />
            )}
            <span className="text-xs font-semibold">{person.social}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
