import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { Button } from '@/components/common/Button';
import { createStockItem, updateStockItem } from '@/features/shop/shopApi';

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
    if (!category.trim()) problems.push('Enter a category, e.g. Dairy.');
    if (price.trim() === '' || Number.isNaN(Number(price)) || Number(price) < 0) problems.push('Price must be a number, 0 or more.');
    if (!/^\d+$/.test(stock.trim())) problems.push('Stock must be a whole number, 0 or more.');
    setErrors(problems);
    if (problems.length) return;
    const data = { name: name.trim(), category: category.trim(), price: Number(price), stock: Number(stock), available: true };
    try {
      setSaving(true);
      if (editing && p.id) await updateStockItem(p.id, data); else await createStockItem(data);
      router.back();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    } finally { setSaving(false); }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{editing ? 'Edit item' : 'Add new item'}</Text>
        <Text style={styles.label}>Product name</Text>
        <TextInput onChangeText={setName} placeholder="Highland Fresh Milk 1L" style={styles.input} value={name} />
        <Text style={styles.label}>Category</Text>
        <TextInput onChangeText={setCategory} placeholder="Dairy" style={styles.input} value={category} />
        <Text style={styles.label}>Price (LKR)</Text>
        <TextInput keyboardType="decimal-pad" onChangeText={setPrice} placeholder="480" style={styles.input} value={price} />
        <Text style={styles.label}>Units in stock</Text>
        <TextInput keyboardType="number-pad" onChangeText={setStock} style={styles.input} value={stock} />
        {errors.map((m) => <Text key={m} style={styles.error}>{m}</Text>)}
        <Button disabled={saving} label={saving ? 'Saving...' : editing ? 'Save changes' : 'Add item'} onPress={save} style={{ marginTop: 16 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  form: { padding: 18 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  label: { color: '#475467', fontSize: 13, marginTop: 10 },
  input: { backgroundColor: '#fff', borderColor: '#D1FADF', borderRadius: 12, borderWidth: 1, marginTop: 4, padding: 12 },
  error: { color: '#E11D48', marginTop: 6 },
});
