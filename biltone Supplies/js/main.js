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

    addToCart(product, quantity = 1) {
        const existing = this.state.cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            // Check for active offer
            // No longer separate DB call needed if offers are on product object, but for now logic is inside addToCart
            // Let's simplify addToCart to check properties directly
            const price = product.offerPrice && new Date(product.offerExpires) > new Date() ? product.offerPrice : product.price;

            this.state.cart.push({
                id: product.id,
                title: product.title,
                price: product.offerPrice && new Date(product.offerExpires) > new Date() ? product.offerPrice : product.price,
                image: product.image,
                quantity: quantity
            });
        }
        this.saveCart();
        this.showToast(`Added ${quantity} ${product.title} to cart`);
    },

    removeFromCart(id) {
        this.state.cart = this.state.cart.filter(item => item.id !== id);
        this.saveCart();
    },

    updateQuantity(id, quantity) {
        const item = this.state.cart.find(item => item.id === id);
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

    login(email, password) {
        try {
            const user = DB.loginUser(email, password);
            if (user) {
                sessionStorage.setItem('biltone_session', JSON.stringify(user));
                this.state.user = user;
                return true;
            }
            return false;
        } catch (e) {
            alert(e.message);
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
        return 'KES ' + amount.toLocaleString();
    },

    showToast(message) {
        // Simple alert for now, can be upgraded to a custom toast
        // alert(message); 
        // Or create a temporary DOM element
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
