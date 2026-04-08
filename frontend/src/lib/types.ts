export type AuthUser = {
  id: string;
  email: string;
};

export type LoginStartResponse = {
  loginSessionId: string;
  email: string;
  otpExpiresAt: string;
  deliveryChannel: string;
  otpDebugCode?: string;
};

export type LoginVerifyResponse = {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
};

export type MeResponse = {
  id: string;
  email: string;
  ordersCount: number;
  createdAt: string;
};

export type Eligibility = {
  available: boolean;
  reason?: string;
  requiresPayment?: boolean;
};

export type OrderStatus = 'UPCOMING' | 'PAST' | 'CANCELLED';

export type OperationStatus =
  | 'QUOTED'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'EXPIRED'
  | 'BLOCKED';

export type OrderListItem = {
  id: string;
  pnr: string;
  ticketNumber: string;
  passenger: string;
  route: string;
  origin: string;
  destination: string;
  departureAt: string;
  status: OrderStatus;
  amount: number;
  currency: string;
  exchange: Eligibility;
  refund: Eligibility;
};

export type OrderDocument = {
  id: string;
  type: string;
  title: string;
  fileName: string;
  url: string;
  deliveryEmail: string;
  lastSentAt?: string | null;
};

export type OrderEvent = {
  id: string;
  type: string;
  message: string;
  payload?: unknown;
  createdAt: string;
};

export type OrderDetail = {
  id: string;
  pnr: string;
  ticketNumber: string;
  passenger: {
    firstName: string;
    lastName: string;
    fullName: string;
  };
  itinerary: {
    route: string;
    origin: string;
    destination: string;
    departureAt: string;
    arrivalAt?: string | null;
  };
  status: OrderStatus;
  amount: number;
  currency: string;
  exchange: Eligibility;
  refund: Eligibility;
  documents: OrderDocument[];
  recentEvents: OrderEvent[];
};

export type ResendDocumentsResponse = {
  success: boolean;
  deliveryEmail: string;
  documents: Array<{
    id: string;
    type: string;
    title: string;
    lastSentAt?: string | null;
  }>;
};

export type BookingLookupResult = {
  id: string;
  pnr: string;
  route: string;
  departureAt: string;
  arrivalAt?: string | null;
  status: OrderStatus;
  passengerLastName: string;
  exchange: Eligibility;
  refund: Eligibility;
};

export type Quote = {
  amount: number;
  currency: string;
  expiresAt?: string | null;
  changeFee?: number;
  fareDifference?: number;
  refundFee?: number;
  requiresPayment?: boolean;
};

export type OperationView = {
  id: string;
  orderId: string;
  pnr: string;
  status: OperationStatus;
  reason?: string | null;
  quote: Quote;
  confirmedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
};

export type BlockedOperationResponse = {
  operationId: string;
  eligibility: Eligibility;
};
