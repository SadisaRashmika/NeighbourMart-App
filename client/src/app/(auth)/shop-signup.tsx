import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Input } from '@/components/common/Input';
import { registerShopOwner } from '@/features/auth/authApi';

const CATEGORIES = ['Grocery & Mart', 'Fresh Fruits & Vegetables', 'Bakery', 'Meat & Seafood', 'Dairy & Beverages', 'Other'];

export default function ShopSignup() {
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    address: false,
    category: false,
    email: false,
    mobile: false,
    ownerName: false,
    storeName: false,
    terms: false,
  });
  const normalizedMobile = mobile.replace(/[\s-]/g, '');
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const mobileValid = /^(?:\+94|0)7\d{8}$/.test(normalizedMobile);
  const storeNameError = touched.storeName && storeName.trim().length < 2 ? 'Store name must contain at least 2 characters.' : '';
  const categoryError = touched.category && !category ? 'Select a business category.' : '';
  const addressError = touched.address && address.trim().length < 5 ? 'Enter a complete store address.' : '';
  const ownerNameError = touched.ownerName && ownerName.trim().length < 2 ? 'Owner name must contain at least 2 characters.' : '';
  const emailError = touched.email && !email.trim() ? 'Email address is required.' : touched.email && !emailValid ? 'Enter a valid email address.' : '';
  const mobileError = touched.mobile && !mobile.trim() ? 'Mobile number is required.' : touched.mobile && !mobileValid ? 'Enter a valid Sri Lankan mobile number.' : '';
  const termsError = touched.terms && !termsAccepted ? 'Accept the terms to create a shop account.' : '';
  const isFormComplete = Boolean(
    storeName.trim().length >= 2 &&
    category &&
    address.trim().length >= 5 &&
    ownerName.trim().length >= 2 &&
    emailValid &&
    mobileValid &&
    termsAccepted,
  );

  async function startRegistration() {
    setError('');
    setTouched({ address: true, category: true, email: true, mobile: true, ownerName: true, storeName: true, terms: true });
    if (!isFormComplete) {
      setError('Correct the highlighted fields before continuing.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerShopOwner({
        address: address.trim(), category, email: email.trim().toLowerCase(), mobile: normalizedMobile,
        ownerName: ownerName.trim(), storeName: storeName.trim(),
      });
      router.push({
        pathname: '/(auth)/verify-email',
        params: { accountType: 'shop', email: result.email, developmentCode: result.developmentCode ?? '' },
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create the shop account.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreen header={<View style={styles.navigationBar}><Text style={styles.brand}>Neighbour<Text style={styles.brandAccent}>Mart</Text></Text><Text style={styles.portalTag}>SHOP OWNER PORTAL</Text></View>}>
      <View style={styles.container}>
        <View style={styles.heroSection}>
          <View style={styles.heroRow}><Text style={styles.title}>Register Your Store</Text><View style={styles.badge}><Ionicons color="#B45309" name="storefront" size={15} /><Text style={styles.badgeText}>Partner with us</Text></View></View>
          <Text style={styles.subtitle}>Join NeighbourMart and reach more local customers in your community.</Text>
        </View>
        <View style={styles.form}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>1. STORE DETAILS</Text>
            <Input autoCapitalize="words" error={storeNameError} label="STORE / SHOP NAME" onBlur={() => setTouched((current) => ({ ...current, storeName: true }))} onChangeText={setStoreName} placeholder="Your store or shop name" style={styles.input} value={storeName} />
            <View style={styles.categoryField}>
              <Text style={styles.label}>BUSINESS CATEGORY</Text>
              <TouchableOpacity accessibilityRole="button" onPress={() => { setTouched((current) => ({ ...current, category: true })); setCategoryOpen((open) => !open); }} style={[styles.categoryButton, categoryError ? styles.invalidField : undefined]}>
                <Ionicons color="#94A3B8" name="list-outline" size={16} /><Text style={[styles.categoryValue, !category && styles.placeholder]}>{category || 'Select a category'}</Text><Ionicons color="#64748B" name={categoryOpen ? 'chevron-up' : 'chevron-down'} size={16} />
              </TouchableOpacity>
              {categoryOpen ? <View style={styles.dropdown}>{CATEGORIES.map((item) => <TouchableOpacity key={item} onPress={() => { setCategory(item); setCategoryOpen(false); }} style={styles.dropdownItem}><Text style={styles.dropdownText}>{item}</Text></TouchableOpacity>)}</View> : null}
              {categoryError ? <Text style={styles.fieldError}>{categoryError}</Text> : null}
            </View>
            <Input autoCapitalize="words" error={addressError} label="STORE ADDRESS" onBlur={() => setTouched((current) => ({ ...current, address: true }))} onChangeText={setAddress} placeholder="e.g. Peradeniya Rd, Kandy" style={styles.input} value={address} />
          </View>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>2. OWNER & CONTACT DETAILS</Text>
            <Input autoCapitalize="words" error={ownerNameError} label="OWNER NAME" onBlur={() => setTouched((current) => ({ ...current, ownerName: true }))} onChangeText={setOwnerName} placeholder="Your full name" style={styles.input} value={ownerName} />
            <Input autoCapitalize="none" autoComplete="email" error={emailError} keyboardType="email-address" label="EMAIL ADDRESS" onBlur={() => setTouched((current) => ({ ...current, email: true }))} onChangeText={setEmail} placeholder="you@example.com" style={styles.input} value={email} />
            <Input autoComplete="tel" error={mobileError} keyboardType="phone-pad" label="MOBILE NUMBER" onBlur={() => setTouched((current) => ({ ...current, mobile: true }))} onChangeText={setMobile} placeholder="+94 77 123 4567" style={styles.input} value={mobile} />
          </View>
          <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: termsAccepted }} onPress={() => { setTouched((current) => ({ ...current, terms: true })); setTermsAccepted((accepted) => !accepted); }} style={styles.termsRow}>
            <View style={[styles.checkbox, termsAccepted && styles.checked]}>{termsAccepted ? <Ionicons color="#FFFFFF" name="checkmark" size={14} /> : null}</View>
            <Text style={styles.terms}>I agree to the <Text style={styles.termsLink}>Terms of Freshness</Text> and <Text style={styles.termsLink}>Privacy Standards</Text>.</Text>
          </TouchableOpacity>
          {termsError ? <Text style={styles.fieldError}>{termsError}</Text> : null}
          {error ? <ErrorMessage message={error} /> : null}
          <Button disabled={isLoading || !isFormComplete} label={isLoading ? 'Sending code...' : 'Create Shop Account  →'} onPress={startRegistration} style={styles.createButton} />
          <View style={styles.loginPrompt}><Text style={styles.loginPromptText}>Already have a shop owner account?</Text><TouchableOpacity onPress={() => router.replace('/(auth)/login')}><Text style={styles.loginLink}>Log in</Text></TouchableOpacity></View>
          <TouchableOpacity onPress={() => router.replace('/(auth)/customer-signup')}><Text style={styles.customerLink}>Create a customer account instead</Text></TouchableOpacity>
        </View>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  navigationBar: { alignItems: 'center', backgroundColor: '#fff', borderBottomColor: '#F8FAFC', borderBottomWidth: 1, height: 71, justifyContent: 'center', paddingBottom: 12, paddingHorizontal: 20, paddingTop: 20 },
  brand: { color: '#101828', fontSize: 16, fontWeight: '800', letterSpacing: -0.4, lineHeight: 21 },
  brandAccent: { color: '#138A43' },
  portalTag: { color: '#94A3B8', fontSize: 9, fontWeight: '700', letterSpacing: 0.6, lineHeight: 15 },
  container: { alignSelf: 'center', backgroundColor: '#F8FAFC', gap: 20, maxWidth: 390, paddingBottom: 40, paddingHorizontal: 24, paddingTop: 20, width: '100%' },
  heroSection: { gap: 7 },
  heroRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  title: { color: '#0F172A', flex: 1, fontSize: 22, fontWeight: '800', letterSpacing: -0.6, lineHeight: 30 },
  subtitle: { color: '#64748B', fontSize: 14, lineHeight: 22 },
  badge: { alignItems: 'center', backgroundColor: '#FEF3C7', borderRadius: 18, flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { color: '#92400E', fontSize: 12, fontWeight: '600' },
  form: { gap: 16 },
  sectionCard: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 16, borderWidth: 1, gap: 16, padding: 16 },
  sectionTitle: { alignSelf: 'flex-start', backgroundColor: '#ECFDF5', borderRadius: 6, color: '#334155', fontSize: 12, fontWeight: '700', letterSpacing: 0.4, paddingHorizontal: 8, paddingVertical: 5 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 14, minHeight: 48 },
  categoryField: { gap: 6 },
  label: { color: '#172B24', fontSize: 13, fontWeight: '700' },
  categoryButton: { alignItems: 'center', backgroundColor: '#F8FAFC', borderColor: '#D8DEE8', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 8, height: 48, paddingHorizontal: 14 },
  categoryValue: { color: '#1E293B', flex: 1, fontSize: 14 },
  placeholder: { color: '#6B7280' },
  invalidField: { borderColor: '#C62828' },
  fieldError: { color: '#C62828', fontSize: 12 },
  dropdown: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  dropdownItem: { borderBottomColor: '#F1F5F9', borderBottomWidth: 1, paddingHorizontal: 12, paddingVertical: 11 },
  dropdownText: { color: '#334155', fontSize: 13 },
  termsRow: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  checkbox: { alignItems: 'center', borderColor: '#CBD5E1', borderRadius: 4, borderWidth: 1, height: 18, justifyContent: 'center', width: 18 },
  checked: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  terms: { color: '#475569', flex: 1, fontSize: 12, lineHeight: 17 },
  termsLink: { color: '#64748B', textDecorationLine: 'underline' },
  createButton: { borderRadius: 16, height: 52 },
  loginPrompt: { alignItems: 'center', flexDirection: 'row', gap: 4, justifyContent: 'center' },
  loginPromptText: { color: '#64748B', fontSize: 12 },
  loginLink: { color: '#15803D', fontSize: 12, fontWeight: '700' },
  customerLink: { color: '#138A43', fontSize: 12, fontWeight: '600', textAlign: 'center' },
});
