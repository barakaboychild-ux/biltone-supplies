-- 1. Enable RLS on all core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- CLEAR EXISTING POLICIES (to prevent duplicates if run twice)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Staff can manage products" ON public.products;
DROP POLICY IF EXISTS "Anyone can create an order" ON public.orders;
DROP POLICY IF EXISTS "Anyone can read an order" ON public.orders;
DROP POLICY IF EXISTS "Staff can update orders" ON public.orders;
DROP POLICY IF EXISTS "Staff can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can submit a message" ON public.messages;
DROP POLICY IF EXISTS "Staff can view messages" ON public.messages;
DROP POLICY IF EXISTS "Staff can update messages" ON public.messages;
DROP POLICY IF EXISTS "Content is viewable by everyone" ON public.content;
DROP POLICY IF EXISTS "Staff can manage content" ON public.content;

-- 2. Profiles: Read public, Write only yourself
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Products: Read public, Write only logged-in staff
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Staff can manage products" ON public.products FOR ALL USING (auth.role() = 'authenticated');

-- 4. Orders: Insert public (checkout) & Select public (tracking), Write only logged-in staff
CREATE POLICY "Anyone can create an order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read an order" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Staff can update orders" ON public.orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can delete orders" ON public.orders FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Messages: Insert public (contact us form), Read/Write only logged-in staff
CREATE POLICY "Anyone can submit a message" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can view messages" ON public.messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update messages" ON public.messages FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. Content: Read public (about us page), Write only logged-in staff
CREATE POLICY "Content is viewable by everyone" ON public.content FOR SELECT USING (true);
CREATE POLICY "Staff can manage content" ON public.content FOR ALL USING (auth.role() = 'authenticated');
