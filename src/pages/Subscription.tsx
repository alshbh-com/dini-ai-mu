import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Crown, Check, MessageCircle, Heart, Star, Loader2, Gift, Award, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getUserIdentifier } from "@/utils/userIdentifier";
import PremiumFeaturesList from "@/components/PremiumFeaturesList";
import SubscriptionActivation from "@/components/SubscriptionActivation";

const Subscription = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userIdentifier, setUserIdentifier] = useState("");
  const [showActivationPanel, setShowActivationPanel] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const userId = getUserIdentifier();
    setUserIdentifier(userId);
    checkSubscriptionStatus(userId);
  }, []);

  const checkSubscriptionStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_ip', userId)
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
    const message = `السلام عليكم، أريد الاشتراك في تطبيق مُعينك الديني والحصول على جميع المميزات الـ30 بمساهمة شهرية 2$\n\nمعرف المستخدم: ${userIdentifier}`;
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  const features = {
    free: [
      "10 أسئلة يومياً",
      "إجابات من القرآن والسنة", 
      "حفظ 20 سؤال في المفضلة",
      "مشاركة الإجابات",
      "دعم فني أساسي",
      "تحديثات التطبيق",
      "واجهة سهلة الاستخدام"
    ],
    premiumSummary: [
      "أسئلة غير محدودة",
      "إجابات مفصلة مع المصادر",
      "حفظ غير محدود في المفضلة",
      "دعم صوتي للإجابات",
      "أولوية في الرد",
      "إشعارات تذكير الصلاة",
      "المشاركة في المسابقات الشهرية",
      "دخول قناة المسابقات الخاصة",
      "دعم فني مخصص",
      "و 21 ميزة إضافية حصرية..."
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
            <h1 className="text-2xl sm:text-3xl font-bold font-amiri text-slate-800">خطط المساهمة</h1>
          </div>
          <Button
            onClick={() => setShowActivationPanel(!showActivationPanel)}
            variant="outline"
            size="sm"
            className="ml-auto border-purple-400 text-purple-600 hover:bg-purple-50"
          >
            <Settings className="w-4 h-4 ml-1" />
            تفعيل اشتراك
          </Button>
        </div>

        {/* Admin Activation Panel */}
        {showActivationPanel && (
          <div className="mb-8">
            <SubscriptionActivation 
              onActivationSuccess={() => {
                setShowActivationPanel(false);
                checkSubscriptionStatus(userIdentifier);
              }} 
            />
          </div>
        )}

        {/* User ID Display */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 mb-2">معرف المستخدم للاشتراك:</p>
              <p className="font-mono text-sm text-blue-800 break-all">{userIdentifier}</p>
              <p className="text-xs text-blue-600 mt-2">
                أرسل هذا المعرف عبر واتساب لتفعيل اشتراكك بمساهمة شهرية 2$
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="mb-8 bg-green-50 border-2 border-green-200">
          <CardContent className="p-6 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-amiri text-green-800 mb-4">نية التطبيق والهدف منه</h3>
            <div className="text-right space-y-3 text-green-700">
              <p className="text-sm leading-relaxed">
                🕌 <strong>الهدف الأساسي:</strong> نشر العلم الشرعي وكسب الحسنات والأجر من الله عز وجل
              </p>
              <p className="text-sm leading-relaxed">
                💚 <strong>المساهمة المالية:</strong> فقط 2$ شهرياً للمساعدة في تغطية تكاليف الخادم والـ API وتطوير التطبيق
              </p>
              <p className="text-sm leading-relaxed">
                🎁 <strong>المسابقات الشهرية:</strong> للمساهمين فقط كنوع من التشجيع والتقدير
              </p>
              <p className="text-sm leading-relaxed font-semibold">
                ﴿وَمَن يُشَاقِقِ الرَّسُولَ مِن بَعْدِ مَا تَبَيَّنَ لَهُ الْهُدَىٰ وَيَتَّبِعْ غَيْرَ سَبِيلِ الْمُؤْمِنِينَ نُوَلِّهِ مَا تَوَلَّىٰ وَنُصْلِهِ جَهَنَّمَ ۖ وَساءَتْ مَصِيرًا﴾
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Current Subscription Status */}
        {subscription && (
          <Card className="mb-8 bg-purple-50 border-purple-200">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-xl font-amiri text-purple-800 mb-2">مساهمتك نشطة!</h3>
              <p className="text-purple-700 mb-4">
                انتهاء المساهمة: {new Date(subscription.end_date).toLocaleDateString('ar-SA')}
              </p>
              <div className="flex gap-2 justify-center flex-wrap">
                <Badge className="bg-purple-600 text-white">
                  {subscription.subscription_type === 'monthly' ? 'شهري' : 'سنوي'}
                </Badge>
                <Badge className="bg-green-600 text-white">
                  <Gift className="w-3 h-3 ml-1" />
                  جميع المميزات مفعلة
                </Badge>
                <Badge className="bg-blue-600 text-white">
                  <Award className="w-3 h-3 ml-1" />
                  مؤهل للمسابقات
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Free Plan */}
          <Card className="relative shadow-lg border-2 border-gray-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl sm:text-2xl font-amiri text-slate-800 flex items-center justify-center gap-2">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                الاستخدام المجاني
              </CardTitle>
              <div className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">
                مجاناً
              </div>
              <p className="text-slate-600 text-sm">للجميع (بعد انتهاء التجربة المجانية)</p>
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
                {subscription ? "مفعلة مع المساهمة" : "الخطة الحالية"}
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative shadow-xl border-2 border-indigo-500 bg-gradient-to-br from-white to-indigo-50 bg-white/80 backdrop-blur-sm">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-indigo-600 text-white px-4 py-1 text-sm font-semibold">
                <Award className="w-3 h-3 ml-1" />
                30 ميزة حصرية
              </Badge>
            </div>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl sm:text-2xl font-amiri text-slate-800 flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                المساهمة الشهرية
              </CardTitle>
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mt-2">
                2$ شهرياً
              </div>
              <p className="text-slate-600 text-sm">30 ميزة حصرية ومتقدمة</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {features.premiumSummary.map((feature, index) => (
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
                {subscription ? "مساهم بالفعل" : "ساهم ب 2$ عبر واتساب"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Features List */}
        <div className="mb-8">
          <PremiumFeaturesList isSubscribed={!!subscription} />
        </div>

        {/* Monthly Contests Info */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Gift className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-lg sm:text-xl font-amiri text-slate-800 mb-4">
                المسابقات الشهرية للمساهمين (2$ شهرياً)
              </h3>
              <div className="grid gap-4 text-right">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-purple-800 mb-2 text-sm">📚 مسابقات دينية شهرية</h4>
                  <p className="text-xs text-purple-700">
                    مسابقات في القرآن والسنة والفقه مع جوائز قيمة للفائزين
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-purple-800 mb-2 text-sm">🏆 جوائز شهرية</h4>
                  <p className="text-xs text-purple-700">
                    جوائز نقدية وهدايا للمتسابقين المتميزين كل شهر
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-purple-800 mb-2 text-sm">💬 قناة خاصة</h4>
                  <p className="text-xs text-purple-700">
                    دخول قناة المسابقات الخاصة للمساهمين فقط
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-8">
          <Card className="bg-indigo-50 border-indigo-200 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Star className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-indigo-600" />
              <h3 className="text-lg sm:text-xl font-amiri text-slate-800 mb-4">
                لماذا المساهمة بـ 2$ شهرياً؟
              </h3>
              <div className="grid gap-4 sm:gap-6 text-right">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-slate-800 mb-2 text-sm">💰 تكاليف الخادم:</h4>
                    <p className="text-xs text-slate-600">
                      المساعدة في دفع تكاليف الاستضافة وقواعد البيانات
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-slate-800 mb-2 text-sm">🤖 تكاليف الذكاء الاصطناعي:</h4>
                    <p className="text-xs text-slate-600">
                      دفع رسوم API للحصول على إجابات دقيقة وموثوقة
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-slate-800 mb-2 text-sm">⚡ تطوير التطبيق:</h4>
                    <p className="text-xs text-slate-600">
                      إضافة ميزات جديدة وتحسين الأداء باستمرار
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-slate-800 mb-2 text-sm">🎯 الاستدامة:</h4>
                    <p className="text-xs text-slate-600">
                      ضمان استمرارية الخدمة وتوفيرها مجاناً للآخرين
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
            للمساهمة بـ 2$ شهرياً أو الاستفسار عن المسابقات، تواصل معنا عبر واتساب
          </p>
          <div className="space-y-2">
            <Button 
              onClick={contactWhatsApp}
              variant="outline"
              className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
            >
              <MessageCircle className="w-4 h-4 ml-2" />
              +20 120 448 6263
            </Button>
            <p className="text-xs text-slate-500">
              تطوير: محمد عبد العظيم علي - الشبه
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
