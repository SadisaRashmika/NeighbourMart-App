# Member 2 integration on development

Implemented in `NeighbourMart-App[hasithi]` using the existing development branch architecture.

## Scope

- I06: MongoDB basket, quantity editing, removal, clear, totals and checkout entry.
- I07: Same-shop/category alternatives, price comparison, approve replacement or remove the original item.
- I08: Pickup dates/slots from the owner's opening hours, capacity, collection notes, counter payment preference and order confirmation.
- Stock and slot capacity are reserved atomically. A checkout key prevents duplicate orders on retries.

The existing login/session, product dashboard/detail, customer settings/reminders, shop screens, reports, and navigation layouts are preserved. The four-argument `addItem(product, quantity, substitute, shopName)` interface still works. Preferences and product images are saved/read through the basket API.

## Shared integration changes

- `server/src/app.ts`: mounts `/api/cart`.
- `Order`, `Shop`, `PickupSlot`: additive checkout fields/indexes with backward-compatible defaults.
- Existing customer order list controller: returns the shared orders instead of HTTP 501.
- Existing shop order service: delegates only orders created by Member 2 checkout to reservation cleanup on cancellation/deletion. Counter orders retain their previous behavior and DTO/status mapping (`new`, `preparing`, `ready`, `completed`).

No shop screen, report, authentication, profile, dashboard or product screen implementation was replaced.

## API

Authenticated customer endpoints:

| Method | Path | Purpose |
|---|---|---|
| GET / DELETE | `/api/cart` | Read / clear basket |
| PUT / DELETE | `/api/cart/items/:productId` | Set quantity/preference / remove |
| GET | `/api/cart/items/:productId/replacements` | Available alternatives |
| POST | `/api/cart/items/:productId/replacement` | Approve replacement |
| GET | `/api/cart/pickup-slots` | Future pickup slots |
| POST | `/api/cart/checkout` | Create shared order |

Checkout accepts `pickupSlotId`, `checkoutKey`, `pickupNote` and `paymentMethod`. Prices, stock, fees, customer identity and shop ownership are resolved on the server. Payment selection is a counter-payment preference; no online payment is charged.

## Verify

From `server`: `npm run build` and `node --import tsx --test tests/member2.test.ts`.
The integration suite uses a separate `nm_member2_test_*` database and deletes only that test database afterward.
From `client`: `npm run typecheck`, `npm run lint`.

Manual flow: sign in with an existing customer → select a shop in Home → add products → Cart → edit quantity/substitution → select pickup → confirm. Sign in with that shop's existing owner to process the order using the current shop order screens.

For local emulator verification, `.env` uses `NeighbourMartDevelopment` because the older `NeighbourMart` database contains mobile-only demo users incompatible with development's required email index. Those older records are preserved. Run `node --import tsx src/scripts/seedMember2Demo.ts` from `server` to create the isolated demo data without resetting existing carts/orders/stock.

- Customer email: `customer@neighbourmart.test`
- Shop owner email: `shop@neighbourmart.test`
- Both demo passwords: `NeighbourDemo2026!`

Start with `npm start` in `server` after building and `npm start` in `client`. The emulator needs both `adb reverse tcp:8081 tcp:8081` and `adb reverse tcp:5000 tcp:5000` when opening `exp://127.0.0.1:8081`.

The customer Orders and order-tracking screens remain the other member's existing placeholders; the customer order API now supplies data for their integration. Merchant proposals after checkout are outside this pre-checkout substitution flow.
