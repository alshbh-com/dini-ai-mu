
-- إنشاء جدول الاشتراكات المدفوعة
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_ip TEXT NOT NULL UNIQUE,
  subscription_type TEXT NOT NULL DEFAULT 'monthly',
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 month'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تمكين Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- إنشاء السياسات للوصول العام للقراءة
CREATE POLICY "Anyone can read subscriptions" ON public.subscriptions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update subscriptions" ON public.subscriptions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete subscriptions" ON public.subscriptions FOR DELETE USING (true);

-- إضافة سياسة للحذف في جدول المفضلة
CREATE POLICY "Anyone can delete favorites" ON public.favorites FOR DELETE USING (true);
