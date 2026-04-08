export const routes = {
  login: '/login',
  trips: '/trips',
  order: (orderId = ':orderId') => `/orders/${orderId}`,
  documents: (orderId = ':orderId') => `/orders/${orderId}/documents`,
  history: (orderId = ':orderId') => `/orders/${orderId}/history`,
  exchange: (orderId = ':orderId') => `/orders/${orderId}/exchange`,
  refund: (orderId = ':orderId') => `/orders/${orderId}/refund`,
  bookingStatus: '/booking-status',
};
