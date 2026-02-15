export interface PricingOption {
  id: string;
  name: string;
  priceInCents: number;
  type: 'base' | 'addon' | 'bundle';
  description: string;
}

export const PRICING_OPTIONS: PricingOption[] = [
  { id: 'single-sided', name: 'Single Sided Card', priceInCents: 1000, type: 'base', description: 'Professional single sided card' },
  { id: 'double-sided', name: 'Double Sided Card', priceInCents: 1500, type: 'base', description: 'Front and back design' },
  { id: 'magnetic-case', name: 'Magnetic Case', priceInCents: 500, type: 'addon', description: 'Protective magnetic display case' },
  { id: 'digital-download', name: 'Digital Download', priceInCents: 1000, type: 'addon', description: 'High-res 300 DPI digital file' },
  { id: 'deluxe-package', name: 'Deluxe Package', priceInCents: 2500, type: 'bundle', description: 'Double sided + case + digital download' },
];

export const getPricingOption = (id: string): PricingOption | undefined => {
  return PRICING_OPTIONS.find(option => option.id === id);
};

export const calculateTotal = (selections: { id: string; quantity: number }[]): number => {
  return selections.reduce((total, { id, quantity }) => {
    const option = getPricingOption(id);
    return total + (option ? option.priceInCents * quantity : 0);
  }, 0);
};

export const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};
