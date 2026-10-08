import { useEffect, useState } from 'react';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card, CheckoutPage, currency, Notice, ui } from '@/components/customer/CheckoutUI';
import { approveReplacement, getReplacements } from '@/features/customer/cartApi';
import type { Product } from '@/features/customer/customerTypes';
import { useCart } from '@/features/customer/useCart';

export default function SubstitutionApproval() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { items, refresh, remove } = useCart();
  const original = items.find(i => i.product.id === productId);
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = async () => { setBusy(true); setError(''); try { const data = await getReplacements(productId); setProducts(data); setSelected(data[0]?.id ?? ''); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load replacements'); } finally { setBusy(false); } };
  useEffect(() => { if (productId) void load(); }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps
  const decide = async (approve: boolean) => {
    setBusy(true); setError('');
    try { if (approve) { await approveReplacement(productId, selected); await refresh(); } else await remove(productId); router.replace('/customer/cart'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to save your decision'); }
    finally { setBusy(false); }
  };
  const replacement = products.find(p => p.id === selected);
  return <CheckoutPage title="Approve a replacement">
    <Link href="/customer/cart" style={ui.link}>← Back to basket</Link><Notice message={error} />
    {busy && <ActivityIndicator color="#087B37" />}
    {original ? <>
      <Card><Text style={ui.heading}>Original item</Text><Text style={ui.text}>{original.product.name} × {original.quantity}</Text><Text style={ui.price}>{currency(original.product.price * original.quantity)}</Text><Text style={ui.text}>{original.needsReplacement ? 'This quantity is currently unavailable.' : 'You can choose an alternative before ordering.'}</Text></Card>
      <Text style={ui.heading}>Available alternatives</Text>
      {!busy && !products.length && <Notice message="No replacements are available in this category. You can remove the original item or try again later." />}
      {products.map(p => <Pressable key={p.id} accessibilityRole="radio" accessibilityState={{ checked: p.id === selected }} disabled={busy} onPress={() => setSelected(p.id)} style={p.id === selected ? ui.selected : ui.choice}><Text style={ui.heading}>{p.name}</Text><Text style={ui.price}>{currency(p.price * original.quantity)}</Text><Text style={ui.text}>{original.quantity} units • {p.stock} in stock</Text></Pressable>)}
      {replacement && <Card><Text style={ui.heading}>{replacement.price <= original.product.price ? 'You save' : 'Price increase'}: {currency(Math.abs(replacement.price - original.product.price) * original.quantity)}</Text><Text style={ui.text}>Your basket total updates after approval. No payment is taken until pickup.</Text></Card>}
      <Button label="Approve selected replacement" disabled={busy || !selected} onPress={() => void decide(true)} /><Button label="Reject & remove item" disabled={busy} onPress={() => void decide(false)} /><Button label="Refresh alternatives" disabled={busy} onPress={() => void load()} />
    </> : <Notice message="This item is no longer in your basket." />}
  </CheckoutPage>;
}
