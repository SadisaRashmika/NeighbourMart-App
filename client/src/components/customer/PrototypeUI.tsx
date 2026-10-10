import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps, PropsWithChildren } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomerFooter } from "./CustomerFooter";
import { RoleHeader } from "../common/RoleHeader";
import type { Product } from "@/features/customer/customerTypes";

export const colors = {
  green: "#007332",
  purple: "#E8E7FE",
  background: "#F8F7FF",
  ink: "#202533",
  muted: "#737A75",
  orange: "#FFF0DA",
};
export type IconName = ComponentProps<typeof Ionicons>["name"];
export const cash = (amount: number) =>
  `LKR ${amount.toLocaleString("en-LK", { maximumFractionDigits: 2 })}`;
export function Icon({
  name,
  color = colors.green,
  size = 20,
}: {
  name: IconName;
  color?: string;
  size?: number;
}) {
  return <Ionicons name={name} color={color} size={size} />;
}
export const shopPhoto = require("../../../assets/images/checkout/shop.png");
const basketPhoto = require("../../../assets/images/checkout/basket.png");
export function productPhoto(product: Product) {
  if (product.imageUrl) return { uri: product.imageUrl };
  const name = product.name.toLowerCase();
  if (name.includes("red onion"))
    return require("../../../assets/images/checkout/red-onions.png");
  if (name.includes("onion"))
    return require("../../../assets/images/checkout/big-onions.png");
  if (name.includes("milk"))
    return require("../../../assets/images/checkout/milk.png");
  if (name.includes("dhal"))
    return require("../../../assets/images/checkout/dhal.png");
  return basketPhoto;
}
export function PrototypePage({
  children,
  pickup = false,
  footer = false,
  refreshing = false,
  onRefresh,
  address,
}: PropsWithChildren<{
  pickup?: boolean;
  footer?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  address?: string;
}>) {
  return (
    <SafeAreaView style={p.safe} edges={["top", "left", "right"]}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, backgroundColor: '#F8F7FF', borderBottomWidth: 1, borderBottomColor: '#F0EFF7' }}>
        <RoleHeader role="customer" location={address || "Your neighbourhood shop"} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={p.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.green}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
      {footer && <CustomerFooter />}
    </SafeAreaView>
  );
}
export function PrimaryAction({
  label,
  icon,
  onPress,
  disabled = false,
  secondary = false,
}: {
  label: string;
  icon?: IconName;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        p.primary,
        secondary && p.secondary,
        disabled && { opacity: 0.55 },
      ]}
    >
      {icon && (
        <Icon name={icon} color={secondary ? "#C62828" : "#FFFFFF"} size={21} />
      )}
      <Text style={[p.primaryText, secondary && { color: "#C62828" }]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function ErrorNotice({ message }: { message: string }) {
  return message ? (
    <Text accessibilityRole="alert" style={p.error}>
      {message}
    </Text>
  ) : null;
}
export function Badge({
  label,
  color = colors.green,
  background = "#E4F0E9",
}: {
  label: string;
  color?: string;
  background?: string;
}) {
  return (
    <Text style={[p.badge, { color, backgroundColor: background }]}>
      {label}
    </Text>
  );
}
export const p = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 16,
    minHeight: 58,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EFF7",
  },
  logo: { width: 27, height: 29, resizeMode: "contain" },
  headerLocation: { flex: 1 },
  location: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  headerSubtitle: { fontSize: 11, color: "#596359", marginTop: 2 },
  passTitle: { flex: 1, fontSize: 17, fontWeight: "600", color: colors.ink },
  headerAction: {
    minWidth: 32,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  profile: {
    backgroundColor: colors.green,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 16, gap: 14, paddingBottom: 22 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 13, padding: 14, gap: 10 },
  inline: { flexDirection: "row", alignItems: "center", gap: 5 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink, lineHeight: 29 },
  heading: { fontSize: 16, fontWeight: "700", color: colors.ink },
  name: { fontSize: 14, fontWeight: "700", color: colors.ink },
  text: { fontSize: 12, color: "#646D65", lineHeight: 17 },
  tiny: { fontSize: 10, color: colors.muted, lineHeight: 14 },
  price: { fontSize: 17, fontWeight: "700", color: colors.green },
  badge: {
    borderRadius: 10,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 10,
    fontWeight: "700",
  },
  primary: {
    backgroundColor: colors.green,
    minHeight: 49,
    borderRadius: 11,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  secondary: { backgroundColor: "#E6E5FC" },
  error: {
    padding: 12,
    borderRadius: 10,
    color: "#A32923",
    backgroundColor: "#FFE9E5",
    fontSize: 12,
  },
  info: {
    backgroundColor: "#EEEDFF",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E4F0E9",
    alignItems: "center",
    justifyContent: "center",
  },
  link: { fontSize: 12, color: colors.green, fontWeight: "600" },
  linkTouch: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
  },
});
