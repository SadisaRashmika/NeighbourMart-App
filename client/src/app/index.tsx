import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [mobileNumber, setMobileNumber] = useState('77 123 4567');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Neighbour<Text style={styles.logoHighlight}>Mart</Text></Text>
            <Text style={styles.subLogoText}>USER PORTAL</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.langBadge}>
              <Text style={styles.langText}>EN</Text>
            </View>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="person-outline" size={20} color="#111" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Badge */}
        <View style={styles.freshBadge}>
          <Ionicons name="pricetag-outline" size={14} color="#00875a" />
          <Text style={styles.freshBadgeText}>Fresh & Local</Text>
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.title}>Welcome Neighbor!</Text>
        <Text style={styles.subtitle}>
          Fresh local harvest & doorstep pickup from verified neighborhood grocers.
        </Text>

        {/* Toggle Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Phone Input Box */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>MOBILE PHONE NUMBER</Text>
          <TouchableOpacity style={styles.emailToggleContainer}>
            <Text style={styles.emailToggleText}>Use email instead</Text>
          </TouchableOpacity>
          
          <View style={styles.phoneInputContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+94</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
            />
            <Ionicons name="checkmark-circle" size={22} color="#00875a" style={styles.checkIcon} />
          </View>
          <Text style={styles.helperText}>We'll send a 4-digit verification code via SMS.</Text>
        </View>

        {/* Options Row */}
        <View style={styles.optionsRow}>
          <View style={styles.checkboxRow}>
            <View style={styles.checkboxActive}>
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
            <Text style={styles.checkboxLabel}>Remember this phone</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Primary Log In Button */}
        <TouchableOpacity style={styles.loginButton} onPress={() => alert('OTP Sent via SMS!')}>
          <Text style={styles.loginButtonText}>Log In  →</Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          By continuing, you agree to our <Text style={styles.linkText}>Terms of Freshness</Text> & <Text style={styles.linkText}>Privacy Standards</Text>.
        </Text>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-google" size={18} color="#EA4335" />
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-apple" size={18} color="#000" />
            <Text style={styles.socialButtonText}>Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Community Banner */}
        <View style={styles.footerBanner}>
          <View style={styles.avatarCluster}>
            {/* Mock avatars representation */}
            <View style={[styles.avatar, { backgroundColor: '#00875a' }]} />
            <View style={[styles.avatar, { backgroundColor: '#ffab00', marginLeft: -8 }]} />
            <View style={[styles.avatar, { backgroundColor: '#de350b', marginLeft: -8 }]} />
          </View>
          <Text style={styles.footerBannerText}>Over <Text style={{fontWeight: 'bold', color: '#00875a'}}>12,000+</Text> local families shop nearby</Text>
        </View>

        {/* DEVELOPMENT / TESTING NAVIGATION BUTTONS */}
        <View style={styles.devContainer}>
          <Text style={styles.devTitle}>Development Navigation Helpers</Text>
          <Link href="/customer-dashboard" asChild>
            <TouchableOpacity style={styles.devButtonCustomer}>
              <Text style={styles.devButtonText}>Go to Customer Dashboard (104)</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/shop-dashboard" asChild>
            <TouchableOpacity style={styles.devButtonShop}>
              <Text style={styles.devButtonText}>Go to Shop Owner Dashboard (111)</Text>
            </TouchableOpacity>
          </Link>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backButton: { padding: 4 },
  logoContainer: { alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  logoHighlight: { color: '#00875a' },
  subLogoText: { fontSize: 9, color: '#666', letterSpacing: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  langBadge: { backgroundColor: '#00875a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  langText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  iconButton: { padding: 6, borderWidth: 1, borderColor: '#eee', borderRadius: 20 },
  freshBadge: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', backgroundColor: '#e3fcef', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginBottom: 12, gap: 6 },
  freshBadgeText: { color: '#006644', fontSize: 12, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 20 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#f4f5f7', borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#666' },
  activeTabText: { color: '#00875a' },
  inputWrapper: { marginBottom: 16 },
  inputLabel: { fontSize: 11, fontWeight: 'bold', color: '#333', marginBottom: 6, letterSpacing: 0.5 },
  emailToggleContainer: { position: 'absolute', right: 0, top: 0 },
  emailToggleText: { fontSize: 12, color: '#00875a', fontWeight: '600' },
  phoneInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#dfe1e6', borderRadius: 12, backgroundColor: '#fafbfc', paddingHorizontal: 12, height: 52 },
  countryCode: { borderRightWidth: 1, borderRightColor: '#dfe1e6', paddingRight: 12, marginRight: 12 },
  countryCodeText: { fontSize: 16, fontWeight: '600', color: '#333' },
  textInput: { flex: 1, fontSize: 16, color: '#111' },
  checkIcon: { marginLeft: 8 },
  helperText: { fontSize: 12, color: '#666', marginTop: 6 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkboxActive: { width: 18, height: 18, backgroundColor: '#00875a', borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  checkboxLabel: { fontSize: 13, color: '#333' },
  forgotText: { fontSize: 13, color: '#00875a', fontWeight: '600' },
  loginButton: { backgroundColor: '#00875a', paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#00875a', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4, marginBottom: 16 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  termsText: { fontSize: 12, color: '#666', textAlign: 'center', lineHeight: 18, marginBottom: 24 },
  linkText: { color: '#00875a', textDecorationLine: 'underline' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#ebecf0' },
  dividerText: { marginHorizontal: 12, fontSize: 11, color: '#8993a4', fontWeight: '600' },
  socialContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  socialButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#dfe1e6', paddingVertical: 12, borderRadius: 12, gap: 8, backgroundColor: '#fff' },
  socialButtonText: { fontSize: 14, fontWeight: '600', color: '#333' },
  footerBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e3fcef', padding: 12, borderRadius: 12, gap: 10, marginBottom: 30 },
  avatarCluster: { flexDirection: 'row' },
  avatar: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#fff' },
  footerBannerText: { fontSize: 12, color: '#006644', fontWeight: '500' },
  devContainer: { marginTop: 10, padding: 16, backgroundColor: '#f4f5f7', borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#b3bac5' },
  devTitle: { fontSize: 12, fontWeight: 'bold', color: '#42526e', marginBottom: 10, textAlign: 'center', textTransform: 'uppercase' },
  devButtonCustomer: { backgroundColor: '#0052cc', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  devButtonShop: { backgroundColor: '#ff5630', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  devButtonText: { color: '#fff', fontSize: 13, fontWeight: 'bold' }
});