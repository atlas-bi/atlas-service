import { Outlet } from '@remix-run/react';

import { Nav } from './Nav';

export default function Admin() {
  return (
    <div className="container">
      <Nav />
      <Outlet />
    </div>
  );
}
