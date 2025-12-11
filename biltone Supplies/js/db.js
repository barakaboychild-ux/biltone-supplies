/**
 * Biltone Supplies - Simulated Database
 * Handles data persistence using localStorage
 */

const DB_KEYS = {
    PRODUCTS: 'biltone_products',
    USERS: 'biltone_users',
    ORDERS: 'biltone_orders',
    OFFERS: 'biltone_offers',
    CONTENT: 'biltone_content',
    MESSAGES: 'biltone_messages',
    PENDING_UPDATES: 'biltone_pending_updates'
};

const SEED_DATA = {
    // ... products/users ...
    MESSAGES: [
        { id: 1, name: "John Doe", email: "john@example.com", message: "Do you supply wholesale?", date: new Date().toISOString(), status: 'New' }
    ],
    PENDING_UPDATES: [],
    PRODUCTS: [
        { id: 1, title: "Professional Barber Shears", price: 2500, image: "https://placehold.co/400x400?text=Shears", stock: 50, category: "Tools" },
        { id: 2, title: "Electric Hair Clipper", price: 4500, image: "https://placehold.co/400x400?text=Clipper", stock: 30, category: "Electronics" },
        { id: 3, title: "Beard Oil (Premium)", price: 800, image: "https://placehold.co/400x400?text=Beard+Oil", stock: 100, category: "Grooming" },
        { id: 4, title: "Salon Cape", price: 500, image: "https://placehold.co/400x400?text=Cape", stock: 200, category: "Accessories" },
        { id: 5, title: "Shaving Cream", price: 450, image: "https://placehold.co/400x400?text=Cream", stock: 80, category: "Grooming" },
        { id: 6, title: "Hair Dryer", price: 3200, image: "https://placehold.co/400x400?text=Dryer", stock: 25, category: "Electronics" },
        // New Products
        { id: 7, title: "Black Shampoo", price: 1200, image: "https://placehold.co/400x400?text=Black+Shampoo", stock: 40, category: "Grooming" },
        { id: 8, title: "Neck Rolls (Pack)", price: 300, image: "https://placehold.co/400x400?text=Neck+Rolls", stock: 150, category: "Accessories" },
        { id: 9, title: "Nivea Cream (Blue Tin)", price: 450, image: "https://placehold.co/400x400?text=Nivea+Cream", stock: 60, category: "Cosmetics" },
        { id: 10, title: "Bumsy Lotion", price: 600, image: "https://placehold.co/400x400?text=Bumsy", stock: 50, category: "Cosmetics" }
    ],
    USERS: [
        // Password is 'admin123' (hashed simply for demo)
        { email: 'owner@biltone.com', password: 'admin', role: 'owner', approved: true, name: 'System Owner' },
        { email: 'barakaboychild@gmail.com', password: 'Wanjala@18', role: 'admin', approved: true, name: 'Baraka' }
    ],
    OFFERS: [
        { id: 1, productId: 2, discountPrice: 3999, expiresAt: new Date(Date.now() + 86400000).toISOString() } // 24 hours from now
    ],
    CONTENT: {
        aboutUs: "<h1>About BiltoneBrands</h1><p>BiltoneBrands is your customer based platform dedicated to providing you with affordable barber shop and beauty supplies. We provide you with cosmetics and barber shop products.</p><p>Contact us at 0115516136 on whatsapp and calls for more information.</p>"
    }
};

const DB = {
    init() {
        if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
            localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(SEED_DATA.PRODUCTS));
        }
        if (!localStorage.getItem(DB_KEYS.USERS)) {
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(SEED_DATA.USERS));
        }
        if (!localStorage.getItem(DB_KEYS.OFFERS)) {
            localStorage.setItem(DB_KEYS.OFFERS, JSON.stringify(SEED_DATA.OFFERS));
        }
        if (!localStorage.getItem(DB_KEYS.CONTENT)) {
            localStorage.setItem(DB_KEYS.CONTENT, JSON.stringify(SEED_DATA.CONTENT));
        }
        if (!localStorage.getItem(DB_KEYS.ORDERS)) {
            localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify([]));
        }
        if (!localStorage.getItem(DB_KEYS.MESSAGES)) {
            localStorage.setItem(DB_KEYS.MESSAGES, JSON.stringify(SEED_DATA.MESSAGES));
        }
        if (!localStorage.getItem(DB_KEYS.PENDING_UPDATES)) {
            localStorage.setItem(DB_KEYS.PENDING_UPDATES, JSON.stringify(SEED_DATA.PENDING_UPDATES));
        }
    },

    // --- Products ---
    getProducts() {
        return JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || '[]');
    },
    getProduct(id) {
        return this.getProducts().find(p => p.id == id);
    },
    saveProduct(product) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id == product.id);
        if (index >= 0) {
            products[index] = product;
        } else {
            product.id = Date.now();
            products.push(product);
        }
        localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    },
    deleteProduct(id) {
        const products = this.getProducts().filter(p => p.id != id);
        localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    },

    // --- Offers ---
    getOffers() {
        return JSON.parse(localStorage.getItem(DB_KEYS.OFFERS) || '[]');
    },
    getActiveOffer(productId) {
        const offers = this.getOffers();
        const offer = offers.find(o => o.productId == productId);
        if (offer && new Date(offer.expiresAt) > new Date()) {
            return offer;
        }
        return null;
    },

    // --- Users (Auth) ---
    getUsers() {
        return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    },
    updateUser(email, userData) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.email === email);
        if (index !== -1) {
            users[index] = { ...users[index], ...userData };
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));

            // Update session if it's the current user
            const session = sessionStorage.getItem('biltone_session');
            if (session) {
                const currentUser = JSON.parse(session);
                if (currentUser.email === email) {
                    const updatedUser = { ...currentUser, ...userData };
                    sessionStorage.setItem('biltone_session', JSON.stringify(updatedUser)); // Fix: Update session key
                }
            }
            return true;
        }
        return false;
    },

    registerUser(email, password, name) {
        const users = this.getUsers();
        if (users.find(u => u.email === email)) {
            throw new Error("Email already registered");
        }
        users.push({
            email,
            password, // In real app, hash this!
            name,
            role: 'admin',
            approved: false
        });
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    },
    loginUser(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) return null;
        if (!user.approved) throw new Error("Account pending approval");
        return user;
    },

    // --- Messages ---
    getMessages() {
        return JSON.parse(localStorage.getItem(DB_KEYS.MESSAGES) || '[]');
    },
    saveMessage(msg) {
        const messages = this.getMessages();
        const newMsg = {
            id: 'MSG-' + Date.now(),
            date: new Date().toISOString(),
            status: 'New',
            ...msg
        };
        messages.unshift(newMsg);
        localStorage.setItem(DB_KEYS.MESSAGES, JSON.stringify(messages));
    },
    markMessageRead(id) {
        const messages = this.getMessages();
        const msg = messages.find(m => m.id === id);
        if (msg) {
            msg.status = 'Read';
            localStorage.setItem(DB_KEYS.MESSAGES, JSON.stringify(messages));
        }
    },
    approveUser(email) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email);
        if (user) {
            user.approved = true;
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        }
    },

    // --- Pending Profile Updates ---
    getPendingUpdates() {
        return JSON.parse(localStorage.getItem(DB_KEYS.PENDING_UPDATES) || '[]');
    },
    requestProfileUpdate(email, userData) {
        const updates = this.getPendingUpdates();
        updates.push({
            id: 'UPD-' + Date.now(),
            email,
            userData,
            date: new Date().toISOString()
        });
        localStorage.setItem(DB_KEYS.PENDING_UPDATES, JSON.stringify(updates));
    },
    approveProfileUpdate(id) {
        const updates = this.getPendingUpdates();
        const updateIndex = updates.findIndex(u => u.id === id);
        if (updateIndex !== -1) {
            const update = updates[updateIndex];
            // Apply Update
            this.updateUser(update.email, update.userData);
            // Remove from pending
            updates.splice(updateIndex, 1);
            localStorage.setItem(DB_KEYS.PENDING_UPDATES, JSON.stringify(updates));
            return true;
        }
        return false;
    },
    rejectProfileUpdate(id) {
        const updates = this.getPendingUpdates();
        const newUpdates = updates.filter(u => u.id !== id);
        localStorage.setItem(DB_KEYS.PENDING_UPDATES, JSON.stringify(newUpdates));
    },

    // --- Orders ---
    getOrders() {
        return JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
    },
    createOrder(orderData) {
        const orders = this.getOrders();
        const newOrder = {
            id: 'ORD-' + Date.now(),
            date: new Date().toISOString(),
            status: 'Pending',
            ...orderData
        };
        orders.unshift(newOrder); // Add to top
        localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
        return newOrder;
    },
    updateOrderStatus(id, status) {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === id);
        if (order) {
            order.status = status;
            localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
        }
    },

    // --- Content ---
    getContent() {
        return JSON.parse(localStorage.getItem(DB_KEYS.CONTENT) || '{}');
    },
    saveContent(content) {
        localStorage.setItem(DB_KEYS.CONTENT, JSON.stringify(content));
    }
};

// Initialize on load
DB.init();
