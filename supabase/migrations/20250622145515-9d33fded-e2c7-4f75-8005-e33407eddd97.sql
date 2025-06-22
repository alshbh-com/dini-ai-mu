
-- إنشاء جدول المميزات للمشتركين
CREATE TABLE public.subscription_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT NOT NULL UNIQUE,
  feature_name_ar TEXT NOT NULL,
  feature_description_ar TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إدراج 30 ميزة للمشتركين المميزين
INSERT INTO public.subscription_features (feature_key, feature_name_ar, feature_description_ar, is_premium) VALUES
('unlimited_questions', 'أسئلة غير محدودة', 'إمكانية طرح عدد لا محدود من الأسئلة يومياً', true),
('detailed_answers', 'إجابات مفصلة', 'إجابات شاملة ومفصلة مع الأدلة والمصادر', true),
('voice_support', 'الدعم الصوتي', 'تحويل الإجابات إلى صوت باللغة العربية', true),
('unlimited_favorites', 'مفضلة غير محدودة', 'حفظ عدد لا محدود من الإجابات في المفضلة', true),
('priority_response', 'أولوية في الرد', 'الحصول على إجابات أسرع من المستخدمين العاديين', true),
('prayer_reminders', 'تذكير الصلاة', 'إشعارات تذكير أوقات الصلاة حسب موقعك', true),
('monthly_contests', 'المسابقات الشهرية', 'المشاركة في المسابقات الدينية الشهرية', true),
('exclusive_channel', 'قناة المسابقات الخاصة', 'دخول قناة المسابقات المخصصة للمشتركين فقط', true),
('custom_support', 'دعم فني مخصص', 'دعم فني سريع ومخصص عبر واتساب', true),
('early_features', 'ميزات حصرية جديدة', 'الوصول المبكر للميزات الجديدة قبل الآخرين', true),
('hadith_audio', 'تشغيل الأحاديث صوتياً', 'سماع الأحاديث النبوية بصوت عذب', true),
('quran_recitation', 'تلاوة الآيات', 'تلاوة الآيات القرآنية المذكورة في الإجابات', true),
('bookmark_categories', 'تصنيف المفضلة', 'تنظيم المفضلة في فئات مختلفة', true),
('offline_mode', 'الوضع غير المتصل', 'قراءة الإجابات المحفوظة بدون إنترنت', true),
('advanced_search', 'البحث المتقدم', 'البحث في تاريخ الأسئلة والإجابات', true),
('daily_hadith', 'حديث اليوم', 'حديث نبوي شريف يومي مع الشرح', true),
('islamic_calendar', 'التقويم الإسلامي', 'عرض التواريخ الهجرية والمناسبات الإسلامية', true),
('qibla_direction', 'اتجاه القبلة', 'تحديد اتجاه القبلة من موقعك الحالي', true),
('tasbih_counter', 'عداد التسبيح', 'عداد إلكتروني للتسبيح والذكر', true),
('dua_collections', 'مجموعات الأدعية', 'مجموعة شاملة من الأدعية المستجابة', true),
('scholar_opinions', 'آراء العلماء', 'مقارنة آراء العلماء المختلفين في المسائل الفقهية', true),
('fatwa_history', 'تاريخ الفتاوى', 'الوصول لأرشيف الفتاوى والأحكام الشرعية', true),
('translation_support', 'الترجمة للغات أخرى', 'ترجمة الإجابات للإنجليزية والفرنسية', true),
('weekly_lessons', 'دروس أسبوعية', 'دروس دينية أسبوعية مسجلة صوتياً', true),
('ramadan_features', 'ميزات رمضان', 'أوقات الإفطار والسحور وأدعية رمضان', true),
('hajj_guide', 'دليل الحج والعمرة', 'دليل شامل لأداء مناسك الحج والعمرة', true),
('islamic_stories', 'القصص الإسلامية', 'قصص الأنبياء والصحابة التعليمية', true),
('charity_calculator', 'حاسبة الزكاة', 'حساب زكاة المال والذهب والفضة', true),
('islamic_names', 'معاني الأسماء الإسلامية', 'قاعدة بيانات معاني الأسماء الإسلامية', true),
('community_forum', 'منتدى المجتمع', 'منتدى خاص للمشتركين لمناقشة المواضيع الدينية', true);

-- تحديث جدول الاشتراكات لإضافة المزيد من التفاصيل
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS features_enabled JSONB DEFAULT '{}';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS last_activated TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS activated_by TEXT;

-- إنشاء جدول تفعيل الاشتراكات
CREATE TABLE public.subscription_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier TEXT NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id),
  activated_features JSONB DEFAULT '{}',
  activation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  activated_by TEXT,
  notes TEXT
);

-- فهرس للبحث السريع
CREATE INDEX idx_subscription_activations_user ON public.subscription_activations(user_identifier);
CREATE INDEX idx_subscriptions_user_ip ON public.subscriptions(user_ip);
