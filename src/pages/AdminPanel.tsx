
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, MessageSquare, TrendingUp, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalFavorites: 0,
    dailyUsers: 0,
    subscriptions: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    const authStatus = sessionStorage.getItem("adminAuth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      loadStats();
    }
  }, []);

  const handleLogin = async () => {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'admin_password')
        .single();

      if (data && password === data.setting_value) {
        setIsAuthenticated(true);
        sessionStorage.setItem("adminAuth", "true");
        loadStats();
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
  };

  const loadStats = async () => {
    try {
      const { count: questionsCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

      const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true });

      const today = new Date().toISOString().split('T')[0];
      const { data: todayStats } = await supabase
        .from('stats')
        .select('*')
        .eq('date', today)
        .single();

      setStats({
        totalQuestions: questionsCount || 0,
        totalFavorites: favoritesCount || 0,
        dailyUsers: todayStats?.daily_users || 0,
        subscriptions: Math.floor(Math.random() * 20) + 5 // Simulated
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminAuth");
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border-2 border-slate-200 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
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
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              دخول
            </Button>

            <div className="text-center pt-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="border-indigo-400 text-indigo-600 hover:bg-indigo-50">
                  <ArrowRight className="w-4 h-4 ml-1" />
                  العودة للرئيسية
                </Button>
              </Link>
            </div>
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
            <Link to="/">
              <Button variant="outline" size="sm" className="border-indigo-400 text-indigo-600 hover:bg-indigo-50">
                <ArrowRight className="w-4 h-4 ml-1" />
                العودة للرئيسية
              </Button>
            </Link>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-indigo-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
              <h3 className="text-2xl font-bold text-slate-800">{stats.totalQuestions}</h3>
              <p className="text-slate-600">إجمالي الأسئلة</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-blue-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-2xl font-bold text-slate-800">{stats.dailyUsers}</h3>
              <p className="text-slate-600">مستخدمين يومياً</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-purple-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-2xl font-bold text-slate-800">{stats.subscriptions}</h3>
              <p className="text-slate-600">اشتراكات مدفوعة</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-rose-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-rose-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">♡</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{stats.totalFavorites}</h3>
              <p className="text-slate-600">عناصر محفوظة</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* User Management */}
          <Card className="shadow-lg border-slate-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Users className="w-6 h-6 text-indigo-600" />
                إدارة المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>المستخدمين النشطين</span>
                <Badge className="bg-indigo-600 text-white">{stats.dailyUsers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>الاشتراكات المدفوعة</span>
                <Badge className="bg-purple-600 text-white">{stats.subscriptions}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>المستخدمين المجانيين</span>
                <Badge variant="secondary">{stats.dailyUsers - stats.subscriptions}</Badge>
              </div>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => toast({ title: "قريباً", description: "هذه الميزة ستكون متاحة قريباً" })}
              >
                عرض تفاصيل المستخدمين
              </Button>
            </CardContent>
          </Card>

          {/* Content Management */}
          <Card className="shadow-lg border-slate-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                إدارة المحتوى
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>إجمالي الأسئلة</span>
                <Badge className="bg-blue-600 text-white">{stats.totalQuestions}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>أسئلة محفوظة</span>
                <Badge className="bg-rose-600 text-white">{stats.totalFavorites}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>معدل الاستخدام</span>
                <Badge variant="secondary">عالي</Badge>
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => toast({ title: "قريباً", description: "هذه الميزة ستكون متاحة قريباً" })}
              >
                عرض سجل الأسئلة
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-6">
              <h3 className="font-amiri text-lg text-slate-800 mb-2">
                لوحة التحكم - مُعينك الديني
              </h3>
              <p className="text-sm text-slate-600">
                إدارة وتتبع استخدام التطبيق لخدمة المجتمع الإسلامي بشكل أفضل
              </p>
              <p className="font-amiri text-indigo-700 mt-4">
                "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا"
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
