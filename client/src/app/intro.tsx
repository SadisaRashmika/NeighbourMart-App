import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const slides = [
  {
    eyebrow: 'SMART SHOPPING',
    title: 'Everything you need, ready for pickup',
    description: 'Build your basket, approve substitutions, and collect your order with a simple digital pickup pass.',
    kind: 'basket',
  },
  {
    eyebrow: 'PICKUP · STEP 2 OF 3',
    title: 'Ready when you arrive, no queues',
    description: 'Choose a pickup time and your local shop will have everything packed before you arrive.',
    kind: 'pickup',
  },
  {
    eyebrow: 'FRESH LOCAL GROCERIES',
    title: 'Fresh daily harvest, zero middlemen',
    description: 'Browse trusted neighborhood grocers with verified prices and direct local availability.',
    kind: 'harvest',
  },
] as const;

function SlideArtwork({ kind }: { kind: (typeof slides)[number]['kind'] }) {
  if (kind === 'basket') {
    return <Image resizeMode="cover" source={require('../../assets/images/img1.jpg')} style={styles.slideImage} />;
  }

  if (kind === 'pickup') {
    return <Image resizeMode="cover" source={require('../../assets/images/img2.jpg')} style={styles.slideImage} />;
  }

  return <Image resizeMode="cover" source={require('../../assets/images/img3.jpg')} style={styles.slideImage} />;
}

export default function Intro() {
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = slides[slideIndex];
  const isLastSlide = slideIndex === slides.length - 1;

  function advance() {
    if (isLastSlide) {
      router.back();
      return;
    }
    setSlideIndex((currentIndex) => currentIndex + 1);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}><View style={styles.brandRow}><View style={styles.brandMark}><Image source={require('../../assets/images/brand-logo.png.jpg')} style={styles.brandImage} /></View><Text style={styles.brand}>Neighbour<Text style={styles.brandAccent}>Mart</Text></Text></View><TouchableOpacity accessibilityLabel="Close introduction" onPress={() => router.back()}><Ionicons color="#667085" name="close" size={23} /></TouchableOpacity></View>
      <View style={styles.content}><View style={styles.artworkFrame}><SlideArtwork kind={slide.kind} /></View><Text style={styles.eyebrow}>{slide.eyebrow}</Text><Text style={styles.title}>{slide.title}</Text><Text style={styles.description}>{slide.description}</Text><View style={styles.dots}>{slides.map((item, index) => <View key={item.kind} style={[styles.dot, index === slideIndex && styles.activeDot]} />)}</View><TouchableOpacity onPress={advance} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{isLastSlide ? 'Done' : slideIndex === 0 ? 'Get Started' : 'Continue'}</Text><Ionicons color="#fff" name={isLastSlide ? 'checkmark' : 'arrow-forward'} size={17} /></TouchableOpacity>{!isLastSlide ? <TouchableOpacity onPress={() => router.back()} style={styles.skipButton}><Text style={styles.skipText}>Back to Settings</Text></TouchableOpacity> : null}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F8F7FF', flex: 1 },
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  brandRow: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  brandMark: { backgroundColor: '#fff', borderRadius: 7, height: 29, overflow: 'hidden', width: 29 },
  brandImage: { height: 29, width: 29 },
  brand: { color: '#172B24', fontSize: 16, fontWeight: '800' },
  brandAccent: { color: '#138A43' },
  content: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  artworkFrame: { alignItems: 'center', aspectRatio: 1, backgroundColor: '#fff', borderRadius: 17, justifyContent: 'center', marginBottom: 28, maxWidth: 300, overflow: 'hidden', width: '100%' },
  slideImage: { height: '100%', width: '100%' },
  logoArtwork: { alignItems: 'center', backgroundColor: '#FCFBFF', borderRadius: 14, justifyContent: 'center', padding: 24, width: '88%' },
  logoImage: { height: 145, resizeMode: 'contain', width: '100%' },
  artworkBadge: { alignItems: 'center', backgroundColor: '#EAF7F0', borderRadius: 16, flexDirection: 'row', gap: 6, marginTop: 15, paddingHorizontal: 12, paddingVertical: 7 },
  artworkBadgeText: { color: '#17603A', fontSize: 11, fontWeight: '700' },
  pickupArtwork: { alignItems: 'center', backgroundColor: '#F0F6FF', borderRadius: 15, padding: 20, width: '88%' },
  storeIcon: { alignItems: 'center', backgroundColor: '#138A43', borderRadius: 40, height: 80, justifyContent: 'center', width: 80 },
  pickupShelf: { flexDirection: 'row', gap: 9, marginTop: 18 },
  shelfItem: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, gap: 5, padding: 10, width: 105 },
  shelfText: { color: '#344054', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  readyPill: { alignItems: 'center', backgroundColor: '#D4F1DE', borderRadius: 14, flexDirection: 'row', gap: 5, marginTop: 15, paddingHorizontal: 11, paddingVertical: 6 },
  readyPillText: { color: '#17603A', fontSize: 10, fontWeight: '700' },
  harvestArtwork: { alignItems: 'center', backgroundColor: '#F2F8EF', borderRadius: 15, justifyContent: 'center', padding: 26, width: '88%' },
  harvestBasket: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#CBEBD5', borderRadius: 70, borderWidth: 2, flexDirection: 'row', height: 140, justifyContent: 'center', transform: [{ rotate: '-8deg' }], width: 190 },
  freshPill: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, flexDirection: 'row', gap: 5, marginTop: 20, paddingHorizontal: 11, paddingVertical: 6 },
  freshPillText: { color: '#17603A', fontSize: 10, fontWeight: '700' },
  eyebrow: { color: '#138A43', fontSize: 10, fontWeight: '800', letterSpacing: 1, textAlign: 'center' },
  title: { color: '#172B24', fontSize: 24, fontWeight: '800', lineHeight: 30, marginTop: 9, textAlign: 'center' },
  description: { color: '#667085', fontSize: 13, lineHeight: 19, marginTop: 10, maxWidth: 330, textAlign: 'center' },
  dots: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 22 },
  dot: { backgroundColor: '#C9D8CE', borderRadius: 5, height: 7, width: 7 },
  activeDot: { backgroundColor: '#138A43', width: 22 },
  primaryButton: { alignItems: 'center', backgroundColor: '#00843D', borderRadius: 10, flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 22, minHeight: 50, width: '100%' },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  skipButton: { padding: 12 },
  skipText: { color: '#138A43', fontSize: 12, fontWeight: '700' },
});
