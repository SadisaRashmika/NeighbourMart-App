import { useEffect, useState } from 'react';
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
