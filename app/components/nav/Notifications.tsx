import { Link } from '@remix-run/react';
import { Circle, Inbox } from 'lucide-react';
import { Button } from '~/components/ui/button';

export const Notifications = () => {
  return (
    <Button variant="ghost" className=" relative" asChild>
      <Link to="/notifications">
        <Inbox size={20} />
        <Circle
          size={14}
          className="absolute top-1 right-3 h-3 w-3 fill-blue-base text-blue-base "
        />
      </Link>
    </Button>
  );
};
