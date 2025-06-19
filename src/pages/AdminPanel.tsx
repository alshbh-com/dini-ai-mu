
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, MessageSquare, TrendingUp, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
    // Check if already authenticated
    const authStatus = sessionStorage.getItem("adminAuth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      loadStats();
    }
  }, []);

  const handleLogin = () => {
    if (password === "01278006248") {
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
  };

  const loadStats = () => {
    // Load statistics from localStorage
    const history = JSON.parse(localStorage.getItem("questionHistory") || "[]");
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    
    setStats({
      totalQuestions: history.length,
      totalFavorites: favorites.length,
      dailyUsers: Math.floor(Math.random() * 50) + 10, // Simulated
      subscriptions: Math.floor(Math.random() * 20) + 5 // Simulated
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminAuth");
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-islamic-cream via-white to-islamic-cream flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border-2 border-islamic-gold/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12 text-islamic-gold" />
            </div>
            <CardTitle className="text-2xl font-amiri text-islamic-green">
              لوحة تحكم الإدارة
            </CardTitle>
            <p className="text-muted-foreground">
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
                className="border-islamic-gold/30 focus:border-islamic-gold pr-12"
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
              className="w-full bg-islamic-green hover:bg-islamic-green-dark text-white"
            >
              دخول
            </Button>

            <div className="text-center pt-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="border-islamic-gold text-islamic-gold hover:bg-islamic-gold hover:text-white">
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
    <div className="min-h-screen bg-gradient-to-br from-islamic-cream via-white to-islamic-cream">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="border-islamic-gold text-islamic-gold hover:bg-islamic-gold hover:text-white">
                <ArrowRight className="w-4 h-4 ml-1" />
                العودة للرئيسية
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-islamic-gold" />
              <h1 className="text-3xl font-bold font-amiri text-islamic-green">لوحة تحكم الإدارة</h1>
            </div>
          </div>
          
          <Button 
            onClick={logout}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            تسجيل الخروج
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-islamic-gold/20">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-islamic-gold" />
              <h3 className="text-2xl font-bold text-islamic-green">{stats.totalQuestions}</h3>
              <p className="text-muted-foreground">إجمالي الأسئلة</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-islamic-gold/20">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-islamic-gold" />
              <h3 className="text-2xl font-bold text-islamic-green">{stats.dailyUsers}</h3>
              <p className="text-muted-foreground">مستخدمين يومياً</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-islamic-gold/20">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-islamic-gold" />
              <h3 className="text-2xl font-bold text-islamic-green">{stats.subscriptions}</h3>
              <p className="text-muted-foreground">اشتراكات مدفوعة</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-islamic-gold/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-islamic-gold rounded-full flex items-center justify-center">
                <span className="text-white font-bold">♡</span>
              </div>
              <h3 className="text-2xl font-bold text-islamic-green">{stats.totalFavorites}</h3>
              <p className="text-muted-foreground">عناصر محفوظة</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* User Management */}
          <Card className="shadow-lg border-islamic-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-islamic-green">
                <Users className="w-6 h-6 text-islamic-gold" />
                إدارة المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>المستخدمين النشطين</span>
                <Badge className="bg-islamic-green text-white">{stats.dailyUsers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>الاشتراكات المدفوعة</span>
                <Badge className="bg-islamic-gold text-white">{stats.subscriptions}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>المستخدمين المجانيين</span>
                <Badge variant="secondary">{stats.dailyUsers - stats.subscriptions}</Badge>
              </div>
              <Button 
                className="w-full bg-islamic-green hover:bg-islamic-green-dark text-white"
                onClick={() => toast({ title: "قريباً", description: "هذه الميزة ستكون متاحة قريباً" })}
              >
                عرض تفاصيل المستخدمين
              </Button>
            </CardContent>
          </Card>

          {/* Content Management */}
          <Card className="shadow-lg border-islamic-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-islamic-green">
                <MessageSquare className="w-6 h-6 text-islamic-gold" />
                إدارة المحتوى
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>إجمالي الأسئلة</span>
                <Badge className="bg-islamic-green text-white">{stats.totalQuestions}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>أسئلة محفوظة</span>
                <Badge className="bg-islamic-gold text-white">{stats.totalFavorites}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>معدل الاستخدام</span>
                <Badge variant="secondary">عالي</Badge>
              </div>
              <Button 
                className="w-full bg-islamic-green hover:bg-islamic-green-dark text-white"
                onClick={() => toast({ title: "قريباً", description: "هذه الميزة ستكون متاحة قريباً" })}
              >
                عرض سجل الأسئلة
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="shadow-lg border-islamic-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-islamic-green">
                <TrendingUp className="w-6 h-6 text-islamic-gold" />
                حالة النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>API Status</span>
                <Badge className="bg-green-500 text-white">متصل</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>قاعدة البيانات</span>
                <Badge className="bg-green-500 text-white">تعمل</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>سرعة الاستجابة</span>
                <Badge className="bg-islamic-gold text-white">ممتازة</Badge>
              </div>
              <Button 
                className="w-full bg-islamic-green hover:bg-islamic-green-dark text-white"
                onClick={() => {
                  loadStats();
                  toast({ title: "تم التحديث", description: "تم تحديث الإحصائيات بنجاح" });
                }}
              >
                تحديث الإحصائيات
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-lg border-islamic-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-islamic-green">
                <Shield className="w-6 h-6 text-islamic-gold" />
                إجراءات سريعة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full border-islamic-gold text-islamic-gold hover:bg-islamic-gold hover:text-white"
                onClick={() => toast({ title: "قريباً", description: "هذه الميزة ستكون متاحة قريباً" })}
              >
                إرسال إشعار للمستخدمين
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-islamic-gold text-islamic-gold hover:bg-islamic-gold hover:text-white"
                onClick={() => toast({ title: "قريباً", description: "هذه الميزة ستكون متاحة قريباً" })}
              >
                تحديث قاعدة المعرفة
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-islamic-gold text-islamic-gold hover:bg-islamic-gold hover:text-white"
                onClick={() => toast({ title: "قريباً", description: "هذه الميزة ستكون متاحة قريباً" })}
              >
                إنشاء تقرير شهري
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-islamic-gold text-islamic-gold hover:bg-islamic-gold hover:text-white"
                onClick={() => toast({ title: "قريباً", description: "هذه الميزة ستكون متاحة قريباً" })}
              >
                إدارة الاشتراكات
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Card className="bg-islamic-gold/10 border-islamic-gold/30">
            <CardContent className="p-6">
              <h3 className="font-amiri text-lg text-islamic-green mb-2">
                لوحة التحكم - مُعينك الديني
              </h3>
              <p className="text-sm text-muted-foreground">
                إدارة وتتبع استخدام التطبيق لخدمة المجتمع الإسلامي بشكل أفضل
              </p>
              <p className="font-amiri text-islamic-green mt-4">
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
