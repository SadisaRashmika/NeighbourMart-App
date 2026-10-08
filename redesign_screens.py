from pathlib import Path
root = Path(__file__).resolve().parent
files = {}
files['client/src/app/customer/(tabs)/cart.tsx'] = r'''import { useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge, cash, colors, ErrorNotice, Icon, p, PrimaryAction, productPhoto, PrototypePage } from '@/components/customer/PrototypeUI';
import { useCart } from '@/features/customer/useCart';

export default function Cart() {
  const { basket, items, busy, error, refresh, changeQuantity, remove, clearCart } = useCart();
  useFocusEffect(useCallback(() => { void refresh().catch(() => undefined); }, [refresh]));
  const attempt = (work: Promise<void>) => void work.catch(() => undefined);
  const units = items.reduce((sum, item) => sum + item.quantity, 0);
  const pending = items.filter(item => item.needsReplacement);
  const choose = (id: string) => router.push({ pathname: '/customer/substitution', params: { productId: id } });
  return <PrototypePage address={basket.shop?.address} refreshing={busy} onRefresh={() => attempt(refresh())}>
    <ErrorNotice message={error} />
    {basket.shop && <>
      <View style={[p.card, s.shop]}><View style={s.shopIcon}><Icon name="storefront-outline" size={28} /></View><View style={s.grow}><View style={p.row}><Text style={p.heading}>{basket.shop.name.replace(' (Demo)', '')}</Text><Icon name="checkmark-circle" size={18} /></View><View style={s.pill}><Text style={s.counter}>Counter pickup</Text></View><View style={p.inline}><Icon name="time-outline" size={14} color="#8A6524" /><Text style={s.pickup}>Choose your pickup time at checkout</Text></View></View></View>
      <View style={p.row}><View style={p.inline}><Icon name="bag-handle-outline" size={15} /><Text style={s.meta}>Self-Pickup at Counter</Text></View><Text style={s.metaMuted}>Cash / LANKAQR</Text></View>
    </>}
    {!!pending.length && <View style={s.inventory}><View style={s.inventoryIcon}><Icon name="archive-outline" size={20} color="#865C13" /></View><View style={s.grow}><Text style={s.inventoryTitle}>INVENTORY UPDATE ●</Text><Text style={s.inventoryText}>Notice: {pending[0].product.name} is unavailable. Please review a substitute.</Text></View></View>}
    <View style={p.row}><View style={[p.inline, { flex: 1, flexWrap: 'wrap' }]}><Text style={p.heading}>Your Basket Items</Text><Badge label={`${items.length} items (${units} units)`} /></View><Pressable accessibilityRole="button" disabled={busy || !items.length} style={p.linkTouch} onPress={() => Alert.alert('Clear basket?', 'Remove all groceries?', [{ text: 'Keep items', style: 'cancel' }, { text: 'Clear', style: 'destructive', onPress: () => attempt(clearCart()) }])}><View style={p.inline}><Icon name="trash-outline" size={15} /><Text style={p.link}>Clear</Text></View></Pressable></View>
    {!items.length && <View style={p.card}><Text style={p.heading}>Your basket is empty</Text><Text style={p.text}>Add groceries from your local shop to get started.</Text><PrimaryAction label="Browse groceries" icon="cart-outline" onPress={() => router.navigate('/customer/dashboard')} /></View>}
    {items.map(item => <View style={p.card} key={item.product.id}>
      <View style={s.productRow}><View style={s.photoWrap}><Image source={productPhoto(item.product)} style={s.photo} />{item.needsReplacement && <Text style={s.lowStock}>LOW STOCK</Text>}</View><View style={s.grow}><View style={p.row}><Text style={[p.name, s.grow]}>{item.product.name}</Text><Pressable accessibilityLabel={`Remove ${item.product.name}`} accessibilityRole="button" disabled={busy} onPress={() => attempt(remove(item.product.id))} style={s.close}><Icon name="close" size={19} color="#8A948B" /></Pressable></View><Text style={p.tiny}>Per unit: {cash(item.product.price)}</Text><View style={[p.row, { marginTop: 12 }]}><View style={s.stepper}><Pressable accessibilityLabel={`Decrease ${item.product.name} quantity`} accessibilityRole="button" disabled={busy || item.quantity <= 1} style={s.step} onPress={() => attempt(changeQuantity(item.product.id, item.quantity - 1))}><Icon name="remove" size={17} color={item.quantity <= 1 ? '#ABB0AB' : colors.ink} /></Pressable><Text style={s.quantity}>{item.quantity}</Text><Pressable accessibilityLabel={`Increase ${item.product.name} quantity`} accessibilityRole="button" disabled={busy || item.quantity >= Math.min(99, item.product.stock ?? 99)} style={s.step} onPress={() => attempt(changeQuantity(item.product.id, item.quantity + 1))}><Icon name="add" size={17} color={colors.ink} /></Pressable></View><Text style={p.price}>{cash(item.quantity * item.product.price)}</Text></View></View></View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Edit substitution for ${item.product.name}`} disabled={busy} onPress={() => choose(item.product.id)} style={[s.substitution, item.needsReplacement && s.pending]}><Icon name={item.needsReplacement ? 'notifications-outline' : 'sync-circle-outline'} size={17} color={item.needsReplacement ? '#8A6524' : colors.green} /><View style={s.grow}><Text style={s.subTitle}>Substitute: {item.needsReplacement ? 'Allowed with approval' : 'Choose an alternative'}</Text><Text style={[p.tiny, { color: item.needsReplacement ? '#8A6524' : colors.green }]}>{item.needsReplacement ? 'Review available replacements before checkout.' : 'You approve every change before ordering.'}</Text></View><Text style={[p.link, item.needsReplacement && { color: '#8A6524' }]}>{item.needsReplacement ? 'Modify' : 'Edit'}</Text></Pressable>
    </View>)}
    {!!items.length && <>
      <View style={p.info}><View style={[p.circle, { backgroundColor: colors.green }]}><Icon name="bag-handle-outline" color="#FFFFFF" /></View><View style={s.grow}><Text style={p.name}>Pack Fresh on Arrival</Text><Text style={p.text}>Collect fresh groceries at your selected pickup time.</Text></View></View>
      <View style={p.card}><View style={p.row}><Text style={p.heading}>Payment &amp; Order Summary</Text><Icon name="receipt-outline" /></View><View style={p.row}><Text style={p.text}>Items Subtotal ({units} items)</Text><Text style={s.amount}>{cash(basket.subtotal ?? items.reduce((sum, i) => sum + i.quantity * i.product.price, 0))}</Text></View><View style={p.row}><Text style={p.text}>Shop Packing Fee ⓘ</Text><Text style={s.amount}>{cash(basket.packingFee ?? 0)}</Text></View><View style={p.row}><Text style={[p.text, { color: colors.green }]}>Store Discount (Community Perk)</Text><Text style={[s.amount, { color: colors.green }]}>−{cash(basket.communityDiscount ?? 0)}</Text></View>{!!pending.length && <View style={s.summaryPending}><Text style={p.tiny}>Substitutions Pending:</Text><Text style={s.pendingAmount}>{pending.length} item may adjust</Text></View>}<View style={s.total}><View><Text style={p.heading}>Estimated Total</Text><Text style={p.tiny}>Pay at store counter</Text></View><Text style={s.totalPrice}>{cash(basket.total)}</Text></View><View style={s.settlement}><Icon name="qr-code-outline" size={17} /><Text style={s.settlementText}>Counter Settlement:</Text><Icon name="cash-outline" size={15} /><Text style={p.tiny}>Cash</Text><Text style={p.tiny}>|</Text><Icon name="qr-code-outline" size={14} /><Text style={p.tiny}>LANKAQR</Text></View></View>
      <PrimaryAction label="Proceed to Select Pickup Time →" disabled={busy || !!pending.length} onPress={() => router.push('/customer/pickup-time')} />
      {!!pending.length && <Text style={s.hint}>Approve or remove unavailable items to continue.</Text>}
      <Pressable accessibilityRole="button" style={s.addMore} onPress={() => router.navigate('/customer/dashboard')}><Icon name="cart-outline" size={19} /><Text style={p.name}>Add More Items</Text></Pressable>
    </>}
    {busy && <ActivityIndicator color={colors.green} />}
  </PrototypePage>;
}
const s = StyleSheet.create({
  grow: { flex: 1 }, shop: { flexDirection: 'row', alignItems: 'center', gap: 13 }, shopIcon: { width: 74, height: 80, backgroundColor: '#E6F1E9', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, pill: { alignSelf: 'flex-start', backgroundColor: '#EDEBFF', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 8, marginVertical: 5 }, counter: { color: colors.green, fontSize: 11, fontWeight: '600' }, pickup: { color: '#8A6524', fontSize: 11, fontWeight: '600', flex: 1 },
  meta: { fontSize: 10, color: colors.ink }, metaMuted: { fontSize: 10, color: colors.muted }, inventory: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFEBD8', padding: 12, borderRadius: 13 }, inventoryIcon: { backgroundColor: '#FFBD39', width: 33, height: 33, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }, inventoryTitle: { fontSize: 10, color: '#775216', fontWeight: '800', marginBottom: 3 }, inventoryText: { fontSize: 11, color: '#78572A', lineHeight: 15 },
  productRow: { flexDirection: 'row', gap: 13, alignItems: 'center' }, photoWrap: { width: 65, height: 76, justifyContent: 'center', alignItems: 'center' }, photo: { width: 61, height: 72, resizeMode: 'contain' }, lowStock: { position: 'absolute', bottom: 0, backgroundColor: '#FFB733', color: '#784600', fontSize: 8, paddingHorizontal: 5, paddingVertical: 4, borderRadius: 3, fontWeight: '700' }, close: { minWidth: 28, minHeight: 28, alignItems: 'center', justifyContent: 'center' }, stepper: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 3, borderRadius: 24, backgroundColor: '#F2F0FA' }, step: { width: 31, height: 31, backgroundColor: '#FFFFFF', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, quantity: { minWidth: 17, textAlign: 'center', fontWeight: '600', fontSize: 12, color: colors.ink },
  substitution: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: '#F1EFFA', padding: 9, borderRadius: 8, minHeight: 47 }, pending: { backgroundColor: '#FFF7E9' }, subTitle: { fontSize: 11, fontWeight: '600', color: colors.ink, marginBottom: 3 }, amount: { fontSize: 12, fontWeight: '600', color: colors.ink }, summaryPending: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F4F1FB', borderRadius: 8, padding: 8 }, pendingAmount: { fontSize: 10, color: '#8A6524', fontWeight: '700' }, total: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#EEEFF2', paddingTop: 12 }, totalPrice: { fontSize: 24, fontWeight: '700', color: colors.green }, settlement: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F3F1FA', borderRadius: 7, padding: 8 }, settlementText: { fontSize: 10, fontWeight: '600', color: colors.ink }, addMore: { backgroundColor: '#FFFFFF', borderRadius: 12, minHeight: 48, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' }, hint: { color: '#8A6524', fontSize: 11, textAlign: 'center' },
});
'''
files['client/src/app/customer/substitution.tsx'] = r'''import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge, cash, colors, ErrorNotice, Icon, p, PrimaryAction, productPhoto, PrototypePage } from '@/components/customer/PrototypeUI';
import { approveReplacement, getReplacements } from '@/features/customer/cartApi';
import type { Product } from '@/features/customer/customerTypes';
import { useCart } from '@/features/customer/useCart';

export default function SubstitutionApproval() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { basket, items, refresh, remove } = useCart();
  const original = items.find(i => i.product.id === productId);
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    getReplacements(productId).then(data => { if (active) { setProducts(data); setSelected(data[0]?.id ?? ''); } }).catch(e => { if (active) setError(e instanceof Error ? e.message : 'Unable to load replacements'); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [productId]);
  const load = async () => { setBusy(true); setError(''); try { const data = await getReplacements(productId); setProducts(data); setSelected(data[0]?.id ?? ''); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to refresh alternatives'); } finally { setBusy(false); } };
  const decide = async (approve: boolean) => {
    setBusy(true); setError('');
    try { if (approve) { await approveReplacement(productId, selected); await refresh(); } else await remove(productId); router.replace('/customer/cart'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to save your decision'); }
    finally { setBusy(false); }
  };
  const replacement = products.find(item => item.id === selected);
  const saving = original && replacement ? (original.product.price - replacement.price) * original.quantity : 0;
  const newTotal = Math.max(0, basket.total - saving);
  return <PrototypePage address={basket.shop?.address} footer refreshing={busy} onRefresh={() => void load()}>
    <ErrorNotice message={error} />
    <View style={s.alert}><Icon name="alert-circle" size={19} color="#865717" /><Text style={s.alertText}>ACTION REQUIRED: ITEM REPLACEMENT SUGGESTION</Text></View>
    <View style={s.shop}><View style={p.circle}><Icon name="storefront-outline" size={23} /></View><View style={{ flex: 1 }}><Text style={p.tiny}>Your basket</Text><Text numberOfLines={1} style={p.heading}>{basket.shop?.name.replace(' (Demo)', '') || 'Local grocery shop'}</Text></View><Badge label="● Review now" background="#FFFFFF" /></View>
    {original ? <>
      <Text style={p.title}>Approve substitution for your order?</Text>
      <Text style={s.description}><Text style={{ fontWeight: '700' }}>{original.product.name}</Text> {original.needsReplacement ? 'is currently out of stock.' : 'is currently in your basket.'} {replacement ? <>You can choose <Text style={{ color: colors.green, fontWeight: '700' }}>{replacement.name}</Text> instead.</> : 'Review available alternatives below.'}</Text>
      <View style={s.comparison}>
        <View style={s.original}><View style={s.imageWrap}><Image source={productPhoto(original.product)} style={[s.productImage, original.needsReplacement && { opacity: .48 }]} />{original.needsReplacement && <View style={s.stockOverlay}><Icon name="ban-outline" color="#FFFFFF" size={13} /><Text style={s.overlayText}>Low Stock</Text></View>}</View><View style={s.details}><Badge label={original.needsReplacement ? 'Unavailable' : 'Original item'} color="#BC3434" background="#FFF0F0" /><Text style={s.productName}>{original.product.name.replace(' 500g', '')}</Text><Text style={p.text}>Quantity: {original.quantity}</Text><Text style={[p.text, s.oldPrice]}>{cash(original.product.price * original.quantity)}</Text><Text style={s.wasInCart}>Was in cart</Text></View></View>
        <View style={s.replacement}>{replacement ? <><View style={s.imageWrap}><Image source={productPhoto(replacement)} style={s.productImage} /><View style={s.recommended}><Icon name="thumbs-up" size={12} color="#FFFFFF" /><Text style={s.overlayText}>Recommended</Text></View></View><View style={s.details}><Badge label="Available alternative" background="#C6F6DA" /><Text style={s.productName}>{replacement.name.replace(' 500g', '')}</Text><Text style={p.text}>Quantity: {original.quantity}</Text><Text style={s.replacementPrice}>{cash(replacement.price * original.quantity)}</Text><Text style={s.saving}>{saving >= 0 ? '↘ Save' : 'Price increase'} {cash(Math.abs(saving))}</Text></View></> : <View style={s.details}><Icon name="bag-outline" size={38} /><Text style={p.text}>No alternatives available. Refresh or remove the item.</Text></View>}</View>
      </View>
      {products.length > 1 && <View style={s.alternatives}>{products.map(item => <Pressable key={item.id} disabled={busy} accessibilityRole="radio" accessibilityState={{ checked: selected === item.id }} onPress={() => setSelected(item.id)} style={[s.alternative, selected === item.id && { borderColor: colors.green, backgroundColor: '#E8F5EE' }]}><Text style={p.text}>{item.name}</Text></Pressable>)}</View>}
      {replacement && <View style={s.savingsCard}><View style={[p.circle, { backgroundColor: colors.green }]}><Icon name="wallet" color="#FFFFFF" /></View><View style={{ flex: 1 }}><Text style={p.name}>{saving >= 0 ? 'Save' : 'Price increase of'} {cash(Math.abs(saving))} on this swap</Text><Text style={s.savingsText}>Order total automatically recalibrates to <Text style={{ fontWeight: '700' }}>{cash(newTotal)}</Text></Text></View></View>}
      <View style={p.info}><View style={s.noteIcon}><Icon name="chatbox-ellipses-outline" color="#865717" size={18} /></View><View style={{ flex: 1 }}><Text style={p.name}>A note before you approve:</Text><Text style={s.note}>Your selected replacement comes from the same shop and product category. The quantity stays the same.</Text></View></View>
      <PrimaryAction icon="checkmark-circle-outline" label={replacement ? `Approve Substitute (${cash(replacement.price * original.quantity)})` : 'Approve Substitute'} disabled={busy || !replacement} onPress={() => void decide(true)} />
      <PrimaryAction icon="close-circle-outline" label="Reject & Remove Item" secondary disabled={busy} onPress={() => void decide(false)} />
      <View style={s.paymentNote}><Icon name="shield-checkmark-outline" size={16} color="#849185" /><Text style={p.tiny}>You will not be charged until pickup at the store.</Text></View>
    </> : <Text style={p.text}>This item is no longer in your basket.</Text>}
    {busy && <ActivityIndicator color={colors.green} />}
  </PrototypePage>;
}
const s = StyleSheet.create({
  alert: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#FCE8D0', borderRadius: 28, paddingHorizontal: 14, paddingVertical: 11 }, alertText: { flex: 1, color: '#78521D', fontSize: 11, fontWeight: '600' }, shop: { backgroundColor: '#F0EFFB', borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, marginBottom: 5 }, description: { fontSize: 13, lineHeight: 20, color: '#3C4A3F' },
  comparison: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 8 }, original: { flex: 1, backgroundColor: '#F1F0FA', borderRadius: 14, overflow: 'hidden' }, replacement: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden', shadowColor: '#151515', shadowOpacity: .1, shadowRadius: 3, shadowOffset: { width: 0, height: 3 }, elevation: 2 }, imageWrap: { margin: 8, aspectRatio: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: '#F1F0F7', alignItems: 'center', justifyContent: 'center' }, productImage: { width: '100%', height: '100%', resizeMode: 'cover' }, stockOverlay: { position: 'absolute', flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: '#555A65', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 15 }, overlayText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' }, recommended: { position: 'absolute', top: 0, left: 0, flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: colors.green, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 12 }, details: { padding: 11, gap: 6, alignItems: 'flex-start' }, productName: { fontSize: 18, fontWeight: '600', color: colors.ink }, oldPrice: { textDecorationLine: 'line-through', color: '#8E948E', marginTop: 12 }, wasInCart: { fontSize: 14, color: '#91968F', fontWeight: '600' }, replacementPrice: { marginTop: 12, color: colors.green, fontSize: 22, fontWeight: '700' }, saving: { fontSize: 11, color: colors.green, fontWeight: '700' }, alternatives: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, alternative: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#DDE1DD' }, savingsCard: { backgroundColor: '#B9F3CF', flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 14, padding: 15 }, savingsText: { color: '#25412D', fontSize: 12, lineHeight: 16, marginTop: 3 }, noteIcon: { backgroundColor: '#FFB926', borderRadius: 16, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }, note: { fontSize: 13, fontStyle: 'italic', lineHeight: 20, color: colors.ink, marginTop: 9 }, paymentNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginVertical: 4 },
});
'''
files['client/src/app/customer/pickup-time.tsx'] = r'''import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Badge, cash, colors, ErrorNotice, Icon, p, PrimaryAction, PrototypePage, shopPhoto } from '@/components/customer/PrototypeUI';
import { getPickupSlots, placeOrder, type PickupSlot } from '@/features/customer/cartApi';
import type { CustomerOrder } from '@/features/customer/customerTypes';
import { useCart } from '@/features/customer/useCart';

function time(value: string) { const [hour, minute] = value.split(':').map(Number); return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`; }
function dateLabel(date: string) {
  const today = new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 330 * 60000 + 86400000).toISOString().slice(0, 10);
  const d = new Date(`${date}T12:00:00`);
  const prefix = date === today ? 'Today' : date === tomorrow ? 'Tomorrow' : d.toLocaleDateString('en-LK', { weekday: 'short' });
  return `${prefix}, ${d.toLocaleDateString('en-LK', { day: 'numeric', month: 'short' })}`;
}
export default function PickupTime() {
  const { basket, refresh } = useCart();
  const [slots, setSlots] = useState<PickupSlot[]>([]);
  const [day, setDay] = useState('');
  const [selected, setSelected] = useState('');
  const [note, setNote] = useState('');
  const [payment, setPayment] = useState('cash');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const key = useRef('');
  const submitting = useRef(false);
  const scroll = useRef<ScrollView>(null);
  useEffect(() => { let active = true; getPickupSlots().then(data => { if (active) { setSlots(data); setDay(data[0]?.date ?? ''); } }).catch(e => { if (active) setError(e instanceof Error ? e.message : 'Unable to load pickup times'); }).finally(() => { if (active) setBusy(false); }); return () => { active = false; }; }, []);
  const load = async () => { setBusy(true); setError(''); try { const data = await getPickupSlots(); setSlots(data); setDay(current => data.some(item => item.date === current) ? current : data[0]?.date ?? ''); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to refresh slots'); } finally { setBusy(false); } };
  const slot = slots.find(item => item.id === selected);
  const confirm = async () => {
    if (submitting.current || !slot) return;
    submitting.current = true; setBusy(true); setError('');
    if (!key.current) key.current = `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try { const result = await placeOrder({ pickupSlotId: slot.id, checkoutKey: key.current, pickupNote: note, paymentMethod: payment }); setOrder(result); await refresh().catch(() => undefined); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to place order. Please retry.'); }
    finally { submitting.current = false; setBusy(false); }
  };
  const days = [...new Set(slots.map(item => item.date))];
  const daySlots = slots.filter(item => item.date === day);
  return <PrototypePage pickup footer address={basket.shop?.address} refreshing={busy} onRefresh={() => void load()}>
    <ErrorNotice message={error} />
    {order ? <View style={p.card}><Icon name="checkmark-circle" size={50} /><Text style={p.title}>Order confirmed</Text><Text selectable style={p.text}>Order reference: {order.id}</Text><Text style={p.price}>{cash(order.total)}</Text><Text style={p.text}>{slot && `${dateLabel(slot.date)}, ${time(slot.startTime)} – ${time(slot.endTime)}`}</Text><Text style={p.text}>Pay by {payment.toUpperCase()} on collection.</Text><PrimaryAction label="View my orders" icon="receipt-outline" onPress={() => router.navigate('/customer/orders')} /></View> : <>
      <View style={s.shop}><View style={{ flex: 1, gap: 6 }}><View style={{ alignSelf: 'flex-start' }}><Badge label="● Express Curbside & Counter" /></View><Text style={s.shopName}>{basket.shop?.name.replace(' (Demo)', '') || 'Your grocery shop'}</Text><View style={p.inline}><Icon name="storefront-outline" size={14} /><Text style={[p.text, { flex: 1 }]}>{basket.shop?.address || 'Your local neighbourhood'}</Text></View></View><Image source={shopPhoto} style={s.shopPhoto} /></View>
      <View style={p.info}><View style={s.freshIcon}><Icon name="snow-outline" size={24} color="#06613D" /></View><View style={{ flex: 1 }}><Text style={p.heading}>Peak Cold-Chain Freshness</Text><Text style={[p.text, { marginTop: 5 }]}>Choose a convenient pickup window for your dairy, fresh produce, and chilled items.</Text></View></View>
      <Text style={s.sectionLabel}>CHOOSE PICKUP DAY</Text>
      <ScrollView ref={scroll} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.days}>{days.map(date => <Pressable key={date} accessibilityRole="radio" accessibilityState={{ checked: date === day }} disabled={busy} style={[s.day, date === day && s.daySelected]} onPress={() => { setDay(date); setSelected(''); }}><Icon name="calendar-outline" size={17} color={date === day ? '#FFFFFF' : colors.ink} /><Text style={[s.dayText, date === day && { color: '#FFFFFF' }]}>{dateLabel(date)}</Text></Pressable>)}</ScrollView>
      {[{ label: 'Afternoon Slots', icon: 'sunny-outline' as const, values: daySlots.filter(item => Number(item.startTime.split(':')[0]) < 18) }, { label: 'Evening Slots', icon: 'moon-outline' as const, values: daySlots.filter(item => Number(item.startTime.split(':')[0]) >= 18) }].filter(group => group.values.length).map(group => <View key={group.label} style={s.group}><View style={p.row}><View style={p.inline}><Icon name={group.icon} color={group.label.startsWith('Afternoon') ? '#947028' : colors.green} /><Text style={p.heading}>{group.label}</Text></View><Text style={p.text}>{time(group.values[0].startTime)} – {time(group.values[group.values.length - 1].endTime)}</Text></View>{group.values.map((item, index) => { const checked = selected === item.id; return <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked, disabled: !item.remaining }} disabled={busy || !item.remaining} onPress={() => setSelected(item.id)} style={[s.slot, checked && s.slotSelected, !item.remaining && { opacity: .55 }]}><View style={[s.clock, checked && { backgroundColor: '#DFF4E8' }]}><Icon name={checked ? 'checkmark-circle' : 'time-outline'} size={21} color={checked ? colors.green : colors.ink} /></View><View style={{ flex: 1 }}><Text style={[s.slotTitle, checked && { color: '#FFFFFF' }]}>{time(item.startTime)} – {time(item.endTime)}</Text><Text style={[p.text, checked && { color: '#D4E8DC' }]}>{index === 0 && group.label.startsWith('Afternoon') ? 'Express prep window' : 'Counter collection window'}</Text></View><Badge label={checked ? 'Selected' : !item.remaining ? 'Full' : item.remaining <= 2 ? `${item.remaining} slots left` : 'Available'} color={checked ? '#FFFFFF' : item.remaining <= 2 ? '#916018' : '#525E55'} background={checked ? '#29A565' : item.remaining <= 2 ? '#FFF0D4' : '#EEEFFC'} /></Pressable>; })}</View>)}
      {!busy && !slots.length && <ErrorNotice message="No future pickup slots available. Pull down to refresh." />}
      <View style={p.row}><Text style={p.name}>Pickup notes & vehicle info</Text><Text style={p.text}>Optional</Text></View>
      <View style={s.notes}><Icon name="car-outline" color="#677168" size={21} /><TextInput accessibilityLabel="Pickup notes and vehicle information" value={note} onChangeText={setNote} maxLength={300} multiline editable={!busy} style={s.input} placeholder="Curbside pickup – vehicle details or counter note" placeholderTextColor="#737A75" /></View><Text style={p.text}>Add a note to help the shop with your collection.</Text>
      {slot && <View style={s.confirmed}><View style={p.circle}><Icon name="checkmark-circle-outline" size={24} /></View><View style={{ flex: 1 }}><Text style={s.sectionLabel}>CONFIRMED SLOT</Text><Text style={s.confirmedTitle}>{dateLabel(slot.date)}, {time(slot.startTime)} – {time(slot.endTime)} • Counter Pickup</Text></View><Pressable accessibilityRole="button" style={p.linkTouch} disabled={busy} onPress={() => { setSelected(''); scroll.current?.scrollTo({ x: 0, animated: true }); }}><Text style={p.link}>Change</Text></Pressable></View>}
      <View style={s.payment}>{['cash', 'card', 'lankaqr'].map(method => <Pressable key={method} accessibilityRole="radio" accessibilityState={{ checked: payment === method }} disabled={busy} onPress={() => setPayment(method)} style={[s.paymentOption, payment === method && { backgroundColor: '#E4F0E9' }]}><Icon name={method === 'cash' ? 'cash-outline' : method === 'card' ? 'card-outline' : 'qr-code-outline'} size={16} /><Text style={s.paymentLabel}>{method.toUpperCase()}</Text></Pressable>)}</View>
      <PrimaryAction icon="bag-handle-outline" label={busy ? 'Please wait…' : 'Confirm Pickup Time & Place Order'} disabled={busy || !slot?.remaining || !basket.items.length || basket.items.some(item => item.needsReplacement)} onPress={() => void confirm()} />
      <View style={s.paymentNote}><Icon name="shield-checkmark" size={15} /><Text style={p.tiny}>Pay with Cash, Card, or LANKAQR upon collection</Text></View>
    </>}
    {busy && <ActivityIndicator color={colors.green} />}
  </PrototypePage>;
}
const s = StyleSheet.create({
  shop: { flexDirection: 'row', alignItems: 'center', gap: 12 }, shopName: { fontSize: 21, lineHeight: 27, fontWeight: '600', color: colors.ink }, shopPhoto: { width: 87, height: 87, borderRadius: 12 }, freshIcon: { backgroundColor: '#8AF5C2', width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }, sectionLabel: { fontSize: 11, fontWeight: '700', color: '#58645B', letterSpacing: .4 }, days: { padding: 5, gap: 6, backgroundColor: '#EEEFFC', borderRadius: 11 }, day: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, padding: 11, borderRadius: 9, minHeight: 44 }, daySelected: { backgroundColor: colors.green }, dayText: { fontSize: 12, fontWeight: '600', color: colors.ink }, group: { gap: 10 }, slot: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', padding: 13, borderRadius: 13, minHeight: 76 }, slotSelected: { backgroundColor: '#008439' }, clock: { width: 31, height: 31, borderRadius: 16, backgroundColor: '#EFEFFC', alignItems: 'center', justifyContent: 'center' }, slotTitle: { color: colors.ink, fontSize: 15, fontWeight: '700', marginBottom: 4 }, notes: { backgroundColor: '#ECEBFE', flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 12 }, input: { flex: 1, color: colors.ink, fontSize: 13, lineHeight: 20, minHeight: 42, padding: 0 }, confirmed: { backgroundColor: '#E5E4FC', borderRadius: 13, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 7 }, confirmedTitle: { color: colors.ink, fontSize: 15, fontWeight: '600', lineHeight: 21, marginTop: 4 }, payment: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, paymentOption: { flexDirection: 'row', gap: 5, padding: 9, borderRadius: 8, minHeight: 40, alignItems: 'center' }, paymentLabel: { fontSize: 10, fontWeight: '600', color: '#57655C' }, paymentNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
});
'''
for name, content in files.items():
    target = (root / name).resolve()
    assert target.is_relative_to(root)
    target.write_text(content, encoding='utf-8')
