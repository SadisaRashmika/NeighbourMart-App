import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ActionButton, Thumb } from '@/components/shop/ShopUI';
import { T, emojiFor, money, shadow } from '@/components/shop/shopTheme';
import { createStockItem, updateStockItem } from '@/features/shop/shopApi';

const CATEGORIES = ['Dairy', 'Fresh Produce', 'Pulses', 'Grains', 'Biscuits', 'Snacks', 'Beverages'];

export default function ProductForm() {
  const p = useLocalSearchParams<{ id?: string; name?: string; category?: string; price?: string; stock?: string }>();
  const editing = Boolean(p.id);
  const [name, setName] = useState(p.name ?? '');
  const [category, setCategory] = useState(p.category ?? '');
  const [price, setPrice] = useState(p.price ?? '');
  const [stock, setStock] = useState(p.stock ?? '0');
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function save() {
    const problems: string[] = [];
    if (!name.trim()) problems.push('Enter the product name.');
    if (!category.trim()) problems.push('Choose or type a category.');
    if (price.trim() === '' || Number.isNaN(Number(price)) || Number(price) < 0) problems.push('Price must be a number, 0 or more.');
    if (!/^\d+$/.test(stock.trim())) problems.push('Stock must be a whole number, 0 or more.');
    setErrors(problems);
    if (problems.length) return;
    const data = { name: name.trim(), category: category.trim(), price: Number(price), stock: Number(stock), available: true };
    try {
      setSaving(true);
      if (editing && p.id) await updateStockItem(p.id, data); else await createStockItem(data);
      router.back();
    } catch (e) { Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.'); }
    finally { setSaving(false); }
  }

  const field = (label: string, icon: keyof typeof Ionicons.glyphMap, props: React.ComponentProps<typeof TextInput>) => (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons color={T.mute} name={icon} size={18} />
        <TextInput placeholderTextColor={T.mute} {...props} style={styles.input} />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ backgroundColor: T.bg, flex: 1 }}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <View style={[styles.preview, shadow]}>
          <Thumb emoji={emojiFor(category, name)} size={64} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cat}>{(category || 'CATEGORY').toUpperCase()}</Text>
            <Text numberOfLines={1} style={styles.pName}>{name || 'Product name'}</Text>
            <Text style={styles.pPrice}>{price ? money(Number(price) || 0) : 'LKR 0'} - {stock || 0} in stock</Text>
          </View>
        </View>

        {field('Product name', 'pricetag-outline', { onChangeText: setName, placeholder: 'Highland Fresh Milk 1L', value: name })}
        <View style={{ gap: 6 }}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipOn]}>
                <Text style={[styles.chipText, category === c && { color: '#fff' }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {field('', 'list-outline', { onChangeText: setCategory, placeholder: 'Or type a category', value: category })}
        </View>
        {field('Price (LKR)', 'cash-outline', { keyboardType: 'decimal-pad', onChangeText: setPrice, placeholder: '480', value: price })}
        {field('Units in stock', 'cube-outline', { keyboardType: 'number-pad', onChangeText: setStock, value: stock })}

        {errors.map((m) => <Text key={m} style={styles.error}>{m}</Text>)}
        <ActionButton disabled={saving} icon="checkmark-circle-outline" label={saving ? 'Saving...' : editing ? 'Save changes' : 'Add item'} onPress={save} style={styles.save} />
        <ActionButton label="Cancel" onPress={() => router.back()} tone="soft" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  form: { gap: 14, padding: 16, paddingBottom: 40 },
  preview: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, flexDirection: 'row', gap: 14, padding: 14 },
  cat: { color: T.mute, fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  pName: { color: T.ink, fontSize: 17, fontWeight: '800' },
  pPrice: { color: T.slate, fontSize: 13 },
  label: { color: T.slate, fontSize: 13, fontWeight: '700' },
  inputWrap: { alignItems: 'center', backgroundColor: '#fff', borderColor: T.line, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 8, paddingHorizontal: 12 },
  input: { color: T.ink, flex: 1, paddingVertical: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: T.lav, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 8 },
  chipOn: { backgroundColor: T.green },
  chipText: { color: T.ink, fontSize: 12, fontWeight: '800' },
  error: { color: T.red },
  save: { backgroundColor: T.green, borderColor: T.green, minHeight: 54 },
});
