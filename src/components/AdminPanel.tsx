import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, MessageSquare, TrendingUp, Eye, EyeOff, X, Trash2, Plus, Crown, Star, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalFavorites: 0,
    dailyUsers: 0,
    activeSubscriptions: 0,
    totalFeatures: 0
  });
  const [questions, setQuestions] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [newSubscriptionIP, setNewSubscriptionIP] = useState("");
  const [activationPassword, setActivationPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const authStatus = sessionStorage.getItem("adminAuth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      loadAdminData();
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'admin_password')
        .single();

      if (data && password === data.setting_value) {
        setIsAuthenticated(true);
        sessionStorage.setItem("adminAuth", "true");
        loadAdminData();
        toast({
          title: "تم تسجيل الدخول",
          description: "مرحباً بك في لوحة التحكم"
        });
      } else {
        toast({
          title: "خطأ في كلمة المرور",
          description: "كلمة المرور غير صحيحة",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تسجيل الدخول",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const loadAdminData = async () => {
    try {
      // Load questions count
      const { count: questionsCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

      // Load favorites count
      const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true });

      // Load features count
      const { count: featuresCount } = await supabase
        .from('subscription_features')
        .select('*', { count: 'exact', head: true });

      // Load active subscriptions
      const { data: activeSubscriptions, count: subscriptionsCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString());

      // Load recent questions
      const { data: recentQuestions } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Load premium features
      const { data: premiumFeatures } = await supabase
        .from('subscription_features')
        .select('*')
        .eq('is_premium', true)
        .order('created_at', { ascending: true });

      setStats({
        totalQuestions: questionsCount || 0,
        totalFavorites: favoritesCount || 0,
        dailyUsers: Math.floor(Math.random() * 50) + 10, // محاكاة بيانات
        activeSubscriptions: subscriptionsCount || 0,
        totalFeatures: featuresCount || 0
      });

      setQuestions(recentQuestions || []);
      setSubscriptions(activeSubscriptions || []);
      setFeatures(premiumFeatures || []);
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
  };

  const addSubscription = async () => {
    if (!newSubscriptionIP.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال IP صحيح",
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

    try {
      // تحضير جميع المميزات للتفعيل
      const allFeatures = features.reduce((acc, feature) => {
        acc[feature.feature_key] = true;
        return acc;
      }, {} as Record<string, boolean>);

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_ip: newSubscriptionIP.trim(),
          subscription_type: 'monthly',
          is_active: true,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          features_enabled: allFeatures,
          last_activated: new Date().toISOString(),
          activated_by: 'admin_authorized',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_ip'
        });

      if (error) throw error;

      setNewSubscriptionIP("");
      setActivationPassword("");
      loadAdminData();
      toast({
        title: "تم الإضافة",
        description: `تم تفعيل الاشتراك الشهري بجميع المميزات الـ${features.length} بنجاح`
      });
    } catch (error) {
      console.error("Error adding subscription:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إضافة الاشتراك",
        variant: "destructive"
      });
    }
  };

  const removeSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ is_active: false })
        .eq('id', subscriptionId);

      if (error) throw error;

      loadAdminData();
      toast({
        title: "تم الإلغاء",
        description: "تم إلغاء الاشتراك بنجاح"
      });
    } catch (error) {
      console.error("Error removing subscription:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إلغاء الاشتراك",
        variant: "destructive"
      });
    }
  };

  const deleteQuestion = async (questionId: string) => {
    try {
      await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      toast({
        title: "تم الحذف",
        description: "تم حذف السؤال بنجاح"
      });
      
      loadAdminData();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف السؤال",
        variant: "destructive"
      });
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminAuth");
    setPassword("");
    onClose();
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 shadow-2xl border-2 border-slate-200">
          <CardHeader className="text-center relative">
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-amiri text-slate-800">
              لوحة تحكم الإدارة
            </CardTitle>
            <p className="text-slate-600">
              أدخل كلمة المرور للوصول للوحة التحكم
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="border-slate-300 focus:border-red-500 pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            
            <Button 
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "جاري التحقق..." : "دخول"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={onClose}
              variant="outline" 
              size="sm" 
              className="border-slate-400 text-slate-600 hover:bg-slate-50"
            >
              <X className="w-4 h-4 ml-1" />
              إغلاق
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-red-600" />
              <h1 className="text-3xl font-bold font-amiri text-slate-800">لوحة تحكم الإدارة</h1>
            </div>
          </div>
          
          <Button 
            onClick={logout}
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50"
          >
            تسجيل الخروج
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="shadow-lg border-indigo-200 bg-white/80">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
              <h3 className="text-2xl font-bold text-slate-800">{stats.totalQuestions}</h3>
              <p className="text-slate-600">إجمالي الأسئلة</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-purple-200 bg-white/80">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-2xl font-bold text-slate-800">{stats.activeSubscriptions}</h3>
              <p className="text-slate-600">اشتراكات نشطة</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-blue-200 bg-white/80">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-2xl font-bold text-slate-800">{stats.dailyUsers}</h3>
              <p className="text-slate-600">مستخدمين يومياً</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-rose-200 bg-white/80">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-rose-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">♡</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{stats.totalFavorites}</h3>
              <p className="text-slate-600">عناصر محفوظة</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-green-200 bg-white/80">
            <CardContent className="p-6 text-center">
              <Star className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-2xl font-bold text-slate-800">{stats.totalFeatures}</h3>
              <p className="text-slate-600">مميزات مميزة</p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Management */}
        <Card className="shadow-lg border-slate-200 bg-white/80 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Crown className="w-6 h-6 text-purple-600" />
              إدارة الاشتراكات مع المميزات (محمي)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-semibold">تحذير أمني:</p>
                  <p>تفعيل الاشتراك يتطلب كلمة سر محددة للحماية من التفعيل غير المصرح به.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 mb-6">
              <Input
                placeholder="أدخل IP الجهاز"
                value={newSubscriptionIP}
                onChange={(e) => setNewSubscriptionIP(e.target.value)}
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
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
              </div>
              <Button 
                onClick={addSubscription}
                disabled={!newSubscriptionIP.trim() || !activationPassword}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 ml-1" />
                تفعيل جميع المميزات ({features.length}) - محمي
              </Button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">IP: {sub.user_ip}</p>
                    <p className="text-sm text-slate-600">
                      انتهاء: {new Date(sub.end_date).toLocaleDateString('ar-SA')}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-green-600 text-white text-xs">
                        <CheckCircle className="w-3 h-3 ml-1" />
                        {Object.keys(sub.features_enabled || {}).length} ميزة مفعلة
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600 text-white">نشط</Badge>
                    <Button
                      onClick={() => removeSubscription(sub.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              ))}
              {subscriptions.length === 0 && (
                <p className="text-center text-slate-500 py-8">لا توجد اشتراكات نشطة</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Premium Features Overview */}
        <Card className="shadow-lg border-slate-200 bg-white/80 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Star className="w-6 h-6 text-green-600" />
              المميزات المميزة المتاحة ({features.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {features.map((feature, index) => (
                <div key={feature.id} className="p-3 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-green-800">{feature.feature_name_ar}</h4>
                      <p className="text-xs text-green-700 mt-1">{feature.feature_description_ar}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Questions */}
        <Card className="shadow-lg border-slate-200 bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
              الأسئلة الحديثة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {questions.map((q) => (
                <div key={q.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 mb-2">{q.question}</p>
                      <p className="text-sm text-slate-600 line-clamp-2">{q.answer}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {new Date(q.created_at).toLocaleDateString('ar-SA')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          IP: {q.user_ip}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => deleteQuestion(q.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <Button 
                onClick={loadAdminData}
                variant="outline"
                className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
              >
                تحديث البيانات
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
