import { EmptyState } from '@/components/common/EmptyState';

export default function Cart() {
  return (
    <EmptyState
      description="Selected products, quantities, substitutions, and order totals will appear here."
      title="Cart / Order Summary"
    />
  );
}
