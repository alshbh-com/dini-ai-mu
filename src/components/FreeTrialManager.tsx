
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
      
      // التحقق من وجود اشتراك نشط
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_ip', userIdentifier)
        .eq('is_active', true)
        .single();

      if (!existingSubscription) {
        // إنشاء اشتراك مجاني لمدة 15 يوم للمستخدمين الجدد
        await createFreeTrialSubscription(userIdentifier);
      } else {
        // التحقق من انتهاء فترة التجربة المجانية
        const endDate = new Date(existingSubscription.end_date);
        const now = new Date();
        
        if (now > endDate) {
          // انتهت فترة التجربة المجانية - إلغاء الاشتراك
          await deactivateExpiredSubscription(existingSubscription.id);
        }
      }
    } catch (error) {
      console.error("خطأ في إدارة فترة التجربة المجانية:", error);
    }
  };

  const createFreeTrialSubscription = async (userId: string) => {
    try {
      // الحصول على جميع المميزات
      const { data: features } = await supabase
        .from('subscription_features')
        .select('feature_key')
        .eq('is_premium', true);

      const allFeatures = features?.reduce((acc, feature) => {
        acc[feature.feature_key] = true;
        return acc;
      }, {} as Record<string, boolean>) || {};

      // إنشاء اشتراك مجاني لمدة 15 يوم
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 15);

      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_ip: userId,
          subscription_type: 'free_trial',
          is_active: true,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          features_enabled: allFeatures,
          activated_by: 'free_trial_system',
          notes: 'تجربة مجانية لمدة 15 يوم'
        });

      if (!error) {
        toast({
          title: "🎉 مرحباً بك!",
          description: "تم تفعيل تجربة مجانية لمدة 15 يوم مع جميع المميزات",
        });
      }
    } catch (error) {
      console.error("خطأ في إنشاء التجربة المجانية:", error);
    }
  };

  const deactivateExpiredSubscription = async (subscriptionId: string) => {
    try {
      await supabase
        .from('subscriptions')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      toast({
        title: "انتهت فترة التجربة المجانية",
        description: "يمكنك الآن المساهمة للاستمرار في الاستفادة من جميع المميزات",
        variant: "destructive"
      });
    } catch (error) {
      console.error("خطأ في إلغاء الاشتراك المنتهي:", error);
    }
  };

  return null; // هذا المكون لا يعرض شيئاً، فقط يدير فترة التجربة المجانية
};

export default FreeTrialManager;
