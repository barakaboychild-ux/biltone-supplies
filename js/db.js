/**
 * Biltone Supplies - Database Layer
 * Highly resilient Supabase connection and helper functions.
 */

(function() {
    let supabase = null;

    // --- Core Database Object ---
    window.DB = {
        _isInitialized: false,

        async init() {
            if (this._isInitialized && supabase) return;
            
            console.log("DB: Initializing API Connection...");
            try {
                // Wait for Supabase SDK to appear if script is slow
                for (let i = 0; i < 10; i++) {
                    if (window.supabase && window.supabase.createClient) break;
                    await new Promise(r => setTimeout(r, 200));
                }

                if (typeof CONFIG !== 'undefined' && window.supabase && window.supabase.createClient) {
                    supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
                    this._isInitialized = true;
                    console.log("DB: Connected Successfully.");
                } else {
                    console.error("DB: Connection Blocked. CDN scripts or CONFIG might be missing.");
                }
            } catch (e) {
                console.error("DB: SDK Error:", e);
            }
        },

        // Helper to ensure connection before any call
        async ensureReady() {
            if (!this._isInitialized || !supabase) {
                await this.init();
            }
            if (!supabase) throw new Error("Database SDK not loaded. Check internet/CDN scripts.");
        },

        // --- Products ---
        async getProducts() {
            await this.ensureReady();
            const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            
            if (error) {
                console.error("DB: Fetch Products Error:", error);
                throw error;
            }

            // Robust mapping (handles "name" vs "title" automatically)
            return (data || []).map(p => ({
                ...p,
                title: p.title || p.name || 'Untitled Product',
                image: p.image || p.image_url || 'https://placehold.co/400x400?text=No+Image',
                price: parseFloat(p.price) || 0
            }));
        },

        async getProduct(id) {
            await this.ensureReady();
            const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
            if (error) return null;
            return {
                ...data,
                title: data.title || data.name || 'Untitled Product',
                image: data.image || data.image_url || 'https://placehold.co/400x400?text=No+Image',
                price: parseFloat(data.price) || 0
            };
        },

        async saveProduct(product) {
            await this.ensureReady();
            const isNew = !product.id || product.id > 1000000000; // Heuristic for timestamp ID
            let payload = { ...product };
            if (isNew) delete payload.id;

            const { data, error } = await supabase.from('products').upsert(payload).select();
            if (error) throw error;
            return data ? data[0] : null;
        },

        async deleteProduct(id) {
            await this.ensureReady();
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
        },

        // --- Auth ---
        async loginUser(email, password) {
            await this.ensureReady();
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            // Get profile for role
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
            return {
                ...data.user,
                role: profile ? profile.role : 'admin',
                name: profile ? profile.full_name : email.split('@')[0]
            };
        },

        async registerUser(email, password, name) {
            await this.ensureReady();
            const { data, error } = await supabase.auth.signUp({ 
                email, 
                password, 
                options: { data: { full_name: name } } 
            });
            if (error) throw error;
            return data.user;
        },

        // --- Orders ---
        async getOrders() {
            await this.ensureReady();
            const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
            return data || [];
        },

        async getOrder(id) {
            await this.ensureReady();
            const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
            return data;
        },

        async createOrder(orderData) {
            await this.ensureReady();
            const newOrder = {
                id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                status: 'Pending',
                total: orderData.total,
                customer_details: orderData.customer,
                items: orderData.items
            };
            const { data, error } = await supabase.from('orders').insert(newOrder).select();
            if (error) throw error;
            return data[0];
        },

        async updateOrderStatus(id, status) {
            await this.ensureReady();
            const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select();
            if (error) throw error;
            return data ? data[0] : null;
        },

        // --- Content (About Us etc) ---
        async getContent() {
            await this.ensureReady();
            const { data, error } = await supabase.from('content').select('*').eq('key', 'site_content').single();
            return data ? data.value : {};
        },

        async saveContent(content) {
            await this.ensureReady();
            const { error } = await supabase.from('content').upsert({ key: 'site_content', value: content });
            if (error) throw error;
        },

        // --- Messages ---
        async saveMessage(messageData) {
            await this.ensureReady();
            const payload = { ...messageData, status: 'unread' };
            delete payload.id; // Ensure DB generates the ID
            
            const { data, error } = await supabase.from('messages').insert(payload).select();
            if (error) throw error;
            return data[0];
        },

        async getMessages() {
            await this.ensureReady();
            const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },

        async updateMessageStatus(id, status) {
            await this.ensureReady();
            const { data, error } = await supabase.from('messages').update({ status }).eq('id', id).select();
            if (error) throw error;
            return data ? data[0] : null;
        },

        async deleteMessage(id) {
            await this.ensureReady();
            const { error } = await supabase.from('messages').delete().eq('id', id);
            if (error) throw error;
            return true;
        },

        async markMessageRead(id) {
            return this.updateMessageStatus(id, 'read');
        },

        // --- Profiles / User Management ---
        async updateProfile(id, updateData) {
            await this.ensureReady();
            const { data, error } = await supabase.from('profiles').update(updateData).eq('id', id).select();
            if (error) throw error;

            // Also update session if it matches current user
            const session = sessionStorage.getItem('biltone_session');
            if (session) {
                let user = JSON.parse(session);
                if (user.id === id) {
                    if (updateData.full_name) user.name = updateData.full_name;
                    sessionStorage.setItem('biltone_session', JSON.stringify(user));
                }
            }
            return data ? data[0] : null;
        },

        async requestProfileUpdate(email, updateData) {
            await this.ensureReady();
            // Store request for owner approval
            const { error } = await supabase.from('update_requests').insert({
                request_email: email,
                update_payload: updateData,
                status: 'pending'
            });
            if (error) throw error;
            return true;
        },

        // --- Helper: Diagnostics ---
        async checkTables() {
            try {
                const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/`, {
                    headers: { 'apikey': CONFIG.SUPABASE_KEY }
                });
                const data = await res.json();
                const paths = Object.keys(data.paths || {});
                return paths.map(p => p.replace('/', '')).filter(p => p && p !== 'rpc');
            } catch (e) {
                console.error("DB: Diagnostic fetch failed", e);
                return [];
            }
        },

        // --- Helper: File Uploading ---
        async uploadFile(file) {
            await this.ensureReady();
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `about/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('site-assets')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw new Error('Failed to upload image. Please ensure the "site-assets" bucket exists and is public.');
            }

            const { data } = supabase.storage
                .from('site-assets')
                .getPublicUrl(filePath);
                
            return data.publicUrl;
        },

        // --- Helper: Seeding ---

        async seedInitialData() {
            console.log("DB: Seeding Protocol Starting...");
            try {
                await this.ensureReady();
                
                const sampleProducts = [
                    { title: 'Professional Cordless Clipper', price: 5500, category: 'Clippers', stock: 15, image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500' },
                    { title: 'Advanced Hair Trimmer', price: 3800, category: 'Trimmers', stock: 20, image: 'https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?w=500' },
                    { title: 'Luxury Straight Razor', price: 1200, category: 'Razors', stock: 50, image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500' },
                    { title: 'Barber Grooming Cape', price: 850, category: 'Accessories', stock: 100, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500' },
                    { title: 'Precision Scissors', price: 2500, category: 'Scissors', stock: 10, image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=500' }
                ];

                await supabase.from('products').insert(sampleProducts);
                
                const initialContent = {
                    aboutTitle: 'About Biltone Supplies',
                    aboutText: 'We provide premier professional barbering tools, empowering barbers with quality and reliability.',
                    contactEmail: 'support@biltonesupplies.com'
                };
                await supabase.from('content').upsert({ key: 'site_content', value: initialContent });

                console.log("DB: Seeding Complete.");
                alert("Database Seeded Successfully! Refreshing page...");
                location.reload();
                return true;
            } catch (err) {
                console.error("DB: Seeding Failed:", err.message);
                alert("Seeding Failed: " + err.message + "\n\nMake sure your SQL is run in Supabase!");
                return false;
            }
        }
    };

    // Auto-init
    window.DB.init();

})();
