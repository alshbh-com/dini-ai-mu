
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Loader2, AlertCircle, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionActivationProps {
  onActivationSuccess: () => void;
}

const SubscriptionActivation = ({ onActivationSuccess }: SubscriptionActivationProps) => {
  const [userIdToActivate, setUserIdToActivate] = useState("");
  const [activationPassword, setActivationPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const activateSubscription = async () => {
    if (!userIdToActivate.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال معرف المستخدم",
        variant: "destructive"
      });
      return;
    }

    if (activationPassword !== "01278006248") {
      toast({
        title: "كلمة سر خاطئة",
        description: "كلمة السر المدخلة غير صحيحة. غير مسموح بالتفعيل",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // تحضير جميع المميزات للتفعيل
      const { data: features } = await supabase
        .from('subscription_features')
        .select('feature_key')
        .eq('is_premium', true);

      const allFeatures = features?.reduce((acc, feature) => {
        acc[feature.feature_key] = true;
        return acc;
      }, {} as Record<string, boolean>) || {};

      // إنشاء أو تحديث الاشتراك المدفوع (ليس تجربة مجانية)
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          user_ip: userIdToActivate.trim(),
          subscription_type: 'monthly', // اشتراك مدفوع
          is_active: true,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          features_enabled: allFeatures,
          last_activated: new Date().toISOString(),
          activated_by: 'admin_authorized',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_ip'
        })
        .select()
        .single();

      if (subError) throw subError;

      // تسجيل عملية التفعيل
      const { error: activationError } = await supabase
        .from('subscription_activations')
        .insert({
          user_identifier: userIdToActivate.trim(),
          subscription_id: subscription.id,
          activated_features: allFeatures,
          activated_by: 'admin_authorized',
          notes: `تفعيل اشتراك مدفوع - تم التحقق من كلمة السر - تحويل من تجربة مجانية إلى اشتراك مدفوع`
        });

      if (activationError) throw activationError;

      toast({
        title: "✅ تم التفعيل بنجاح",
        description: `تم تفعيل الاشتراك المدفوع للمستخدم: ${userIdToActivate}`,
      });

      setUserIdToActivate("");
      setActivationPassword("");
      onActivationSuccess();
      
    } catch (error) {
      console.error("خطأ في تفعيل الاشتراك:", error);
      toast({
        title: "خطأ في التفعيل",
        description: "حدث خطأ أثناء تفعيل الاشتراك",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Crown className="w-6 h-6" />
          تفعيل اشتراك مدفوع (محمي)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold">ملاحظة:</p>
                <p>جميع المستخدمين الجدد يحصلون على تجربة مجانية لمدة 15 يوم تلقائياً. هذا التفعيل للاشتراك المدفوع بعد انتهاء التجربة المجانية.</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-start gap-2">
              <Lock className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold">تحذير أمني:</p>
                <p>تفعيل الاشتراك المدفوع يتطلب كلمة سر محددة. غير مسموح للعملاء بالتفعيل الذاتي.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">المميزات التي سيتم تفعيلها:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <Badge variant="secondary" className="justify-start">✅ جميع الـ30 ميزة</Badge>
              <Badge variant="secondary" className="justify-start">⏰ صالح لمدة شهر</Badge>
              <Badge variant="secondary" className="justify-start">🎯 تفعيل فوري</Badge>
              <Badge variant="secondary" className="justify-start">🏆 دخول المسابقات</Badge>
            </div>
          </div>
          
          <div className="space-y-3">
            <Input
              placeholder="أدخل معرف المستخدم المراد تفعيله"
              value={userIdToActivate}
              onChange={(e) => setUserIdToActivate(e.target.value)}
              className="w-full"
            />
            
            <div className="relative">
              <Input
                type="password"
                placeholder="كلمة سر التفعيل المطلوبة"
                value={activationPassword}
                onChange={(e) => setActivationPassword(e.target.value)}
                className="w-full border-red-300 focus:border-red-500"
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
            </div>
            
            <Button 
              onClick={activateSubscription}
              disabled={loading || !userIdToActivate.trim() || !activationPassword}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin ml-1" />
              ) : (
                <CheckCircle className="w-4 h-4 ml-1" />
              )}
              {loading ? "جاري التفعيل..." : "تفعيل الاشتراك المحمي"}
            </Button>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">نظام التجربة المجانية:</p>
                <p>• كل مستخدم جديد يحصل على 15 يوم مجاناً تلقائياً</p>
                <p>• بعد انتهاء الـ15 يوم، يعود للنسخة المجانية المحدودة</p>
                <p>• هذا التفعيل للاشتراك المدفوع الكامل</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionActivation;
