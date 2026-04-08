import type {
  BlockedOperationResponse,
  BookingLookupResult,
  LoginStartResponse,
  LoginVerifyResponse,
  MeResponse,
  OperationView,
  OrderDetail,
  OrderDocument,
  OrderEvent,
  OrderListItem,
  ResendDocumentsResponse,
} from '@/lib/types';

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  token?: string;
};

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/v1';

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers();

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string'
        ? payload.message
        : `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export const api = {
  startLogin(email: string) {
    return request<LoginStartResponse>('/auth/login/start', {
      method: 'POST',
      body: { email },
    });
  },
  verifyLogin(email: string, loginSessionId: string, otpCode: string) {
    return request<LoginVerifyResponse>('/auth/login/verify', {
      method: 'POST',
      body: { email, loginSessionId, otpCode },
    });
  },
  logout(token: string) {
    return request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
      token,
    });
  },
  getMe(token: string) {
    return request<MeResponse>('/me', { token });
  },
  getOrders(token: string) {
    return request<OrderListItem[]>('/orders', { token });
  },
  getOrder(token: string, orderId: string) {
    return request<OrderDetail>(`/orders/${orderId}`, { token });
  },
  getDocuments(token: string, orderId: string) {
    return request<OrderDocument[]>(`/orders/${orderId}/documents`, { token });
  },
  resendDocuments(token: string, orderId: string) {
    return request<ResendDocumentsResponse>(`/orders/${orderId}/documents/resend`, {
      method: 'POST',
      token,
    });
  },
  getHistory(token: string, orderId: string) {
    return request<OrderEvent[]>(`/orders/${orderId}/events`, { token });
  },
  lookupBooking(input: {
    pnr?: string;
    ticketNumber?: string;
    passengerLastName: string;
  }) {
    return request<BookingLookupResult>('/booking/lookup', {
      method: 'POST',
      body: input,
    });
  },
  createExchangeQuote(token: string, orderId: string) {
    return request<OperationView | BlockedOperationResponse>(
      `/orders/${orderId}/exchange/quote`,
      {
        method: 'POST',
        token,
      },
    );
  },
  createRefundQuote(token: string, orderId: string) {
    return request<OperationView | BlockedOperationResponse>(`/orders/${orderId}/refund/quote`, {
      method: 'POST',
      token,
    });
  },
};
