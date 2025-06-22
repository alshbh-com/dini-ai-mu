import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Settings as SettingsIcon, Bell, Palette, Shield, Info, Trash2, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoShare: false,
    language: 'ar'
  });
  const [subscription, setSubscription] = useState<any>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userIdentifier, setUserIdentifier] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  const getUserIdentifier = () => {
    const stored = localStorage.getItem('user_identifier');
    if (stored) {
      return stored;
    }
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const identifier = `user_${timestamp}_${random}`;
    localStorage.setItem('user_identifier', identifier);
    return identifier;
  };

  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'anonymous';
    }
  };

  const loadUserData = async () => {
    try {
      const userId = getUserIdentifier();
      setUserIdentifier(userId);
      
      // تحميل حالة الاشتراك
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .single();

      setSubscription(subData);

      // تحميل عدد المفضلة
      const { count } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      setFavoritesCount(count || 0);

      // تحميل الإعدادات المحفوظة من localStorage
      const savedSettings = localStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
    toast({
      title: "تم الحفظ",
      description: "تم حفظ الإعدادات بنجاح"
    });
  };

  const clearAllFavorites = async () => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userIdentifier);

      if (error) throw error;

      setFavoritesCount(0);
      toast({
        title: "تم الحذف",
        description: "تم حذف جميع المفضلة بنجاح"
      });
    } catch (error) {
      console.error("Error clearing favorites:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف المفضلة",
        variant: "destructive"
      });
    }
  };

  const clearAppData = () => {
    localStorage.clear();
    setSettings({
      notifications: true,
      darkMode: false,
      autoShare: false,
      language: 'ar'
    });
    toast({
      title: "تم المسح",
      description: "تم مسح جميع بيانات التطبيق"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-6">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm" className="border-indigo-400 text-indigo-600 hover:bg-indigo-50">
              <ArrowRight className="w-4 h-4 ml-1" />
              العودة للرئيسية
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-700" />
            <h1 className="text-2xl sm:text-3xl font-bold font-amiri text-slate-800">الإعدادات</h1>
          </div>
        </div>

        {/* User ID Display */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Info className="w-5 h-5 text-blue-600" />
              معرف المستخدم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-3 rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">معرف المستخدم الخاص بك:</p>
              <p className="font-mono text-xs text-gray-800 break-all">{userIdentifier}</p>
              <p className="text-xs text-gray-500 mt-2">
                استخدم هذا المعرف عند التواصل مع الدعم لتفعيل الاشتراك
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Shield className="w-5 h-5 text-indigo-600" />
              حالة الحساب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">نوع الاشتراك</span>
              <Badge className={subscription ? "bg-green-600 text-white" : "bg-gray-500 text-white"}>
                {subscription ? "مميز" : "مجاني"}
              </Badge>
            </div>
            {subscription && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-700">انتهاء الاشتراك</span>
                <span className="text-sm font-medium text-slate-800">
                  {new Date(subscription.end_date).toLocaleDateString('ar-SA')}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">عدد المفضلة</span>
              <Badge variant="outline" className="border-blue-500 text-blue-600">
                {favoritesCount}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">الحد اليومي</span>
              <Badge variant="outline" className={subscription ? "border-green-500 text-green-600" : "border-orange-500 text-orange-600"}>
                {subscription ? "غير محدود" : "10 أسئلة"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700">حد المفضلة</span>
              <Badge variant="outline" className={subscription ? "border-green-500 text-green-600" : "border-orange-500 text-orange-600"}>
                {subscription ? "غير محدود" : "20 عنصر"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Bell className="w-5 h-5 text-blue-600" />
              إعدادات التطبيق
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium text-slate-800">الإشعارات</h4>
                <p className="text-xs text-slate-600">تفعيل إشعارات التطبيق</p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, notifications: checked }))
                }
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium text-slate-800">الوضع الليلي</h4>
                <p className="text-xs text-slate-600">تفعيل الثيم الداكن</p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, darkMode: checked }))
                }
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium text-slate-800">المشاركة التلقائية</h4>
                <p className="text-xs text-slate-600">مشاركة الإجابات تلقائياً</p>
              </div>
              <Switch
                checked={settings.autoShare}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, autoShare: checked }))
                }
              />
            </div>

            <Button onClick={saveSettings} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="w-4 h-4 ml-2" />
              حفظ الإعدادات
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Trash2 className="w-5 h-5 text-red-600" />
              إدارة البيانات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">تنبيه</h4>
              <p className="text-xs text-yellow-700">
                هذه العمليات لا يمكن التراجع عنها. تأكد من رغبتك في المتابعة.
              </p>
            </div>

            <Button
              onClick={clearAllFavorites}
              variant="outline"
              className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
              disabled={favoritesCount === 0}
            >
              <Trash2 className="w-4 h-4 ml-2" />
              حذف جميع المفضلة ({favoritesCount})
            </Button>

            <Button
              onClick={clearAppData}
              variant="outline"
              className="w-full border-red-500 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              مسح جميع بيانات التطبيق
            </Button>
          </CardContent>
        </Card>

        {/* Developer Info */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Info className="w-5 h-5 text-blue-600" />
              معلومات المطور
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">المطور</span>
              <span className="font-medium text-slate-800">محمد عبد العظيم علي</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">الجنسية</span>
              <span className="font-medium text-slate-800">مصري</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">العمر</span>
              <span className="font-medium text-slate-800">19 عام</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">الشركة</span>
              <span className="font-medium text-slate-800">الشبه</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">واتساب</span>
              <span className="font-medium text-slate-800">+201204486263</span>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Info className="w-5 h-5 text-slate-600" />
              معلومات التطبيق
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">اسم التطبيق</span>
              <span className="font-medium text-slate-800">مُعينك الديني</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">الإصدار</span>
              <span className="font-medium text-slate-800">2.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">آخر تحديث</span>
              <span className="font-medium text-slate-800">ديسمبر 2024</span>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 mb-4 text-sm">
            هل تحتاج مساعدة؟ تواصل معنا
          </p>
          <Button 
            onClick={() => {
              const phoneNumber = "201204486263";
              const message = `السلام عليكم، أحتاج مساعدة في تطبيق مُعينك الديني\nمعرف المستخدم: ${userIdentifier}`;
              const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
              window.open(whatsappURL, '_blank');
            }}
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-50"
          >
            تواصل عبر واتساب
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
