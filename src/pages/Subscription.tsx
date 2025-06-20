
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Crown, Check, MessageCircle, Heart, Star, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Subscription = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'anonymous';
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const userIP = await getUserIP();
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_ip', userIP)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error checking subscription:", error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const contactWhatsApp = () => {
    const phoneNumber = "201204486263";
    const message = "السلام عليكم، أريد الاشتراك في تطبيق مُعينك الديني";
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  const features = {
    free: [
      "5 أسئلة يومياً",
      "إجابات من القرآن والسنة", 
      "حفظ 10 أسئلة في المفضلة",
      "مشاركة الإجابات"
    ],
    premium: [
      "أسئلة غير محدودة",
      "إجابات مفصلة مع المصادر",
      "حفظ غير محدود في المفضلة",
      "دعم صوتي للإجابات",
      "أولوية في الرد",
      "إشعارات تذكير الصلاة",
      "تحديثات مجانية مدى الحياة",
      "دعم فني مخصص"
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-slate-600">جاري التحقق من حالة الاشتراك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm" className="border-indigo-400 text-indigo-600 hover:bg-indigo-50">
              <ArrowRight className="w-4 h-4 ml-1" />
              العودة للرئيسية
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
            <h1 className="text-2xl sm:text-3xl font-bold font-amiri text-slate-800">خطط الاشتراك</h1>
          </div>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <Card className="mb-8 bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-amiri text-green-800 mb-2">اشتراكك نشط!</h3>
              <p className="text-green-700 mb-4">
                انتهاء الاشتراك: {new Date(subscription.end_date).toLocaleDateString('ar-SA')}
              </p>
              <Badge className="bg-green-600 text-white">
                {subscription.subscription_type === 'monthly' ? 'شهري' : 'سنوي'}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Free Plan */}
          <Card className="relative shadow-lg border-2 border-gray-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl sm:text-2xl font-amiri text-slate-800 flex items-center justify-center gap-2">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                الخطة المجانية
              </CardTitle>
              <div className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">
                مجاناً
              </div>
              <p className="text-slate-600 text-sm">للاستخدام الأساسي</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {features.free.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-gray-500 hover:bg-gray-600 text-white"
                disabled
              >
                {subscription ? "مفعلة مع البريميوم" : "الخطة الحالية"}
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative shadow-xl border-2 border-indigo-500 bg-gradient-to-br from-white to-indigo-50 bg-white/80 backdrop-blur-sm">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-indigo-600 text-white px-4 py-1 text-sm font-semibold">
                الأكثر شعبية
              </Badge>
            </div>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl sm:text-2xl font-amiri text-slate-800 flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                الخطة المميزة
              </CardTitle>
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mt-2">
                شهرياً
              </div>
              <p className="text-slate-600 text-sm">للاستخدام المكثف</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {features.premium.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={contactWhatsApp}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3"
                disabled={subscription}
              >
                <MessageCircle className="w-4 h-4 ml-2" />
                {subscription ? "مشترك بالفعل" : "اشترك عبر واتساب"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-12">
          <Card className="bg-indigo-50 border-indigo-200 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Star className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-indigo-600" />
              <h3 className="text-lg sm:text-xl font-amiri text-slate-800 mb-4">
                لماذا تختار الخطة المميزة؟
              </h3>
              <div className="grid gap-4 sm:gap-6 text-right">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-slate-800 mb-2 text-sm">للطلاب والباحثين:</h4>
                    <p className="text-xs text-slate-600">
                      أسئلة غير محدودة لدراسة العلوم الشرعية والبحث في المسائل الفقهية
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-slate-800 mb-2 text-sm">للمربين والدعاة:</h4>
                    <p className="text-xs text-slate-600">
                      إجابات شاملة ومصادر موثقة لتحضير الدروس والخطب
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-slate-800 mb-2 text-sm">للعائلات:</h4>
                    <p className="text-xs text-slate-600">
                      تربية الأطفال على القيم الإسلامية بإجابات واضحة ومفهومة
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-slate-800 mb-2 text-sm">لعموم المسلمين:</h4>
                    <p className="text-xs text-slate-600">
                      فهم أعمق للدين وحلول للمشاكل الحياتية وفق الشريعة الإسلامية
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 mb-4 text-sm">
            للاستفسارات أو المساعدة في الاشتراك، تواصل معنا عبر واتساب
          </p>
          <Button 
            onClick={contactWhatsApp}
            variant="outline"
            className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
          >
            <MessageCircle className="w-4 h-4 ml-2" />
            +20 120 448 6263
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
