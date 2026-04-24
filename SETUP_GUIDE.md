# TokBoost SMM Panel - Setup Guide

## Project Overview
Full-stack TikTok SMM Panel with Owner Panel, Admin Panel, and User Panel.
- **Backend:** Node.js + Hono (JSON file based - NO DATABASE)
- **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui
- **Theme:** TikTok Official Dark Theme with Cyan (#25F4EE) & Pink (#FE2C55)

## How to Run

### Development Mode (Frontend + Backend)
```bash
cd /mnt/agents/output/app
npm run dev
```
This starts:
- Frontend dev server at http://localhost:3000
- Backend API server at http://localhost:3001 (proxied via frontend)

### Production Mode
```bash
cd /mnt/agents/output/app
npm run build
npm start
```
This starts the production server at http://localhost:3000 serving both API and static frontend.

## Default Login Credentials

### Owner Panel
- **Username:** `owner`
- **Password:** `owner123`

### Admin Panel
- Owner creates admins from the Owner Panel
- Each admin gets a username/password
- Admins login at: `/admin-login`

## How to Change Pricing

1. Login to Owner Panel (`/`)
2. Go to **Pricing** tab
3. Update prices per service (PKR per unit):
   - Followers (default: Rs. 50)
   - Likes (default: Rs. 30)
   - Comments (default: Rs. 100)
   - Views (default: Rs. 20)
   - Shares (default: Rs. 40)
4. Click **Update Pricing**

## How the System Works

### 1. Owner Creates Admin
- Owner Panel > Admins tab > Add new admin with username & password
- Admin automatically gets a unique **User Panel Link**

### 2. Admin Setup
- Admin logs in at `/admin-login` with username & password
- Admin Panel > Wallet tab:
  - Select **Easypaisa** or **JazzCash**
  - Enter wallet number and account name
  - Click **Save Wallet**
- Admin Panel > User Link tab:
  - Copy the unique user panel link
  - Share with customers
  - Can regenerate link anytime

### 3. User Orders
- User opens the admin's unique link (e.g., `/panel/abc123`)
- No password required
- User enters:
  - TikTok username
  - Service type (followers, likes, etc.)
  - Quantity
- Price auto-calculates
- User sees admin's wallet details
- User sends payment and uploads:
  - Transaction ID
  - Payment screenshot
- User sees "Please wait" message

### 4. Order Completion
- Order appears in Admin Panel > Orders tab
- Admin sees payment proof and order details
- Admin clicks **Complete**
- User automatically sees "Order Complete!" notification
- User can submit review/rating

## JSON Data Files (NO DATABASE)

All data is stored in `/data/` folder as JSON files:

| File | Purpose |
|------|---------|
| `data/owner.json` | Owner username, password hash, WhatsApp number |
| `data/admins.json` | Admin accounts, wallet info, user links |
| `data/pricing.json` | Service prices per unit |
| `data/orders.json` | All customer orders |
| `data/complaints.json` | Complaint submissions |
| `data/reviews.json` | Customer reviews & ratings |
| `data/activity.json` | Admin activity logs |

## Changing Owner Credentials

1. Login to Owner Panel
2. Go to **Settings** tab
3. Update:
   - Username
   - New Password (leave blank to keep current)
   - WhatsApp Number
4. Click **Update Settings**

## Pages/Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Owner Login | Public |
| `/owner` | Owner Dashboard | Owner only |
| `/admin-login` | Admin Login | Public |
| `/admin` | Admin Dashboard | Admin only |
| `/panel/:link` | User Order Panel | Public (no password) |
| `/complaint` | Submit Complaint | Public |

## Features Summary

**Owner Panel:**
- Add/Remove Admins
- View Live Admin Activity
- View All Orders
- Update Pricing
- View Complaints
- View Reviews
- Update Owner Credentials
- Stats Dashboard (total admins, orders, revenue)

**Admin Panel:**
- Wallet Setup (Easypaisa/JazzCash)
- Generate/Refresh User Panel Link
- Receive Orders with Payment Proof
- Mark Orders Complete
- View Earnings & Stats
- View Customer Reviews

**User Panel:**
- Enter TikTok Username
- Select Service & Quantity
- Auto Price Calculation
- See Admin Wallet for Payment
- Upload Transaction ID & Screenshot
- Real-time Order Status Tracking
- Submit Review after Completion

**Global:**
- WhatsApp Contact Button
- Complaint Submission Form
- TikTok Official Theme
- Animations & Glow Effects
