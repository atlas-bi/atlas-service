import { type LoaderArgs, redirect } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { Separator } from '~/components/ui/separator';
import { authenticator } from '~/services/auth.server';

import { Nav } from './Nav';

const navItems = [
  {
    title: 'Types',
    href: '/admin/types',
  },
  {
    title: 'Categories',
    href: '/admin/categories',
  },
  {
    title: 'Workflows',
    href: '/admin/workflows',
  },
  {
    title: 'Labels',
    href: '/admin/labels',
  },
  {
    title: 'Jobs',
    href: '/admin/jobs',
  },
  {
    title: 'Users',
    href: '/admin/users',
  },
];

export async function loader({ request, params }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: `/auth/?returnTo=${encodeURI(
      new URL(request.url).pathname,
    )}`,
  });

  const url = new URL(request.url);

  if (url.pathname === '/admin') {
    return redirect(navItems[0].href);
  }

  return null;
}

export default function Admin() {
  return (
    <div className="space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Configuration</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <Nav items={navItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
