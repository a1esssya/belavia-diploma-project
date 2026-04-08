import { Navigate, Route, Routes } from 'react-router-dom';

import { routes } from '@/lib/routes';
import { BookingStatusPage } from '@/pages/booking-status-page';
import { DocumentsPage } from '@/pages/documents-page';
import { ExchangePage } from '@/pages/exchange-page';
import { HistoryPage } from '@/pages/history-page';
import { LoginPage } from '@/pages/login-page';
import { OrderPage } from '@/pages/order-page';
import { RefundPage } from '@/pages/refund-page';
import { TripsPage } from '@/pages/trips-page';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={routes.login} replace />} />
      <Route path={routes.login} element={<LoginPage />} />
      <Route path={routes.trips} element={<TripsPage />} />
      <Route path={routes.order()} element={<OrderPage />} />
      <Route path={routes.documents()} element={<DocumentsPage />} />
      <Route path={routes.history()} element={<HistoryPage />} />
      <Route path={routes.exchange()} element={<ExchangePage />} />
      <Route path={routes.refund()} element={<RefundPage />} />
      <Route path={routes.bookingStatus} element={<BookingStatusPage />} />
    </Routes>
  );
}
