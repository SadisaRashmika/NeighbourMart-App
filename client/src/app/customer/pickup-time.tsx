import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  PrototypePage,
  shopPhoto,
} from "@/components/customer/PrototypeUI";
import {
  getPickupSlots,
  placeOrder,
  type PickupSlot,
} from "@/features/customer/cartApi";
import type { CustomerOrder } from "@/features/customer/customerTypes";
import { useCart } from "@/features/customer/useCart";

function time(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}
function dateLabel(date: string, today: string) {
  const tomorrow = new Date(new Date(`${today}T12:00:00Z`).getTime() + 86400000)
    .toISOString()
    .slice(0, 10);
  const d = new Date(`${date}T12:00:00`);
  const prefix =
    date === today
      ? "Today"
      : date === tomorrow
        ? "Tomorrow"
        : d.toLocaleDateString("en-LK", { weekday: "short" });
  return `${prefix}, ${d.toLocaleDateString("en-LK", { day: "numeric", month: "short" })}`;
}
export default function PickupTime() {
  const [today] = useState(() =>
    new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10),
  );
  const { basket, refresh } = useCart();
  const [slots, setSlots] = useState<PickupSlot[]>([]);
  const [day, setDay] = useState("");
  const [selected, setSelected] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState("cash");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [checkoutKey] = useState(
    () => `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const submitting = useRef(false);
  const scroll = useRef<ScrollView>(null);
  useEffect(() => {
    let active = true;
    getPickupSlots()
      .then((data) => {
        if (active) {
          setSlots(data);
          setDay(data[0]?.date ?? "");
        }
      })
      .catch((e) => {
        if (active)
          setError(
            e instanceof Error ? e.message : "Unable to load pickup times",
          );
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const data = await getPickupSlots();
      setSlots(data);
      setDay((current) =>
        data.some((item) => item.date === current)
          ? current
          : (data[0]?.date ?? ""),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to refresh slots");
    } finally {
      setBusy(false);
    }
  };
  const slot = slots.find((item) => item.id === selected);
  const confirm = async () => {
    if (submitting.current || !slot) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await placeOrder({
        pickupSlotId: slot.id,
        checkoutKey,
        pickupNote: note,
        paymentMethod: payment,
      });
      setOrder(result);
      await refresh().catch(() => undefined);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to place order. Please retry.",
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  const days = [...new Set(slots.map((item) => item.date))];
  const daySlots = slots.filter((item) => item.date === day);
  return (
    <PrototypePage
      pickup
      footer
      address={basket.shop?.address}
      refreshing={busy}
      onRefresh={() => void load()}
    >
      <ErrorNotice message={error} />
      {order ? (
        <View style={p.card}>
          <Icon name="checkmark-circle" size={50} />
          <Text style={p.title}>Order confirmed</Text>
          <Text selectable style={p.text}>
            Order reference: {order.id}
          </Text>
          <Text style={p.price}>{cash(order.total)}</Text>
          <Text style={p.text}>
            {slot &&
              `${dateLabel(slot.date, today)}, ${time(slot.startTime)} – ${time(slot.endTime)}`}
          </Text>
          <Text style={p.text}>
            Pay by {payment.toUpperCase()} on collection.
          </Text>
          <PrimaryAction
            label="View my orders"
            icon="receipt-outline"
            onPress={() => router.navigate("/customer/orders")}
          />
        </View>
      ) : (
        <>
          <View style={s.shop}>
            <View style={{ flex: 1, gap: 6 }}>
              <View style={{ alignSelf: "flex-start" }}>
                <Badge label="● Express Curbside & Counter" />
              </View>
              <Text style={s.shopName}>
                {basket.shop?.name.replace(" (Demo)", "") ||
                  "Your grocery shop"}
              </Text>
              <View style={p.inline}>
                <Icon name="storefront-outline" size={14} />
                <Text style={[p.text, { flex: 1 }]}>
                  {basket.shop?.address || "Your local neighbourhood"}
                </Text>
              </View>
            </View>
            <Image source={shopPhoto} style={s.shopPhoto} />
          </View>
          <View style={p.info}>
            <View style={s.freshIcon}>
              <Icon name="snow-outline" size={24} color="#06613D" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={p.heading}>Peak Cold-Chain Freshness</Text>
              <Text style={[p.text, { marginTop: 5 }]}>
                Choose a convenient pickup window for your dairy, fresh produce,
                and chilled items.
              </Text>
            </View>
          </View>
          <Text style={s.sectionLabel}>CHOOSE PICKUP DAY</Text>
          <ScrollView
            ref={scroll}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.days}
          >
            {days.map((date) => (
              <Pressable
                key={date}
                accessibilityRole="radio"
                accessibilityState={{ checked: date === day }}
                disabled={busy}
                style={[s.day, date === day && s.daySelected]}
                onPress={() => {
                  setDay(date);
                  setSelected("");
                }}
              >
                <Icon
                  name="calendar-outline"
                  size={17}
                  color={date === day ? "#FFFFFF" : colors.ink}
                />
                <Text style={[s.dayText, date === day && { color: "#FFFFFF" }]}>
                  {dateLabel(date, today)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          {[
            {
              label: "Afternoon Slots",
              icon: "sunny-outline" as const,
              values: daySlots.filter(
                (item) => Number(item.startTime.split(":")[0]) < 18,
              ),
            },
            {
              label: "Evening Slots",
              icon: "moon-outline" as const,
              values: daySlots.filter(
                (item) => Number(item.startTime.split(":")[0]) >= 18,
              ),
            },
          ]
            .filter((group) => group.values.length)
            .map((group) => (
              <View key={group.label} style={s.group}>
                <View style={p.row}>
                  <View style={p.inline}>
                    <Icon
                      name={group.icon}
                      color={
                        group.label.startsWith("Afternoon")
                          ? "#947028"
                          : colors.green
                      }
                    />
                    <Text style={p.heading}>{group.label}</Text>
                  </View>
                  <Text style={p.text}>
                    {time(group.values[0].startTime)} –{" "}
                    {time(group.values[group.values.length - 1].endTime)}
                  </Text>
                </View>
                {group.values.map((item, index) => {
                  const checked = selected === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="radio"
                      accessibilityState={{
                        checked,
                        disabled: !item.remaining,
                      }}
                      disabled={busy || !item.remaining}
                      onPress={() => setSelected(item.id)}
                      style={[
                        s.slot,
                        checked && s.slotSelected,
                        !item.remaining && { opacity: 0.55 },
                      ]}
                    >
                      <View
                        style={[
                          s.clock,
                          checked && { backgroundColor: "#DFF4E8" },
                        ]}
                      >
                        <Icon
                          name={checked ? "checkmark-circle" : "time-outline"}
                          size={21}
                          color={checked ? colors.green : colors.ink}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[s.slotTitle, checked && { color: "#FFFFFF" }]}
                        >
                          {time(item.startTime)} – {time(item.endTime)}
                        </Text>
                        <Text style={[p.text, checked && { color: "#D4E8DC" }]}>
                          {index === 0 && group.label.startsWith("Afternoon")
                            ? "Express prep window"
                            : "Counter collection window"}
                        </Text>
                      </View>
                      <Badge
                        label={
                          checked
                            ? "Selected"
                            : !item.remaining
                              ? "Full"
                              : item.remaining <= 2
                                ? `${item.remaining} slots left`
                                : "Available"
                        }
                        color={
                          checked
                            ? "#FFFFFF"
                            : item.remaining <= 2
                              ? "#916018"
                              : "#525E55"
                        }
                        background={
                          checked
                            ? "#29A565"
                            : item.remaining <= 2
                              ? "#FFF0D4"
                              : "#EEEFFC"
                        }
                      />
                    </Pressable>
                  );
                })}
              </View>
            ))}
          {!busy && !slots.length && (
            <ErrorNotice message="No future pickup slots available. Pull down to refresh." />
          )}
          <View style={p.row}>
            <Text style={p.name}>Pickup notes & vehicle info</Text>
            <Text style={p.text}>Optional</Text>
          </View>
          <View style={s.notes}>
            <Icon name="car-outline" color="#677168" size={21} />
            <TextInput
              accessibilityLabel="Pickup notes and vehicle information"
              value={note}
              onChangeText={setNote}
              maxLength={300}
              multiline
              editable={!busy}
              style={s.input}
              placeholder="Curbside pickup – vehicle details or counter note"
              placeholderTextColor="#737A75"
            />
          </View>
          <Text style={p.text}>
            Add a note to help the shop with your collection.
          </Text>
          {slot && (
            <View style={s.confirmed}>
              <View style={p.circle}>
                <Icon name="checkmark-circle-outline" size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.sectionLabel}>CONFIRMED SLOT</Text>
                <Text style={s.confirmedTitle}>
                  {dateLabel(slot.date, today)}, {time(slot.startTime)} –{" "}
                  {time(slot.endTime)} • Counter Pickup
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                style={p.linkTouch}
                disabled={busy}
                onPress={() => {
                  setSelected("");
                  scroll.current?.scrollTo({ x: 0, animated: true });
                }}
              >
                <Text style={p.link}>Change</Text>
              </Pressable>
            </View>
          )}
          <View style={s.payment}>
            {["cash", "card", "lankaqr"].map((method) => (
              <Pressable
                key={method}
                accessibilityRole="radio"
                accessibilityState={{ checked: payment === method }}
                disabled={busy}
                onPress={() => setPayment(method)}
                style={[
                  s.paymentOption,
                  payment === method && { backgroundColor: "#E4F0E9" },
                ]}
              >
                <Icon
                  name={
                    method === "cash"
                      ? "cash-outline"
                      : method === "card"
                        ? "card-outline"
                        : "qr-code-outline"
                  }
                  size={16}
                />
                <Text style={s.paymentLabel}>{method.toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>
          <PrimaryAction
            icon="bag-handle-outline"
            label={busy ? "Please wait…" : "Confirm Pickup Time & Place Order"}
            disabled={
              busy ||
              !slot?.remaining ||
              !basket.items.length ||
              basket.items.some((item) => item.needsReplacement)
            }
            onPress={() => void confirm()}
          />
          <View style={s.paymentNote}>
            <Icon name="shield-checkmark" size={15} />
            <Text style={p.tiny}>
              Pay with Cash, Card, or LANKAQR upon collection
            </Text>
          </View>
        </>
      )}
      {busy && <ActivityIndicator color={colors.green} />}
    </PrototypePage>
  );
}
const s = StyleSheet.create({
  shop: { flexDirection: "row", alignItems: "center", gap: 12 },
  shopName: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "600",
    color: colors.ink,
  },
  shopPhoto: { width: 87, height: 87, borderRadius: 12 },
  freshIcon: {
    backgroundColor: "#8AF5C2",
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#58645B",
    letterSpacing: 0.4,
  },
  days: { padding: 5, gap: 6, backgroundColor: "#EEEFFC", borderRadius: 11 },
  day: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: 11,
    borderRadius: 9,
    minHeight: 44,
  },
  daySelected: { backgroundColor: colors.green },
  dayText: { fontSize: 12, fontWeight: "600", color: colors.ink },
  group: { gap: 10 },
  slot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    padding: 13,
    borderRadius: 13,
    minHeight: 76,
  },
  slotSelected: { backgroundColor: "#008439" },
  clock: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: "#EFEFFC",
    alignItems: "center",
    justifyContent: "center",
  },
  slotTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  notes: {
    backgroundColor: "#ECEBFE",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    color: colors.ink,
    fontSize: 13,
    lineHeight: 20,
    minHeight: 42,
    padding: 0,
  },
  confirmed: {
    backgroundColor: "#E5E4FC",
    borderRadius: 13,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 7,
  },
  confirmedTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
    marginTop: 4,
  },
  payment: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  paymentOption: {
    flexDirection: "row",
    gap: 5,
    padding: 9,
    borderRadius: 8,
    minHeight: 40,
    alignItems: "center",
  },
  paymentLabel: { fontSize: 10, fontWeight: "600", color: "#57655C" },
  paymentNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
});
