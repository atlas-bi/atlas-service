import { Link } from '@remix-run/react';
import { Activity, Boxes, Repeat, Tags, Type } from 'lucide-react';

export const Nav = () => (
  <div className="buttons">
    <Link className="button" to={`/admin/request-types`}>
      <span className="icon">
        <Type size={14} />
      </span>
      <span>Types</span>
    </Link>
    <Link className="button" to={`/admin/request-types`}>
      <span className="icon">
        <Boxes size={14} />
      </span>
      <span>Categories</span>
    </Link>
    <Link className="button" to={`/admin/request-types`}>
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
  </div>
);
