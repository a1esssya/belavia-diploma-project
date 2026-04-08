import { Link } from 'react-router-dom';

import { routes } from '@/lib/routes';

const links = [
  { to: routes.login, label: 'Login' },
  { to: routes.trips, label: 'Trips' },
  { to: routes.order('demo-order'), label: 'Order Card' },
  { to: routes.documents('demo-order'), label: 'Documents' },
  { to: routes.history('demo-order'), label: 'History' },
  { to: routes.exchange('demo-order'), label: 'Exchange' },
  { to: routes.refund('demo-order'), label: 'Refund' },
  { to: routes.bookingStatus, label: 'Booking lookup' },
];

export function AppNav() {
  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          className="rounded-full border border-brand/20 bg-brand/5 px-3 py-2 text-sm font-medium text-brand transition hover:bg-brand hover:text-white"
          key={link.to}
          to={link.to}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
