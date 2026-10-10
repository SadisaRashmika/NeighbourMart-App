import { useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Badge,
  cash,
  colors,
  ErrorNotice,
  Icon,
  p,
  PrimaryAction,
  productPhoto,
  PrototypePage,
} from "@/components/customer/PrototypeUI";
import { useCart } from "@/features/customer/useCart";

export default function Cart() {
  const {
    basket,
    items,
    busy,
    error,
    refresh,
    changeQuantity,
    remove,
    clearCart,
  } = useCart();
  useFocusEffect(
    useCallback(() => {
      void refresh().catch(() => undefined);
    }, [refresh]),
  );
  const attempt = (work: Promise<void>) => void work.catch(() => undefined);
  const units = items.reduce((sum, item) => sum + item.quantity, 0);
  const pending = items.filter((item) => item.needsReplacement);
  const choose = (id: string) =>
    router.push({
      pathname: "/customer/substitution",
      params: { productId: id },
    });
  return (
    <PrototypePage
      address={basket.shop?.address}
      refreshing={busy}
      onRefresh={() => attempt(refresh())}
    >
      <ErrorNotice message={error} />
      {basket.shop && (
        <>
          <View style={[p.card, s.shop]}>
            <View style={s.shopIcon}>
              <Icon name="storefront-outline" size={28} />
            </View>
            <View style={s.grow}>
              <View style={p.row}>
                <Text style={p.heading}>
                  {basket.shop.name.replace(" (Demo)", "")}
                </Text>
                <Icon name="checkmark-circle" size={18} />
              </View>
              <View style={s.pill}>
                <Text style={s.counter}>Counter pickup</Text>
              </View>
              <View style={p.inline}>
                <Icon name="time-outline" size={14} color="#8A6524" />
                <Text style={s.pickup}>
                  Choose your pickup time at checkout
                </Text>
              </View>
            </View>
          </View>
          <View style={p.row}>
            <View style={p.inline}>
              <Icon name="bag-handle-outline" size={15} />
              <Text style={s.meta}>Self-Pickup at Counter</Text>
            </View>
            <Text style={s.metaMuted}>Cash / LANKAQR</Text>
          </View>
        </>
      )}
      {!!pending.length && (
        <View style={s.inventory}>
          <View style={s.inventoryIcon}>
            <Icon name="archive-outline" size={20} color="#865C13" />
          </View>
          <View style={s.grow}>
            <Text style={s.inventoryTitle}>INVENTORY UPDATE ●</Text>
            <Text style={s.inventoryText}>
              Notice: {pending[0].product.name} is unavailable. Please review a
              substitute.
            </Text>
          </View>
        </View>
      )}
      <View style={p.row}>
        <View style={[p.inline, { flex: 1, flexWrap: "wrap" }]}>
          <Text style={p.heading}>Your Basket Items</Text>
          <Badge label={`${items.length} items (${units} units)`} />
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={busy || !items.length}
          style={p.linkTouch}
          onPress={() =>
            Alert.alert("Clear basket?", "Remove all groceries?", [
              { text: "Keep items", style: "cancel" },
              {
                text: "Clear",
                style: "destructive",
                onPress: () => attempt(clearCart()),
              },
            ])
          }
        >
          <View style={p.inline}>
            <Icon name="trash-outline" size={15} />
            <Text style={p.link}>Clear</Text>
          </View>
        </Pressable>
      </View>
      {!items.length && (
        <View style={p.card}>
          <Text style={p.heading}>Your basket is empty</Text>
          <Text style={p.text}>
            Add groceries from your local shop to get started.
          </Text>
          <PrimaryAction
            label="Browse groceries"
            icon="cart-outline"
            onPress={() => router.navigate("/customer/dashboard")}
          />
        </View>
      )}
      {items.map((item) => (
        <View style={p.card} key={item.product.id}>
          <View style={s.productRow}>
            <View style={s.photoWrap}>
              <Image source={productPhoto(item.product)} style={s.photo} />
              {item.needsReplacement && (
                <Text style={s.lowStock}>LOW STOCK</Text>
              )}
            </View>
            <View style={s.grow}>
              <View style={p.row}>
                <Text style={[p.name, s.grow]}>{item.product.name}</Text>
                <Pressable
                  accessibilityLabel={`Remove ${item.product.name}`}
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => attempt(remove(item.product.id))}
                  style={s.close}
                >
                  <Icon name="close" size={19} color="#8A948B" />
                </Pressable>
              </View>
              <Text style={p.tiny}>Per unit: {cash(item.product.price)}</Text>
              <View style={[p.row, { marginTop: 12 }]}>
                <View style={s.stepper}>
                  <Pressable
                    accessibilityLabel={`Decrease ${item.product.name} quantity`}
                    accessibilityRole="button"
                    disabled={busy || item.quantity <= 1}
                    style={s.step}
                    onPress={() =>
                      attempt(
                        changeQuantity(item.product.id, item.quantity - 1),
                      )
                    }
                  >
                    <Icon
                      name="remove"
                      size={17}
                      color={item.quantity <= 1 ? "#ABB0AB" : colors.ink}
                    />
                  </Pressable>
                  <Text style={s.quantity}>{item.quantity}</Text>
                  <Pressable
                    accessibilityLabel={`Increase ${item.product.name} quantity`}
                    accessibilityRole="button"
                    disabled={
                      busy ||
                      item.quantity >= Math.min(99, item.product.stock ?? 99)
                    }
                    style={s.step}
                    onPress={() =>
                      attempt(
                        changeQuantity(item.product.id, item.quantity + 1),
                      )
                    }
                  >
                    <Icon name="add" size={17} color={colors.ink} />
                  </Pressable>
                </View>
                <Text style={p.price}>
                  {cash(item.quantity * item.product.price)}
                </Text>
              </View>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit substitution for ${item.product.name}`}
            disabled={busy}
            onPress={() => choose(item.product.id)}
            style={[s.substitution, item.needsReplacement && s.pending]}
          >
            <Icon
              name={
                item.needsReplacement
                  ? "notifications-outline"
                  : "sync-circle-outline"
              }
              size={17}
              color={item.needsReplacement ? "#8A6524" : colors.green}
            />
            <View style={s.grow}>
              <Text style={s.subTitle}>
                Substitute:{" "}
                {item.needsReplacement
                  ? "Allowed with approval"
                  : "Choose an alternative"}
              </Text>
              <Text
                style={[
                  p.tiny,
                  { color: item.needsReplacement ? "#8A6524" : colors.green },
                ]}
              >
                {item.needsReplacement
                  ? "Review available replacements before checkout."
                  : "You approve every change before ordering."}
              </Text>
            </View>
            <Text
              style={[p.link, item.needsReplacement && { color: "#8A6524" }]}
            >
              {item.needsReplacement ? "Modify" : "Edit"}
            </Text>
          </Pressable>
        </View>
      ))}
      {!!items.length && (
        <>
          <View style={p.info}>
            <View style={[p.circle, { backgroundColor: colors.green }]}>
              <Icon name="bag-handle-outline" color="#FFFFFF" />
            </View>
            <View style={s.grow}>
              <Text style={p.name}>Pack Fresh on Arrival</Text>
              <Text style={p.text}>
                Collect fresh groceries at your selected pickup time.
              </Text>
            </View>
          </View>
          <View style={p.card}>
            <View style={p.row}>
              <Text style={p.heading}>Payment &amp; Order Summary</Text>
              <Icon name="receipt-outline" />
            </View>
            <View style={p.row}>
              <Text style={p.text}>Items Subtotal ({units} items)</Text>
              <Text style={s.amount}>
                {cash(
                  basket.subtotal ??
                    items.reduce(
                      (sum, i) => sum + i.quantity * i.product.price,
                      0,
                    ),
                )}
              </Text>
            </View>
            <View style={p.row}>
              <Text style={p.text}>Shop Packing Fee ⓘ</Text>
              <Text style={s.amount}>{cash(basket.packingFee ?? 0)}</Text>
            </View>
            <View style={p.row}>
              <Text style={[p.text, { color: colors.green }]}>
                Store Discount (Community Perk)
              </Text>
              <Text style={[s.amount, { color: colors.green }]}>
                −{cash(basket.communityDiscount ?? 0)}
              </Text>
            </View>
            {!!pending.length && (
              <View style={s.summaryPending}>
                <Text style={p.tiny}>Substitutions Pending:</Text>
                <Text style={s.pendingAmount}>
                  {pending.length} item may adjust
                </Text>
              </View>
            )}
            <View style={s.total}>
              <View>
                <Text style={p.heading}>Estimated Total</Text>
                <Text style={p.tiny}>Pay at store counter</Text>
              </View>
              <Text style={s.totalPrice}>{cash(basket.total)}</Text>
            </View>
            <View style={s.settlement}>
              <Icon name="qr-code-outline" size={17} />
              <Text style={s.settlementText}>Counter Settlement:</Text>
              <Icon name="cash-outline" size={15} />
              <Text style={p.tiny}>Cash</Text>
              <Text style={p.tiny}>|</Text>
              <Icon name="qr-code-outline" size={14} />
              <Text style={p.tiny}>LANKAQR</Text>
            </View>
          </View>
          <PrimaryAction
            label="Proceed to Select Pickup Time →"
            disabled={busy || !!pending.length}
            onPress={() => router.push("/customer/pickup-time")}
          />
          {!!pending.length && (
            <Text style={s.hint}>
              Approve or remove unavailable items to continue.
            </Text>
          )}
          <Pressable
            accessibilityRole="button"
            style={s.addMore}
            onPress={() => router.navigate("/customer/dashboard")}
          >
            <Icon name="cart-outline" size={19} />
            <Text style={p.name}>Add More Items</Text>
          </Pressable>
        </>
      )}
      {busy && <ActivityIndicator color={colors.green} />}
    </PrototypePage>
  );
}
const s = StyleSheet.create({
  grow: { flex: 1 },
  shop: { flexDirection: "row", alignItems: "center", gap: 13 },
  shopIcon: {
    width: 74,
    height: 80,
    backgroundColor: "#E6F1E9",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: "#EDEBFF",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 5,
  },
  counter: { color: colors.green, fontSize: 11, fontWeight: "600" },
  pickup: { color: "#8A6524", fontSize: 11, fontWeight: "600", flex: 1 },
  meta: { fontSize: 10, color: colors.ink },
  metaMuted: { fontSize: 10, color: colors.muted },
  inventory: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFEBD8",
    padding: 12,
    borderRadius: 13,
  },
  inventoryIcon: {
    backgroundColor: "#FFBD39",
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  inventoryTitle: {
    fontSize: 10,
    color: "#775216",
    fontWeight: "800",
    marginBottom: 3,
  },
  inventoryText: { fontSize: 11, color: "#78572A", lineHeight: 15 },
  productRow: { flexDirection: "row", gap: 13, alignItems: "center" },
  photoWrap: {
    width: 65,
    height: 76,
    justifyContent: "center",
    alignItems: "center",
  },
  photo: { width: 61, height: 72, resizeMode: "contain" },
  lowStock: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "#FFB733",
    color: "#784600",
    fontSize: 8,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderRadius: 3,
    fontWeight: "700",
  },
  close: {
    minWidth: 28,
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 3,
    borderRadius: 24,
    backgroundColor: "#F2F0FA",
  },
  step: {
    width: 31,
    height: 31,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quantity: {
    minWidth: 17,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 12,
    color: colors.ink,
  },
  substitution: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    backgroundColor: "#F1EFFA",
    padding: 9,
    borderRadius: 8,
    minHeight: 47,
  },
  pending: { backgroundColor: "#FFF7E9" },
  subTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.ink,
    marginBottom: 3,
  },
  amount: { fontSize: 12, fontWeight: "600", color: colors.ink },
  summaryPending: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F4F1FB",
    borderRadius: 8,
    padding: 8,
  },
  pendingAmount: { fontSize: 10, color: "#8A6524", fontWeight: "700" },
  total: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#EEEFF2",
    paddingTop: 12,
  },
  totalPrice: { fontSize: 24, fontWeight: "700", color: colors.green },
  settlement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F3F1FA",
    borderRadius: 7,
    padding: 8,
  },
  settlementText: { fontSize: 10, fontWeight: "600", color: colors.ink },
  addMore: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    minHeight: 48,
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: { color: "#8A6524", fontSize: 11, textAlign: "center" },
});
