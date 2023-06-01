import { Link } from '@remix-run/react';
import { Activity, Boxes, Repeat, Tags, Type, Users } from 'lucide-react';
import { Button, ButtonGroup } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { H1 } from '~/components/ui/typography';

export const Nav = () => (
  <>
    <H1 className="">Configuration</H1>
    <nav className="flex space-x-3 mb-3">
      <Button asChild variant="secondary">
        <Link to={`/admin/types`} className="space-x-3">
          <span className="icon">
            <Type size={14} />
          </span>
          <span>Types</span>
        </Link>
      </Button>
      <Button asChild variant="secondary">
        <Link to={`/admin/categories`} className="space-x-3">
          <span className="icon">
            <Boxes size={14} />
          </span>
          <span>Categories</span>
        </Link>
      </Button>
      <Button asChild variant="secondary">
        <Link to={`/admin/workflows`} className="space-x-3">
          <span className="icon">
            <Repeat size={14} />
          </span>
          <span>Workflows</span>
        </Link>
      </Button>
      <Button asChild variant="secondary">
        <Link to={`/admin/labels`} className="space-x-3">
          <span className="icon">
            <Tags size={14} />
          </span>
          <span>Labels</span>
        </Link>
      </Button>
      <Button asChild variant="secondary">
        <Link to={`/admin/jobs`} className="space-x-3">
          <span className="icon">
            <Activity size={14} />
          </span>
          <span>Jobs</span>
        </Link>
      </Button>
      <Button asChild variant="secondary">
        <Link to={`/admin/users`} className="space-x-3">
          <span className="icon">
            <Users size={14} />
          </span>
          <span>Users</span>
        </Link>
      </Button>
    </nav>
    <Separator className="mb-2" />
  </>
);
