import { useCallback } from 'react';
import { Link, router, useFocusEffect } from 'expo-router';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card, CheckoutPage, currency, Notice, ui } from '@/components/customer/CheckoutUI';
import { useCart } from '@/features/customer/useCart';

export default function Cart() {
  const { basket, items, busy, error, refresh, changeQuantity, remove, clearCart } = useCart();
  useFocusEffect(useCallback(() => { void refresh().catch(() => undefined); }, [refresh]));
  const attempt = (work: Promise<void>) => void work.catch(() => undefined);
  return <CheckoutPage title="Your basket">
    <Notice message={error} />
    {busy && <ActivityIndicator color="#087B37" />}
    <Button label="Refresh basket" onPress={() => attempt(refresh())} disabled={busy} />
    {basket.shop && <Card><Text style={ui.heading}>{basket.shop.name}</Text><Text style={ui.text}>{basket.shop.address}</Text><Text style={ui.text}>Self-pickup at the counter • Pay on collection</Text></Card>}
    {!items.length && <Card><Text style={ui.heading}>Your basket is empty</Text><Text style={ui.text}>Add groceries from your local shop to get started.</Text><Link href="/customer/dashboard" style={ui.link}>Browse groceries →</Link></Card>}
    {!!items.length && <View style={ui.row}><Text style={ui.heading}>{items.length} basket items</Text><Button label="Clear" disabled={busy} onPress={() => Alert.alert('Clear basket?', 'Remove all groceries from your basket?', [{ text: 'Keep items', style: 'cancel' }, { text: 'Clear', style: 'destructive', onPress: () => attempt(clearCart()) }])} /></View>}
    {items.map(item => <Card key={item.product.id}>
      <Text style={ui.heading}>{item.product.name}</Text><Text style={ui.text}>Per unit: {currency(item.product.price)}</Text>
      <View style={ui.row}><Button accessibilityLabel={`Decrease ${item.product.name} quantity`} label="−" disabled={busy || item.quantity <= 1} onPress={() => attempt(changeQuantity(item.product.id, item.quantity - 1))} /><Text style={ui.heading}>{item.quantity}</Text><Button accessibilityLabel={`Increase ${item.product.name} quantity`} label="+" disabled={busy || item.quantity >= Math.min(99, item.product.stock ?? 99)} onPress={() => attempt(changeQuantity(item.product.id, item.quantity + 1))} /><Text style={ui.price}>{currency(item.quantity * item.product.price)}</Text></View>
      {item.needsReplacement && <Notice message="Inventory update: this quantity is unavailable. Choose a replacement or remove the item." />}
      <Button label={item.needsReplacement ? 'Review replacement' : 'Choose a different item'} disabled={busy} onPress={() => router.push({ pathname: '/customer/substitution', params: { productId: item.product.id } })} />
      <Button label="Remove item" disabled={busy} onPress={() => attempt(remove(item.product.id))} />
    </Card>)}
    {!!items.length && <><Card><Text style={ui.heading}>Payment & order summary</Text><View style={ui.row}><Text style={ui.text}>Items subtotal</Text><Text style={ui.price}>{currency(basket.total)}</Text></View><Text style={ui.text}>No packing fee. Final price and stock are checked at confirmation. Cash, card or LANKAQR at the counter.</Text></Card><Button label="Proceed to select pickup time →" disabled={busy || items.some(i => i.needsReplacement)} onPress={() => router.push('/customer/pickup-time')} /><Link href="/customer/dashboard" style={ui.link}>Add more items</Link></>}
  </CheckoutPage>;
}
