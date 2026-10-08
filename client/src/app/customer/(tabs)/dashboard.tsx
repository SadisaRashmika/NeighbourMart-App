import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card, CheckoutPage, currency, Notice, ui } from '@/components/customer/CheckoutUI';
import { getProducts } from '@/features/customer/customerApi';
import type { Product } from '@/features/customer/customerTypes';
import { useCart } from '@/features/customer/useCart';

export default function CustomerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addItem, busy, error: cartError, items } = useCart();
  const load = async () => { setLoading(true); setError(''); try { setProducts(await getProducts()); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load groceries'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  return <CheckoutPage title="Fresh groceries nearby"><Link href="/customer/cart" style={ui.link}>View basket ({items.length}) →</Link><Input label="Search groceries" value={query} onChangeText={setQuery} placeholder="Product or category" /><Notice message={error || cartError} />{loading && <ActivityIndicator />}<Button label="Refresh groceries" disabled={loading} onPress={() => void load()} />{products.filter(p => `${p.name} ${p.category ?? ''}`.toLowerCase().includes(query.toLowerCase())).map(p => <Card key={p.id}><Text style={ui.heading}>{p.name}</Text><Text style={ui.text}>{p.category} • {p.stock} available</Text><Text style={ui.price}>{currency(p.price)}</Text><Button label={p.available && p.stock ? 'Add to basket' : 'Unavailable'} disabled={busy || !p.available || !p.stock} onPress={() => void addItem(p).catch(() => undefined)} /></Card>)}</CheckoutPage>;
}
