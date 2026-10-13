# ShopKart

A full-stack e-commerce app: customer auth, product catalog with search and category filters, wishlist, shopping cart, and checkout with Razorpay (test mode) and order history.

**Live demo:** https://shopkart-steel.vercel.app · **Backend API:** https://shopkart-dc5v.onrender.com

> The backend runs on Render's free tier and sleeps when idle, so the first request can take 30-60 seconds.

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, React Router, Axios
- **Backend:** Node.js, Express 4, Mongoose, JWT (httpOnly cookie), bcrypt, express-rate-limit
- **Database:** MongoDB (local or Atlas)
- **Payments:** Razorpay (test mode)

## Prerequisites

- Node.js 18+
- A MongoDB instance (local, or a free MongoDB Atlas cluster)
- A Razorpay account with **test** API keys (Dashboard → Account & Settings → API Keys)

## Setup

```bash
git clone https://github.com/404RiyaFound/ShopKart.git
cd ShopKart
```

### Backend

```bash
cd backend
npm install
cp .env.example .env     # then fill in real values
npm run dev              # or: npm start
```

| Variable | Description |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign tokens |
| `CLIENT_URL` | Frontend origin allowed by CORS (e.g. `http://localhost:5173`) |
| `NODE_ENV` | `development` or `production` |
| `RAZORPAY_KEY_ID` | Razorpay test key id |
| `RAZORPAY_KEY_SECRET` | Razorpay test key secret (backend only) |

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev              # http://localhost:5173
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (e.g. `http://localhost:5000`) |

Production build: `npm run build`.

## Admin access

Registration creates regular customers. To use `/admin` (create products, manage order status), set `isAdmin: true` on a user in MongoDB, e.g. in `mongosh`:

```js
db.customers.updateOne({ email: "you@example.com" }, { $set: { isAdmin: true } })
```

## Testing payments

Use Razorpay test mode. Test card: `4111 1111 1111 1111`, any future expiry, any CVV; or use the UPI/netbanking test options in the Razorpay popup.

## API overview

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/customers/register` | – | Register |
| POST | `/customers/login` | – | Login (rate-limited) |
| GET | `/customers/me` | ✅ | Current profile |
| POST | `/customers/logout` | ✅ | Logout |
| PATCH | `/customers/change-password` | ✅ | Change password |
| GET | `/products` | – | List products (search / category query) |
| GET | `/products/:id` | – | Single product |
| POST | `/products` | Admin | Create product |
| GET/POST/DELETE | `/wishlist`, `/wishlist/:productId` | ✅ | Wishlist; `PATCH /wishlist/:productId/toggle` toggles |
| GET/POST/PATCH/DELETE | `/cart`, `/cart/:productId` | ✅ | Cart |
| POST | `/orders/create-payment-order` | ✅ | Validate cart, create pending order and Razorpay order |
| POST | `/orders/verify-payment` | ✅ | Verify signature, mark paid, decrement stock, clear cart |
| GET | `/orders`, `/orders/:id` | ✅ | Own orders |
| GET | `/orders/admin/all` | Admin | All orders |
| PATCH | `/orders/:id/status` | Admin | Advance order status |

## Deployment notes

- Frontend (e.g. Vercel/Netlify): set `VITE_API_URL` to the deployed backend URL.
- Backend (e.g. Render): set all backend env vars, with `NODE_ENV=production` and `CLIENT_URL` equal to the deployed frontend origin (no trailing slash). In production cookies are `secure` and `SameSite=None` so the cross-site frontend can authenticate.
- Use MongoDB Atlas and allow the host's IPs in Network Access.

## Security

No secrets are committed. `.env` files are git-ignored; use the provided `.env.example` files as templates.
