export const routes = {
  login: '/login',
  trips: '/trips',
  order: (orderId = ':orderId') => `/orders/${orderId}`,
  addBaggage: (orderId = ':orderId') => `/orders/${orderId}/baggage`,
  addServices: (orderId = ':orderId') => `/orders/${orderId}/services`,
  documents: (orderId = ':orderId') => `/orders/${orderId}/documents`,
  documentPreview: (orderId = ':orderId', documentId = ':documentId') =>
    `/orders/${orderId}/documents/${documentId}`,
  history: (orderId = ':orderId') => `/orders/${orderId}/history`,
  exchange: (orderId = ':orderId') => `/orders/${orderId}/exchange`,
  refund: (orderId = ':orderId') => `/orders/${orderId}/refund`,
  bookingStatus: '/booking-status',
};
