/**
 * Biltone Supplies - Main Logic
 * Handles Cart, Auth, and UI interactions
 */

const App = {
    state: {
        cart: [],
        user: null
    },

    init() {
        this.loadCart();
        this.checkAuth();
        this.updateCartUI();
        this.setupMobileMenu();
        this.setupAdminMobileMenu();
    },

    setupMobileMenu() {
        // Public site mobile menu
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');
        
        if (btn && menu) {
            btn.addEventListener('click', () => {
                menu.classList.toggle('hidden');
            });
        }
    },

    setupAdminMobileMenu() {
        // Admin dashboard mobile sidebar
        const btn = document.getElementById('mobile-sidebar-btn');
        const sidebar = document.getElementById('admin-sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (btn && sidebar && overlay) {
            const toggleSidebar = () => {
                sidebar.classList.toggle('-translate-x-full');
                overlay.classList.toggle('hidden');
            };

            btn.addEventListener('click', toggleSidebar);
            overlay.addEventListener('click', toggleSidebar);
        }
    },

    // --- Cart System ---
    loadCart() {
        const saved = localStorage.getItem('biltone_cart');
        if (saved) this.state.cart = JSON.parse(saved);
    },

    saveCart() {
        localStorage.setItem('biltone_cart', JSON.stringify(this.state.cart));
        this.updateCartUI();
    },

    async addToCart(productIdOrObj, quantity = 1) {
        let product = productIdOrObj;

        // If ID passed, fetch product
        if (typeof productIdOrObj === 'number' || typeof productIdOrObj === 'string') {
            try {
                product = await window.DB.getProduct(productIdOrObj);
            } catch (e) {
                console.error("Error fetching product for cart:", e);
                this.showToast("Error adding to cart");
                return;
            }
        }

        if (!product) {
            this.showToast("Product not found");
            return;
        }

        const existing = this.state.cart.find(item => item.id == product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            // Check for active offer
            const price = product.offer_price && product.offer_expires && new Date(product.offer_expires) > new Date()
                ? product.offer_price
                : product.price;

            this.state.cart.push({
                id: product.id,
                title: product.title,
                price: parseFloat(price),
                image: product.image,
                quantity: quantity
            });
        }
        this.saveCart();
        this.showToast(`Added ${quantity} ${product.title} to cart`);
    },

    removeFromCart(id) {
        this.state.cart = this.state.cart.filter(item => item.id != id);
        this.saveCart();
    },

    updateQuantity(id, quantity) {
        const item = this.state.cart.find(item => item.id == id);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) this.removeFromCart(id);
            else this.saveCart();
        }
    },

    getCartTotal() {
        return this.state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    clearCart() {
        this.state.cart = [];
        this.saveCart();
    },

    updateCartUI() {
        const count = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.textContent = count;
            badge.classList.toggle('hidden', count === 0);
        }
    },

    // --- Auth System ---
    checkAuth() {
        const session = sessionStorage.getItem('biltone_session');
        if (session) {
            this.state.user = JSON.parse(session);
            this.updateAuthUI();
        }
    },

    async login(email, password) {
        try {
            const user = await window.DB.loginUser(email, password);
            if (user) {
                sessionStorage.setItem('biltone_session', JSON.stringify(user));
                this.state.user = user;
                return true;
            }
            return false;
        } catch (e) {
            alert(e.message || "Login failed");
            return false;
        }
    },

    logout() {
        sessionStorage.removeItem('biltone_session');
        this.state.user = null;
        // Check if we are in admin folder to determine correct path to index (customer home)
        const inAdmin = window.location.pathname.includes('/admin/');
        window.location.href = inAdmin ? '../index.html' : 'index.html';
    },

    updateAuthUI() {
        // Show/Hide Admin links based on auth
        const adminLink = document.getElementById('admin-link');
        if (adminLink && this.state.user) {
            adminLink.href = '#';
            adminLink.textContent = 'Log Out';
            adminLink.onclick = (e) => {
                e.preventDefault();
                this.logout();
            };
        }
    },

    // --- Utilities ---
    formatMoney(amount) {
        if (isNaN(amount) || amount === null || amount === undefined) return 'Contact for Price';
        return 'KES ' + Number(amount).toLocaleString();
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50 animate-bounce';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
