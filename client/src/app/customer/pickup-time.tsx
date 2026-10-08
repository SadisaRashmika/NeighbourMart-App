import { useEffect, useRef, useState } from 'react';
import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card, CheckoutPage, currency, Notice, ui } from '@/components/customer/CheckoutUI';
import { getPickupSlots, placeOrder, type PickupSlot } from '@/features/customer/cartApi';
import type { CustomerOrder } from '@/features/customer/customerTypes';
import { useCart } from '@/features/customer/useCart';

export default function PickupTime() {
  const { basket, refresh } = useCart();
  const [slots, setSlots] = useState<PickupSlot[]>([]);
  const [day, setDay] = useState('');
  const [selected, setSelected] = useState('');
  const [note, setNote] = useState('');
  const [payment, setPayment] = useState('cash');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const key = useRef(`checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const submitting = useRef(false);
  const load = async () => { setBusy(true); setError(''); try { const data = await getPickupSlots(); setSlots(data); setDay(current => data.some(s => s.date === current) ? current : data[0]?.date ?? ''); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load pickup times'); } finally { setBusy(false); } };
  useEffect(() => { void load(); }, []);
  const slot = slots.find(s => s.id === selected);
  const confirm = async () => {
    if (submitting.current || !slot) return;
    submitting.current = true; setBusy(true); setError('');
    try { const result = await placeOrder({ pickupSlotId: slot.id, checkoutKey: key.current, pickupNote: note, paymentMethod: payment }); setOrder(result); await refresh().catch(() => undefined); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to place order. Retry confirmation with the same selection.'); }
    finally { submitting.current = false; setBusy(false); }
  };
  return <CheckoutPage title={order ? 'Order confirmed' : 'Choose pickup time'}>
    <Link href="/customer/cart" style={ui.link}>← Back to basket</Link><Notice message={error} />{busy && <ActivityIndicator color="#087B37" />}
    {order ? <Card><Text style={ui.heading}>Thank you! Your order has been placed.</Text><Text selectable style={ui.text}>Order reference: {order.id}</Text><Text style={ui.price}>{currency(order.total)}</Text><Text style={ui.text}>{slot?.date} • {slot?.startTime}–{slot?.endTime}</Text><Text style={ui.text}>Pay by {payment} when collecting. The shop will prepare your groceries.</Text><Link href="/customer/orders" style={ui.link}>View my orders →</Link></Card> : <>
      {basket.shop && <Card><Text style={ui.heading}>{basket.shop.name}</Text><Text style={ui.text}>{basket.shop.address}</Text><Text style={ui.text}>Counter pickup • Choose a time convenient for you.</Text></Card>}
      <Text style={ui.heading}>Choose pickup day</Text>
      {[...new Set(slots.map(s => s.date))].map(date => <Pressable key={date} disabled={busy} accessibilityRole="radio" accessibilityState={{ checked: day === date }} style={day === date ? ui.selected : ui.choice} onPress={() => { setDay(date); setSelected(''); }}><Text style={ui.heading}>{new Date(`${date}T12:00:00`).toLocaleDateString('en-LK', { weekday: 'long', month: 'short', day: 'numeric' })}</Text></Pressable>)}
      <Text style={ui.heading}>Available time slots</Text>
      {slots.filter(s => s.date === day).map(s => <Pressable key={s.id} disabled={busy || !s.remaining} accessibilityRole="radio" accessibilityState={{ checked: selected === s.id, disabled: !s.remaining }} style={selected === s.id ? ui.selected : ui.choice} onPress={() => setSelected(s.id)}><Text style={ui.heading}>{s.startTime}–{s.endTime}</Text><Text style={ui.text}>{s.remaining ? `${s.remaining} places left` : 'Fully booked'}</Text></Pressable>)}
      {!busy && !slots.length && <Notice message="No future pickup slots are available. Please try again later or contact the shop." />}
      <Button label="Refresh pickup times" disabled={busy} onPress={() => void load()} />
      <Card><Input label="Pickup notes / vehicle details (optional)" maxLength={300} value={note} onChangeText={setNote} placeholder="For example: white car, collect at counter" editable={!busy} /><Text style={ui.heading}>Pay on collection</Text>{['cash', 'card', 'lankaqr'].map(method => <Pressable key={method} disabled={busy} accessibilityRole="radio" accessibilityState={{ checked: payment === method }} style={payment === method ? ui.selected : ui.choice} onPress={() => setPayment(method)}><Text style={ui.text}>{method.toUpperCase()}</Text></Pressable>)}<Text style={ui.price}>Estimated total: {currency(basket.total)}</Text>{slot && <Text style={ui.text}>Selected: {slot.date}, {slot.startTime}–{slot.endTime}</Text>}</Card>
      <Button label={busy ? 'Please wait…' : 'Confirm pickup time & place order'} disabled={busy || !slot?.remaining || !basket.items.length || basket.items.some(i => i.needsReplacement)} onPress={() => void confirm()} />
    </>}
  </CheckoutPage>;
}
