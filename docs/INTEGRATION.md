# Member 2 integration

Home's `CartContext.addItem(product)` uses the authenticated customer's saved MongoDB basket. Product IDs are the existing Product document IDs; one basket belongs to one shop. Replacement approval preserves shop/category and recalculates price. Pickup confirmation creates an Order referencing that customer, Shop, Product IDs and PickupSlot.

The same order is available through `GET /api/orders/mine`, `GET /api/orders/shop`, and `GET /api/orders/:id`. Detail responses include items, shop, customer name, pickup slot, notes, payment method, total and last status-update time. Customer and shop endpoints enforce ownership.

All members should use these status values: `pending → accepted → preparing → ready → picked-up`; cancellation is allowed from pending, accepted or preparing. `PATCH /api/orders/:id/status` accepts `{ status }` from the owning shop only. Cancellation restores reserved stock and pickup capacity atomically and cannot run twice. The customer tracking screen refreshes every 15 seconds while focused.

Demo handoff: customer `0771234567` / `NeighbourDemo2026!` confirms an order; sign in separately as shop owner `0777654321` / `NeighbourDemo2026!`, open Shop Orders, open the order and advance its status. Customer Orders → Track order & pickup shows those changes. The two logins can be used on separate devices; restarting the app clears its in-memory login session.

These shop/order tracking screens are functional integration adapters in the existing routes. Other members can extend their designs without replacing the shared order model or API contracts. Shop dashboard, reports, registration and settings remain separate unfinished modules.
