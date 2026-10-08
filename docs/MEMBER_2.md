# Member 2 — NeighbourMart

The Milestone 02 workload table assigns IT23776678 (Ranathunga N R A H G) I06 Cart / Order Summary, I07 Substitution Approval, and I08 Pickup Time Selection, with T03 and T04 testing responsibilities. The PDFs are assignment/reference material; the requested implementation uses this repository's Expo Router, Express TypeScript, and Mongoose architecture.

## Run the application

Use Node 22.13 or newer for this repository's Expo SDK 57. In separate terminals:

```powershell
cd server
npm install
# For a fresh checkout, copy .env.example to .env and configure MongoDB and JWT_SECRET.
npm run seed:demo
npm run dev
```

```powershell
cd client
npm install
# For a fresh checkout, copy .env.example to .env.
npm start
```

Local ignored `.env` files are configured. The server uses database `NeighbourMart`. The client URL is `http://192.168.1.137:5000`, the laptop's detected LAN IP during implementation. Update it if the IP changes. Phone and computer must share a network; allow Node through the firewall for your private network. Open the Expo QR code on the phone. Check `http://192.168.1.137:5000/api/health` if the phone cannot reach the backend.

Demo customer: `0771234567`, password `NeighbourDemo2026!`. Demo credentials are for demonstration only. The seed adds named demo records without overwriting existing products or accounts, and configures the named demo shop's packing fee and discount. It supplies slots for today and the next two days (past times are filtered out), a basket containing milk, dhal and unavailable red onions, and available Bombay onions. Re-running the seed does not reset a customer's existing basket or overwrite stock. After checkout, add more groceries from Home to repeat the flow.

Sign in → Cart → Modify the substitution for Red Onions → approve Bombay onions (or reject/remove) → select pickup day and time → add optional pickup note → choose payment on collection → confirm → view saved orders. The initial basket subtotal is LKR 1,590, plus LKR 50 packing fee minus LKR 40 community discount, giving LKR 1,600. Replacing red onions with Bombay onions changes the total to LKR 1,550. User-edited quantities naturally change these totals.

Secrets remain in ignored `.env` files; `.env.example` contains placeholders. Rotate credentials shared in chat before production use. Email configuration is retained locally, but this feature does not send emails or charge cards. Login sessions are held in memory and require sign-in after restarting the app.

## Implemented operations and traceability

| Interface | Requirements | Working operations | Test evidence |
| --- | --- | --- | --- |
| I06 Cart / Order Summary | FR03, FR04, NFR04, NFR05 | Create basket item; read persisted basket/current prices; update quantity; delete item/clear basket | Quantity persistence, server total calculation, ownership and delete/clear integration tests |
| I07 Substitution Approval | FR06, NFR01 | Read alternatives from the same shop/category; update basket after explicit approval; delete original after rejection | Replacement price recalculation and invalid-category rejection; API delete tests |
| I08 Pickup Time Selection | FR05, NFR05 | Read available future slots; create confirmed order with selected slot, note and payment method | Atomic checkout, stock rollback, last-slot concurrency, past-slot rejection, duplicate retry tests |

Checkout runs in a MongoDB transaction; use Atlas or a local replica set, not standalone MongoDB. It validates live prices, stock, shop availability and slot capacity, reserves stock and slot, saves the order, and clears the basket together. Failed checkout preserves the basket and releases tentative reservations. A unique customer/checkout-key index ensures retries return the original order. Cart uses optimistic concurrency to reject conflicting edits. Customers cannot read or change another customer's cart through these routes.

## API contract

All `/api/cart` routes require `Authorization: Bearer <JWT>` and customer role. Login returns `{ id, name, role, token }` after validating `mobileNumber` and `password`. `/api/auth/me` reads the authenticated user. Public `/api/products` supplies product IDs and shop/category/stock information. `/api/orders/mine` lists only the authenticated customer's orders.

| Method | Endpoint | Body / purpose |
| --- | --- | --- |
| GET | `/api/cart` | `{ items, subtotal, packingFee, communityDiscount, total, shop }` |
| PUT | `/api/cart/items/:productId` | `{ quantity }`, integer 1–99; create or update |
| DELETE | `/api/cart/items/:productId` | Remove/reject an item |
| DELETE | `/api/cart` | Clear basket |
| GET | `/api/cart/items/:productId/replacements` | Same category and shop, enough stock |
| POST | `/api/cart/items/:productId/replacement` | `{ replacementId }` |
| GET | `/api/cart/pickup-slots` | Future slots with remaining capacity |
| POST | `/api/cart/checkout` | `{ pickupSlotId, checkoutKey, pickupNote, paymentMethod }` |

Reuse the same checkout key when retrying a confirmation. Payment method is `cash`, `card`, or `lankaqr`; pickup note is at most 300 characters. Prices/totals sent by a client are never trusted. Slot times are interpreted in Asia/Colombo. API errors return a readable `{ message }`; screens show errors, loading indicators, and refresh actions.

## Prototype fidelity and documented deviations

Reference: Milestone 02 Appendix D.6–D.8, pages 58–60. The app follows the green/pale-purple palette, white cards, shop/address summary, quantity controls, item totals, comparison/approval decisions, pickup-day/time choices, optional vehicle note and confirmation flow.

The three Member 2 screens were visually revised against the PDF on 9 October 2026: compact headers, product photography, circular quantity controls, coloured substitution strips, item comparison columns, savings panel, horizontal pickup-day selection, afternoon/evening time cards, and a consistent fixed footer with real outline icons and a green active tab. The bundled reference product/shop images were extracted from the supplied Milestone 02 PDF; they are static prototype assets rather than a general product-image database. Pull-to-refresh replaces the prominent refresh buttons. Images and spacing adapt to the phone width.

Shop packing fees and community discounts are stored in MongoDB and calculated by the server for both basket and confirmed order. The demo shop uses the PDF's LKR 50 fee and LKR 40 discount; unconfigured shops default to zero. Merchant notes, specific counter assignments, distance, actual packing status and freshness guarantees are not fabricated. Current dates, quantities, prices, stock and capacity come from application data rather than screenshot literals. The replacement workflow operates before checkout on the customer's basket; merchant-proposed replacements after order placement require integration with Member 4's shop order workflow and are not implemented here. A customer explicitly approves every replacement. Sinhala/Tamil translation remains outside this increment. Authentication uses passwords rather than the prototype's social login options. Supporting Home and Orders screens remain minimal integration screens for their respective members.

For networks that refuse Atlas SRV DNS lookups, `MONGO_DNS_SERVERS` optionally selects DNS resolvers for the Node process only. The local configuration uses public resolvers; Windows network settings are unchanged. Leave it blank to use the system resolver.

## Verification

```powershell
cd client
npm run typecheck
npm run lint
cd ../server
npm run typecheck
npm run build
npm test
```

Default `npm test` starts an isolated MongoDB replica set using mongodb-memory-server. Its first run downloads MongoDB, which is large on Windows. Alternatively, `npm run test:atlas` uses the configured Atlas URI, creates a unique `neighbourmart_test_<timestamp>` database, runs fixture tests only there, and drops that test database afterward. The credential must have permission to create/drop the test database. It never runs tests in the application's database.

On 9 October 2026, eleven integration tests passed against an isolated Atlas database, including the added packing-fee/discount agreement check. Coverage also includes quantity/time validation; password login/token verification; simultaneous same-customer retries; cart persistence/totals; replacement approval/category rejection; atomic checkout/duplicate retry; stock-failure rollback; concurrent last-slot competition; past/wrong-shop slots; authentication/cart isolation/delete/clear. Client typecheck and lint and server build passed. The preceding implementation also passed Expo web and Android bundle exports. The updated cart and footer were visually checked in the Pixel 6 emulator; the backend health endpoint reported a connected database. These results do not constitute human usability testing.

## Assignment evidence to collect

Milestone 03 requires a runnable app, at least two CRUD operations per assigned interface, functional traceability, a consolidated report and usability testing with at least five real/proxy participants. Use the mapping above in your own report and explain the implementation during the viva. Do not label the earlier prototype study as testing of this working app.

T03: sign in, review cart, increase/decrease quantities, remove an item, refresh to verify persistence, and check the total. T04: review original/alternative prices, approve/reject a replacement, choose/change a pickup day and slot, add a note, confirm, then verify the order. Include failure scenarios for unavailable stock and a full pickup slot.

| Participant | Task | Completion | Seconds | Errors | Prompts | Ease 1–5 | Comments / issue |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P01 | T03/T04 | Pending actual session | | | | | |
| P02 | T03/T04 | Pending actual session | | | | | |
| P03 | T03/T04 | Pending actual session | | | | | |
| P04 | T03/T04 | Pending actual session | | | | | |
| P05 | T03/T04 | Pending actual session | | | | | |

Record screenshots of all three screens, real test outcomes, issues and fixes, and keep session evidence for the appendix. An APK and the consolidated report have not been produced by this code increment.
