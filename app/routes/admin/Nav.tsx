import { Link } from '@remix-run/react';
import { Activity, Boxes, Repeat, Tags, Type, Users } from 'lucide-react';

export const Nav = () => (
  <>
    <h1 className="title is-2">Configuration</h1>
    <div className="buttons">
      <Link className="button" to={`/admin/types`}>
        <span className="icon">
          <Type size={14} />
        </span>
        <span>Types</span>
      </Link>
      <Link className="button" to={`/admin/categories`}>
        <span className="icon">
          <Boxes size={14} />
        </span>
        <span>Categories</span>
      </Link>
      <Link className="button" to={`/admin/workflows`}>
        <span className="icon">
          <Repeat size={14} />
        </span>
        <span>Workflows</span>
      </Link>
      <Link className="button" to={`/admin/labels`}>
        <span className="icon">
          <Tags size={14} />
        </span>
        <span>Labels</span>
      </Link>
      <Link className="button" to={`/admin/jobs`}>
        <span className="icon">
          <Activity size={14} />
        </span>
        <span>Jobs</span>
      </Link>
      <Link className="button" to={`/admin/users`}>
        <span className="icon">
          <Users size={14} />
        </span>
        <span>Users</span>
      </Link>
    </div>
  </>
);
