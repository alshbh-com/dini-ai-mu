
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, MessageSquare, TrendingUp, Eye, EyeOff, X, Trash2, Edit } from "lucide-react";
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
    todayQuestions: 0
  });
  const [questions, setQuestions] = useState<any[]>([]);
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

      // Load today's stats
      const today = new Date().toISOString().split('T')[0];
      const { data: todayStats } = await supabase
        .from('stats')
        .select('*')
        .eq('date', today)
        .single();

      // Load recent questions
      const { data: recentQuestions } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalQuestions: questionsCount || 0,
        totalFavorites: favoritesCount || 0,
        dailyUsers: todayStats?.daily_users || 0,
        todayQuestions: todayStats?.total_questions || 0
      });

      setQuestions(recentQuestions || []);
    } catch (error) {
      console.error("Error loading admin data:", error);
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
        <div className="flex justify-between items-center mb-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-indigo-200 bg-white/80">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
              <h3 className="text-2xl font-bold text-slate-800">{stats.totalQuestions}</h3>
              <p className="text-slate-600">إجمالي الأسئلة</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-blue-200 bg-white/80">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-2xl font-bold text-slate-800">{stats.dailyUsers}</h3>
              <p className="text-slate-600">مستخدمين اليوم</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-green-200 bg-white/80">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-2xl font-bold text-slate-800">{stats.todayQuestions}</h3>
              <p className="text-slate-600">أسئلة اليوم</p>
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
        </div>

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
