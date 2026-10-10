function orderNumber(id: unknown) {
  const value = String(id);
  return `NM-${value.slice(-4).toUpperCase()}`;
}

export function toCustomerOrderDto(order: any, detailed = false) {
  const shop = order.shop && typeof order.shop === 'object' ? order.shop : null;
  const slot = order.pickupSlot && typeof order.pickupSlot === 'object' ? order.pickupSlot : null;
  const items = (order.items ?? []).map((item: any) => ({
    productId: String(item.product?._id ?? item.product),
    category: item.product?.category,
    name: item.name,
    imageUrl: item.imageUrl,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.quantity * item.unitPrice,
    substitutionPreference: item.substitutionPreference,
    substitution: item.substitution,
  }));
  const subtotal = items.reduce((sum: number, item: any) => sum + item.lineTotal, 0);
  const base = {
    id: String(order._id), orderNumber: orderNumber(order._id), status: order.status,
    total: order.total, subtotal, packingFee: order.packingFee ?? 0,
    communityDiscount: order.communityDiscount ?? 0, itemCount: items.reduce((n: number, i: any) => n + i.quantity, 0),
    paymentMethod: order.paymentMethod ?? 'cash',
    paymentStatus: order.paymentStatus ?? (order.status === 'picked-up' ? 'paid' : 'pending'),
    pickupNote: order.pickupNote,
    pickupCode: order.pickupCode,
    pickupPassToken: order.pickupPassToken,
    pickupVerifiedAt: order.pickupVerifiedAt,
    pickedUpAt: order.pickedUpAt,
    pendingSubstitutions: items.filter((item: any) => item.substitution?.status === 'pending').length,
    shop: shop ? { id: String(shop._id), name: shop.name, address: shop.address, phone: shop.phone } : { id: String(order.shop) },
    pickupSlot: slot ? { id: String(slot._id), date: slot.date, startTime: slot.startTime, endTime: slot.endTime } : null,
    createdAt: order.createdAt, updatedAt: order.updatedAt,
  };
  return detailed ? { ...base, items, timeline: order.timeline ?? [] } : base;
}

export function toDetailedShopOrderDto(order: any) {
  return {
    ...toCustomerOrderDto(order, true),
    customerName: order.customerName || order.customer?.name || 'Customer',
    customerPhone: order.customer?.phoneNumber,
  };
}
