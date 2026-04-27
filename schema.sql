-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table extending auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  address TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  special_discount NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products policies
DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;
CREATE POLICY "Products are viewable by everyone."
  ON public.products FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Admins can insert products." ON public.products;
CREATE POLICY "Admins can insert products."
  ON public.products FOR INSERT
  WITH CHECK ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) );

DROP POLICY IF EXISTS "Admins can update products." ON public.products;
CREATE POLICY "Admins can update products."
  ON public.products FOR UPDATE
  USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) );

DROP POLICY IF EXISTS "Admins can delete products." ON public.products;
CREATE POLICY "Admins can delete products."
  ON public.products FOR DELETE
  USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) );

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'shipped', 'delivered', 'cancelled')),
  payment_proof_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
DROP POLICY IF EXISTS "Users can view their own orders." ON public.orders;
CREATE POLICY "Users can view their own orders."
  ON public.orders FOR SELECT
  USING ( auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) );

DROP POLICY IF EXISTS "Users can insert their own orders." ON public.orders;
CREATE POLICY "Users can insert their own orders."
  ON public.orders FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Admins can update orders." ON public.orders;
CREATE POLICY "Admins can update orders."
  ON public.orders FOR UPDATE
  USING ( EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) );

-- Create order items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Order items policies
DROP POLICY IF EXISTS "Users can view their own order items." ON public.order_items;
CREATE POLICY "Users can view their own order items."
  ON public.order_items FOR SELECT
  USING ( 
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()) 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) 
  );

DROP POLICY IF EXISTS "Users can insert their own order items." ON public.order_items;
CREATE POLICY "Users can insert their own order items."
  ON public.order_items FOR INSERT
  WITH CHECK ( EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()) );

-- Trigger for new user signup to automatically create a profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create admin user function (RPC)
CREATE OR REPLACE FUNCTION public.set_admin(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles SET is_admin = true WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
