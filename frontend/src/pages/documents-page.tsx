import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { useAuth } from '@/app/auth-context';
import { AppShell } from '@/components/layout/app-shell';
import { DocumentRow } from '@/components/domain/document-row';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useAsyncData } from '@/hooks/use-async-data';
import { api } from '@/lib/api';
import { routes } from '@/lib/routes';
import { isCancelledOrder } from '@/lib/status';

export function DocumentsPage() {
  const { accessToken } = useAuth();
  const { orderId = '' } = useParams();
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const orderQuery = useAsyncData(() => api.getOrder(accessToken ?? '', orderId), [accessToken, orderId]);
  const documentsQuery = useAsyncData(() => api.getDocuments(accessToken ?? '', orderId), [accessToken, orderId]);

  async function handleResend() {
    setIsResending(true);
    setResendMessage(null);

    try {
      const response = await api.resendDocuments(accessToken ?? '', orderId);
      setResendMessage(`Документы повторно отправлены на ${response.deliveryEmail}`);
      documentsQuery.reload();
      orderQuery.reload();
    } catch (requestError) {
      setResendMessage(requestError instanceof Error ? requestError.message : 'Не удалось отправить документы');
    } finally {
      setIsResending(false);
    }
  }

  if (orderQuery.isLoading || documentsQuery.isLoading) {
    return (
      <AppShell>
        <section className="rounded-[28px] border border-white/70 bg-white p-8 text-base text-slate-500 shadow-card shadow-slate-900/5">
          Загружаем документы...
        </section>
      </AppShell>
    );
  }

  if (orderQuery.error || documentsQuery.error || !orderQuery.data) {
    return (
      <AppShell>
        <ErrorState
          description={orderQuery.error ?? documentsQuery.error ?? 'Не удалось загрузить документы'}
          onRetry={() => {
            orderQuery.reload();
            documentsQuery.reload();
          }}
        />
      </AppShell>
    );
  }

  const documents = documentsQuery.data ?? [];
  const isCancelled = isCancelledOrder(orderQuery.data.status);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          actions={
            !isCancelled ? (
              <PrimaryButton isLoading={isResending} onClick={() => void handleResend()} type="button">
                Повторно отправить документы
              </PrimaryButton>
            ) : undefined
          }
          backHref={routes.order(orderId)}
          backLabel="Назад к заказу"
          eyebrow={`Документы · ${orderQuery.data.pnr}`}
          subtitle="Откройте нужный документ или отправьте документы повторно на e-mail, если заказ активен."
          title="Документы по заказу"
        />

        {isCancelled ? (
          <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-base text-slate-700 shadow-card shadow-slate-900/5">
            Для отменённого заказа повторная отправка документов недоступна.
          </section>
        ) : null}

        {resendMessage ? (
          <section className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 text-base text-emerald-800 shadow-card shadow-slate-900/5">
            {resendMessage}
          </section>
        ) : null}

        {documents.length === 0 ? (
          <EmptyState description="Для этого заказа пока нет документов." title="Документы отсутствуют" />
        ) : (
          <div className="space-y-4">
            {documents.map((document) => (
              <DocumentRow document={document} key={document.id} orderId={orderId} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
