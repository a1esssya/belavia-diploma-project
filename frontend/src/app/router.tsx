import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { useAuth } from '@/app/auth-context';
import { routes } from '@/lib/routes';
import { AddBaggagePage } from '@/pages/add-baggage-page';
import { AddServicesPage } from '@/pages/add-services-page';
import { BookingStatusPage } from '@/pages/booking-status-page';
import { DocumentPreviewPage } from '@/pages/document-preview-page';
import { DocumentsPage } from '@/pages/documents-page';
import { ExchangePage } from '@/pages/exchange-page';
import { HistoryPage } from '@/pages/history-page';
import { LoginPage } from '@/pages/login-page';
import { OrderPage } from '@/pages/order-page';
import { RefundPage } from '@/pages/refund-page';
import { TripsPage } from '@/pages/trips-page';

function ProtectedRoute() {
  const { status } = useAuth();

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        Загружаем профиль...
      </div>
    );
  }

  if (status === 'anonymous') {
    return <Navigate to={routes.login} replace />;
  }

  return <Outlet />;
}

export function AppRouter() {
  const { status } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={status === 'authenticated' ? routes.trips : routes.login} replace />}
      />
      <Route path={routes.login} element={<LoginPage />} />
      <Route path={routes.bookingStatus} element={<BookingStatusPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path={routes.trips} element={<TripsPage />} />
        <Route path={routes.order()} element={<OrderPage />} />
        <Route path={routes.addBaggage()} element={<AddBaggagePage />} />
        <Route path={routes.addServices()} element={<AddServicesPage />} />
        <Route path={routes.documents()} element={<DocumentsPage />} />
        <Route path={routes.documentPreview()} element={<DocumentPreviewPage />} />
        <Route path={routes.history()} element={<HistoryPage />} />
        <Route path={routes.exchange()} element={<ExchangePage />} />
        <Route path={routes.refund()} element={<RefundPage />} />
      </Route>
    </Routes>
  );
}
