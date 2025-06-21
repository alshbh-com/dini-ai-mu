import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Settings2, Smartphone, Database, Trash2, Code, MessageCircle, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [userID, setUserID] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    checkSubscriptionStatus();
    loadFavoritesCount();
    setUserID(localStorage.getItem('userID') || 'جاري التحميل...');
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

  const loadFavoritesCount = async () => {
    try {
      const userIP = await getUserIP();
      const { count } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_ip', userIP);

      setFavoritesCount(count || 0);
    } catch (error) {
      console.error("Error loading favorites count:", error);
    }
  };

  const clearFavorites = async () => {
    try {
      const userIP = await getUserIP();
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_ip', userIP);

      if (error) {
        console.error("Error clearing favorites:", error);
        toast({
          title: "Error",
          description: "Failed to clear favorites.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "تم",
          description: "تم مسح جميع الأسئلة المحفوظة.",
        });
        loadFavoritesCount();
      }
    } catch (error) {
      console.error("Error clearing favorites:", error);
      toast({
        title: "Error",
        description: "Failed to clear favorites.",
        variant: "destructive"
      });
    }
  };

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
            <Settings2 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
            <h1 className="text-2xl sm:text-3xl font-bold font-amiri text-slate-800">الإعدادات</h1>
          </div>
        </div>

        {/* Account Status */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-amiri text-slate-800">حالة الحساب</h3>
              {subscription ? (
                <Badge className="bg-indigo-600 text-white">
                  <Crown className="w-3 h-3 ml-1" />
                  مساهم
                </Badge>
              ) : (
                <Badge variant="secondary">مجاني</Badge>
              )}
            </div>
            
            <div className="grid gap-4 text-sm">
              <div className="flex justify-between items-center">
                <span>معرف المستخدم:</span>
                <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{userID}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>نوع الحساب:</span>
                <span>{subscription ? 'مساهم شهري' : 'مجاني'}</span>
              </div>
              {subscription && (
                <>
                  <div className="flex justify-between items-center">
                    <span>تاريخ انتهاء المساهمة:</span>
                    <span>{new Date(subscription.end_date).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>الميزات المتاحة:</span>
                    <span>جميع الميزات المتقدمة</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Smartphone className="w-6 h-6 text-blue-600" />
              إعدادات التطبيق
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800">الإشعارات</h4>
                <p className="text-sm text-slate-600">تفعيل إشعارات التذكير</p>
              </div>
              <Button variant="outline" size="sm">
                تفعيل
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800">حفظ الأسئلة</h4>
                <p className="text-sm text-slate-600">حفظ الأسئلة تلقائياً في المفضلة</p>
              </div>
              <Button variant="outline" size="sm">
                إعداد
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800">جودة الصوت</h4>
                <p className="text-sm text-slate-600">اختيار جودة التشغيل الصوتي</p>
              </div>
              <Button variant="outline" size="sm">
                متوسط
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Database className="w-6 h-6 text-green-600" />
              إدارة البيانات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800">عدد الأسئلة المحفوظة</h4>
                <p className="text-sm text-slate-600">{favoritesCount} سؤال في المفضلة</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearFavorites}
                disabled={favoritesCount === 0}
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 ml-1" />
                مسح الكل
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800">إعادة تعيين التطبيق</h4>
                <p className="text-sm text-slate-600">مسح جميع البيانات والعودة للإعدادات الافتراضية</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                إعادة تعيين
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Developer Info */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Code className="w-6 h-6 text-blue-600" />
              معلومات المطور
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-semibold">اسم المطور:</span>
                <span>محمد عبد العظيم علي</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">الشركة المصنعة:</span>
                <span>alshbh</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">العمر:</span>
                <span>19 عام</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">الجنسية:</span>
                <span>مصري 🇪🇬</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">رقم التواصل:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://wa.me/201204486263', '_blank')}
                  className="border-green-500 text-green-600 hover:bg-green-50"
                >
                  <MessageCircle className="w-3 h-3 ml-1" />
                  +20 120 448 6263
                </Button>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 text-center">
                "جعل الله هذا التطبيق في ميزان حسنات المطور والمساهمين"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-6">
              <h3 className="font-amiri text-lg text-slate-800 mb-2">
                مُعينك الديني - تطبيق الفتاوى الإسلامية
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                نسأل الله أن يجعل هذا العمل خالصاً لوجهه الكريم
              </p>
              <p className="font-amiri text-indigo-700">
                "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا"
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
