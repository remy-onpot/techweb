export type StorePaymentMethod = 'pay_on_pickup' | 'paystack_momo';
const paymentMethodSet = new Set<StorePaymentMethod>(['pay_on_pickup', 'paystack_momo']);
const requestedMethods = (process.env.NEXT_PUBLIC_STORE_PAYMENT_METHODS ?? 'pay_on_pickup,paystack_momo')
  .split(',')
  .map((method) => method.trim())
  .filter((method): method is StorePaymentMethod => paymentMethodSet.has(method as StorePaymentMethod));

export const storeConfig = {
  name: process.env.NEXT_PUBLIC_STORE_NAME?.trim() || 'Shop-in-a-Box Store',
  currencyCode: process.env.NEXT_PUBLIC_STORE_CURRENCY_CODE?.trim().toUpperCase() || 'GHS',
  currencySymbol: process.env.NEXT_PUBLIC_STORE_CURRENCY_SYMBOL?.trim() || 'GH₵',
  phoneCountryCode: process.env.NEXT_PUBLIC_STORE_PHONE_COUNTRY_CODE?.replace(/\D/g, '') || '233',
  whatsappNumber: process.env.NEXT_PUBLIC_STORE_WHATSAPP_NUMBER?.replace(/\D/g, '') || '',
  enabledPaymentMethods: requestedMethods.length ? requestedMethods : ['pay_on_pickup'] as StorePaymentMethod[],
} as const;
