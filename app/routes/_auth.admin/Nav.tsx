import { cn } from '@/lib/utils';
import { Link } from '@remix-run/react';
import { useLocation } from '@remix-run/react';
import { buttonVariants } from '~/components/ui/button';

interface NavProps extends React.HTMLAttributes<HTMLElement> {
  items: { title: string; href: string }[];
}

export const Nav = ({ className, items, ...props }: NavProps) => {
  const pathname = useLocation().pathname;
  return (
    <>
      <nav
        className={cn(
          'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
          className,
        )}
        {...props}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              pathname === item.href
                ? 'bg-muted hover:bg-muted'
                : 'hover:bg-slate-100/50 ',
              'justify-start',
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </>
  );
};
