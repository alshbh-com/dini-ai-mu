
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionActivationProps {
  onActivationSuccess: () => void;
}

const SubscriptionActivation = ({ onActivationSuccess }: SubscriptionActivationProps) => {
  const [userIdToActivate, setUserIdToActivate] = useState("");
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

      // إنشاء أو تحديث الاشتراك
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          user_ip: userIdToActivate.trim(),
          subscription_type: 'monthly',
          is_active: true,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          features_enabled: allFeatures,
          last_activated: new Date().toISOString(),
          activated_by: 'admin',
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
          activated_by: 'admin',
          notes: 'تفعيل جميع المميزات الـ30 للمشترك'
        });

      if (activationError) throw activationError;

      toast({
        title: "✅ تم التفعيل بنجاح",
        description: `تم تفعيل جميع المميزات الـ30 للمستخدم: ${userIdToActivate}`,
      });

      setUserIdToActivate("");
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
          تفعيل اشتراك مميز
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">المميزات التي سيتم تفعيلها:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <Badge variant="secondary" className="justify-start">✅ جميع الـ30 ميزة</Badge>
              <Badge variant="secondary" className="justify-start">⏰ صالح لمدة شهر</Badge>
              <Badge variant="secondary" className="justify-start">🎯 تفعيل فوري</Badge>
              <Badge variant="secondary" className="justify-start">🏆 دخول المسابقات</Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="أدخل معرف المستخدم المراد تفعيله"
              value={userIdToActivate}
              onChange={(e) => setUserIdToActivate(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={activateSubscription}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin ml-1" />
              ) : (
                <CheckCircle className="w-4 h-4 ml-1" />
              )}
              {loading ? "جاري التفعيل..." : "تفعيل الاشتراك"}
            </Button>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">ملاحظة هامة:</p>
                <p>عند التفعيل، سيحصل المستخدم على جميع المميزات الـ30 المدرجة أدناه فوراً.</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionActivation;
