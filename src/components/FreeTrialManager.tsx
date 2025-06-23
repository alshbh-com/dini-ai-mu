
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserIdentifier } from "@/utils/userIdentifier";
import { useToast } from "@/hooks/use-toast";

const FreeTrialManager = () => {
  const { toast } = useToast();

  useEffect(() => {
    checkAndManageFreeTrial();
  }, []);

  const checkAndManageFreeTrial = async () => {
    try {
      const userIdentifier = getUserIdentifier();
      console.log("التحقق من المستخدم:", userIdentifier);
      
      // التحقق من وجود اشتراك نشط أولاً
      const { data: existingSubscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_ip', userIdentifier)
        .eq('is_active', true)
        .maybeSingle();

      if (subscriptionError) {
        console.error("خطأ في التحقق من الاشتراك:", subscriptionError);
        return;
      }

      if (!existingSubscription) {
        console.log("لا يوجد اشتراك - إنشاء تجربة مجانية");
        // إنشاء اشتراك مجاني لمدة 15 يوم للمستخدمين الجدد
        await createFreeTrialSubscription(userIdentifier);
      } else {
        console.log("يوجد اشتراك:", existingSubscription);
        // التحقق من انتهاء فترة التجربة المجانية
        const endDate = new Date(existingSubscription.end_date);
        const now = new Date();
        
        if (now > endDate && existingSubscription.subscription_type === 'free_trial') {
          console.log("انتهت فترة التجربة المجانية");
          // انتهت فترة التجربة المجانية - إلغاء الاشتراك
          await deactivateExpiredSubscription(existingSubscription.id);
        } else if (existingSubscription.subscription_type === 'free_trial') {
          const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          console.log(`التجربة المجانية نشطة - ${daysLeft} يوم متبقي`);
        }
      }
    } catch (error) {
      console.error("خطأ في إدارة فترة التجربة المجانية:", error);
    }
  };

  const createFreeTrialSubscription = async (userId: string) => {
    try {
      console.log("إنشاء تجربة مجانية جديدة للمستخدم:", userId);
      
      // الحصول على جميع المميزات المتميزة
      const { data: features } = await supabase
        .from('subscription_features')
        .select('feature_key')
        .eq('is_premium', true);

      // إنشاء كائن المميزات
      const allFeatures = features?.reduce((acc, feature) => {
        acc[feature.feature_key] = true;
        return acc;
      }, {} as Record<string, boolean>) || {};

      console.log("المميزات المفعلة:", allFeatures);

      // إنشاء اشتراك مجاني لمدة 15 يوم
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 15);

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_ip: userId,
          subscription_type: 'free_trial',
          is_active: true,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          features_enabled: allFeatures,
          activated_by: 'auto_free_trial',
          notes: `تجربة مجانية تلقائية لمدة 15 يوم - تبدأ من ${startDate.toLocaleDateString('ar-EG')} وتنتهي في ${endDate.toLocaleDateString('ar-EG')}`
        })
        .select()
        .single();

      if (error) {
        console.error("خطأ في إنشاء التجربة المجانية:", error);
        return;
      }

      console.log("تم إنشاء التجربة المجانية بنجاح:", data);

      // عرض رسالة ترحيب
      toast({
        title: "🎉 مرحباً بك في اسأل في الدين!",
        description: `تم تفعيل تجربة مجانية لمدة 15 يوم مع جميع المميزات! تنتهي في ${endDate.toLocaleDateString('ar-EG')}`,
        duration: 8000,
      });

      // إعادة تحميل الصفحة لتحديث حالة الاشتراك
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error("خطأ في إنشاء التجربة المجانية:", error);
    }
  };

  const deactivateExpiredSubscription = async (subscriptionId: string) => {
    try {
      console.log("إلغاء تفعيل الاشتراك المنتهي:", subscriptionId);
      
      await supabase
        .from('subscriptions')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
          notes: 'انتهت فترة التجربة المجانية - تم إلغاء التفعيل تلقائياً'
        })
        .eq('id', subscriptionId);

      toast({
        title: "⏰ انتهت فترة التجربة المجانية",
        description: "شكراً لك على استخدام التطبيق! يمكنك الآن المساهمة للاستمرار في الاستفادة من جميع المميزات",
        variant: "destructive",
        duration: 10000
      });

      // إعادة تحميل الصفحة لتحديث حالة الاشتراك
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error("خطأ في إلغاء الاشتراك المنتهي:", error);
    }
  };

  return null; // هذا المكون لا يعرض شيئاً، فقط يدير فترة التجربة المجانية
};

export default FreeTrialManager;
