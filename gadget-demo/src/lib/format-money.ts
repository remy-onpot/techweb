import { storeConfig } from '@/lib/store-config';

const formatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format an integer amount in the store's minor currency units. */
export function formatMoney(pesewas: number): string {
  if (!Number.isFinite(pesewas)) return `${storeConfig.currencySymbol}0.00`;
  return `${storeConfig.currencySymbol}${formatter.format(pesewas / 100)}`;
}
