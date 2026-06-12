-- ====================================================================
-- STAX BURGER CO. - SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor (https://supabase.com/)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- in INR (e.g. 229)
    image TEXT NOT NULL,
    category TEXT NOT NULL, -- signature, chicken, veg, sides, drinks
    veg_type TEXT DEFAULT 'veg', -- veg, non-veg
    availability BOOLEAN DEFAULT true,
    rating NUMERIC(3, 2) DEFAULT 4.5,
    reviews TEXT DEFAULT '0',
    tag TEXT,
    is_new BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PROFILES TABLE (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Alter table to add role if it doesn't exist for upgrade compatibility
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin'));
    END IF;
END $$;

-- 4. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    full_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL, -- Generated automatically (e.g. STX-000001)
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable for guest checkouts
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    subtotal INTEGER NOT NULL,
    tax INTEGER NOT NULL,
    total INTEGER NOT NULL,
    status TEXT DEFAULT 'Received', -- Received, Preparing, Cooking, Out for Delivery, Delivered
    estimated_time TEXT DEFAULT '30 mins',
    payment_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    product_image TEXT
);

-- ====================================================================
-- AUTOMATIONS & TRIGGERS
-- ====================================================================

-- A. Auto-Generate Sequential Order Numbers (STX-000001, STX-000002, etc.)
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;

CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'STX-' || LPAD(nextval('public.order_number_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_order_number();


-- B. Auto-Create Profile on Supabase User Signup (With Role Determination)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Valued Customer'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        CASE 
            WHEN NEW.email LIKE '%@stax.com' OR NEW.email LIKE '%admin%' THEN 'admin'
            ELSE 'customer'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();


-- C. Prevent Self-Escalation of Roles
CREATE OR REPLACE FUNCTION public.check_profile_role_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role AND NOT (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    ) THEN
        NEW.role := OLD.role;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_check_profile_role_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_profile_role_update();


-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Products Policies
CREATE POLICY "Allow public read access to products" 
ON public.products FOR SELECT USING (true);

CREATE POLICY "Allow admin write access to products" 
ON public.products FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() 
        AND public.profiles.role = 'admin'
    )
);

-- Profiles Policies
CREATE POLICY "Allow users to read their own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Addresses Policies
CREATE POLICY "Allow users to manage their own addresses" 
ON public.addresses FOR ALL USING (auth.uid() = profile_id);

-- Orders Policies
CREATE POLICY "Allow users to read their own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = profile_id OR email = auth.jwt() ->> 'email');

CREATE POLICY "Allow public order creation" 
ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin full access to orders" 
ON public.orders FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() 
        AND public.profiles.role = 'admin'
    )
);

-- Order Items Policies
CREATE POLICY "Allow users to read their own order items" 
ON public.order_items FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE public.orders.id = public.order_items.order_id 
        AND (public.orders.profile_id = auth.uid() OR public.orders.email = auth.jwt() ->> 'email')
    )
);

CREATE POLICY "Allow public order item creation" 
ON public.order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin full access to order items" 
ON public.order_items FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE public.profiles.id = auth.uid() 
        AND public.profiles.role = 'admin'
    )
);


-- ====================================================================
-- SEED DATA: 16 SIGNATURE PRODUCTS
-- ====================================================================
INSERT INTO public.products (id, name, description, price, image, category, veg_type, availability, rating, reviews, tag, is_new)
VALUES
  (1, 'The Classic Stack', 'Single premium flame-crafted patty topped with signature stack sauce, fresh leaf lettuce, ripe tomatoes, onions, and sweet dill pickles on a toasted bun.', 229, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop', 'signature', 'non-veg', true, 4.80, '1.2k', 'Signature', false),
  (2, 'Double Flame Stack', 'Two flame-crafted patties, double melted cheddar, crispy onion strings, and signature stack sauce.', 289, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800&auto=format&fit=crop', 'signature', 'non-veg', true, 4.90, '2.1k', 'Flame Crafted', true),
  (3, 'Truffle Melt Stack', 'Single premium flame-crafted patty topped with sautéed wild mushrooms, Swiss cheese, and truffle aioli.', 349, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=800&auto=format&fit=crop', 'signature', 'non-veg', true, 4.90, '1.4k', 'Elite', true),
  (4, 'Smoky BBQ Stack', 'Flame-crafted patty, smoked cheddar, crispy bacon, caramelized onions, and house-made BBQ sauce.', 299, 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop', 'signature', 'non-veg', true, 4.70, '820', 'Classic BBQ', false),
  (5, 'Firehouse Chicken Stack', 'Spicy hand-breaded chicken breast, melted pepper jack cheese, jalapeños, and fiery chipotle mayo.', 249, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=800&auto=format&fit=crop', 'chicken', 'non-veg', true, 4.80, '1.1k', 'Fiery Chicken', false),
  (6, 'Smoky BBQ Chicken Stack', 'Crispy chicken breast tossed in smoky BBQ sauce, topped with creamy slaw and pickles.', 239, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=800&auto=format&fit=crop', 'chicken', 'non-veg', true, 4.60, '630', 'Smoky BBQ', false),
  (7, 'Crispy Chicken Stack', 'Hand-breaded golden chicken breast with fresh lettuce, tomatoes, and garlic aioli.', 199, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=800&auto=format&fit=crop', 'chicken', 'non-veg', true, 4.70, '950', 'Crispy Chicken', false),
  (8, 'Kimchi Fire Stack', 'Crispy plant-based patty glazed in sweet & spicy Korean Kimchi sauce with sesame slaw and fresh scallions.', 219, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop', 'veg', 'veg', true, 4.80, '1.2k', 'Korean Flame', true),
  (9, 'Cheese Overload Stack', 'Molten cheese lava patty, topped with garlic butter mushrooms, lettuce, and truffle mayo.', 259, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800&auto=format&fit=crop', 'veg', 'veg', true, 4.90, '980', 'Cheese Melt', true),
  (10, 'Crispy Veg Stack', 'Crispy golden vegetable patty loaded with fresh tomatoes, leaf lettuce, and herb dressing.', 169, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=800&auto=format&fit=crop', 'veg', 'veg', true, 4.60, '1.4k', 'Crispy Veg', false),
  (11, 'STAX Fries', 'Thick-cut golden sea salt fries, crispy on the outside, fluffy on the inside.', 109, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=800&auto=format&fit=crop', 'sides', 'veg', true, 4.70, '3k', 'Sides', false),
  (12, 'STAX Onion Rings', 'Crispy hand-battered jumbo onion rings served with signature dipping sauce.', 129, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800&auto=format&fit=crop', 'sides', 'veg', true, 4.80, '1.9k', 'Sides', false),
  (13, 'Peri Peri Bites', 'Spicy melted cheese and jalapeño bites coated in crispy breadcrumbs.', 149, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=800&auto=format&fit=crop', 'sides', 'veg', true, 4.70, '820', 'Sides', false),
  (14, 'Cold Cola', 'Chilled and carbonated sparkling soda, the perfect refreshing pairing to complement your sizzling flame-crafted burger.', 99, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop', 'drinks', 'veg', true, 4.90, '3k', 'Chilled Can', false),
  (15, 'Iced Hibiscus Tea', 'Sweet and chilled freshly brewed hibiscus tea infused with real citrus lemon juice for ultimate refreshment.', 119, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop', 'drinks', 'veg', true, 4.70, '1.2k', 'Real Brewed', false),
  (16, 'STAX Brew Coffee', 'Rich, creamy iced coffee brewed from double-roasted Arabica beans, sweet milk, and served ice cold with chocolate hints.', 149, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop', 'drinks', 'veg', true, 4.80, '1.9k', 'Brewed', false)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, 
    description = EXCLUDED.description, 
    price = EXCLUDED.price, 
    image = EXCLUDED.image, 
    category = EXCLUDED.category, 
    veg_type = EXCLUDED.veg_type,
    availability = EXCLUDED.availability;

-- Adjust the product id serial sequence to start after the seeded items
SELECT setval('products_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.products), 1), false);
