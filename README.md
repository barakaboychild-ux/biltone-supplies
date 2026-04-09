# Biltone Supplies - Official Site

Premium eCommerce storefront for Biltone Supplies, featuring a high-performance shopping cart, real-time order tracking, and a powerful administrative dashboard.

## 🚀 Live Site
Managed and hosted via **Netlify**.

## 🛠️ Technology Stack
- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (via CDN)
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage)
- **Hosting**: Netlify

## ⚙️ Setup & Deployment

### 1. Database Security (CRITICAL)
Before accepting public customers, you must apply the Row Level Security (RLS) policies.
- Open **Supabase > SQL Editor**.
- Copy the contents of `secure_database.sql` from this repository.
- Paste and click **Run**.

### 2. Admin Access
The first user to register at `/admin/login.html` is automatically promoted to **Owner**.
Owners can:
- Manage all staff accounts.
- Approve profile modifications.
- Edit site content (About Us).
- View and manage all customer orders.

### 3. Order Management
The Admin Orders dashboard features two buckets:
- **Active Orders**: Current pending/shipped orders.
- **Finished Orders**: History of delivered or cancelled orders.

## 📦 Deployment to Netlify
1. Connect this GitHub repository to your Netlify account.
2. Ensure the "Base directory" is set to `/` (the root).
3. Set the "Build command" to empty (none).
4. Set the "Publish directory" to `.` (the root).
5. Deploy!

---
© 2026 Biltone Supplies. All rights reserved.
