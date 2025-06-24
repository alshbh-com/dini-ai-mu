
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Moon, Sun, Bell, BellOff, Upload, Image, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyQuestionLimit, setDailyQuestionLimit] = useState("10");
  const [adminPassword, setAdminPassword] = useState("");
  const [currentBackground, setCurrentBackground] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load current settings
      const { data: limitData } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'daily_question_limit')
        .maybeSingle();

      if (limitData) {
        setDailyQuestionLimit(limitData.setting_value);
      }

      const { data: passwordData } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'admin_password')
        .maybeSingle();

      if (passwordData) {
        setAdminPassword(passwordData.setting_value);
      }

      const { data: backgroundData } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'background_image')
        .maybeSingle();

      if (backgroundData) {
        setCurrentBackground(backgroundData.setting_value);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف صورة صالح",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64 or upload to a service
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        
        // Save to database
        await supabase
          .from('app_settings')
          .upsert({
            setting_key: 'background_image',
            setting_value: imageUrl
          });

        setCurrentBackground(imageUrl);
        toast({
          title: "تم الرفع",
          description: "تم رفع صورة الخلفية بنجاح"
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading background:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في رفع الصورة",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeBackground = async () => {
    try {
      await supabase
        .from('app_settings')
        .upsert({
          setting_key: 'background_image',
          setting_value: ''
        });

      setCurrentBackground("");
      toast({
        title: "تم الحذف",
        description: "تم حذف صورة الخلفية"
      });
    } catch (error) {
      console.error("Error removing background:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف الصورة",
        variant: "destructive"
      });
    }
  };

  const saveSettings = async () => {
    try {
      // Save daily question limit
      await supabase
        .from('app_settings')
        .upsert({
          setting_key: 'daily_question_limit',
          setting_value: dailyQuestionLimit
        });

      // Save admin password
      if (adminPassword.trim()) {
        await supabase
          .from('app_settings')
          .upsert({
            setting_key: 'admin_password',
            setting_value: adminPassword
          });
      }

      toast({
        title: "تم الحفظ",
        description: "تم حفظ الإعدادات بنجاح"
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ الإعدادات",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold font-amiri text-slate-800">الإعدادات</h1>
        </div>

        {/* Background Settings */}
        <Card className="mb-6 shadow-lg border border-indigo-100 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Image className="w-6 h-6 text-indigo-600" />
              إعدادات خلفية التطبيق
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="background-upload" className="text-slate-700 mb-2 block">
                رفع صورة خلفية (شفافة)
              </Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="background-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  disabled={isUploading}
                  className="flex-1"
                />
                <Button
                  onClick={() => document.getElementById('background-upload')?.click()}
                  disabled={isUploading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Upload className="w-4 h-4 ml-1" />
                  {isUploading ? "جاري الرفع..." : "رفع"}
                </Button>
              </div>
            </div>

            {currentBackground && (
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-slate-600">الخلفية الحالية:</p>
                  <Button
                    onClick={removeBackground}
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 ml-1" />
                    حذف
                  </Button>
                </div>
                <div className="w-full h-32 bg-cover bg-center rounded-lg border border-slate-300"
                     style={{ backgroundImage: `url(${currentBackground})` }} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card className="mb-6 shadow-lg border border-indigo-100 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              {isDarkMode ? <Moon className="w-6 h-6 text-indigo-600" /> : <Sun className="w-6 h-6 text-indigo-600" />}
              إعدادات العرض
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="text-slate-700">
                الوضع المظلم
              </Label>
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */} 
        <Card className="mb-6 shadow-lg border border-indigo-100 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              {notificationsEnabled ? <Bell className="w-6 h-6 text-indigo-600" /> : <BellOff className="w-6 h-6 text-indigo-600" />}
              إعدادات التنبيهات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-slate-700">
                تفعيل التنبيهات
              </Label>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Admin Settings */}
        <Card className="mb-6 shadow-lg border border-red-100 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <SettingsIcon className="w-6 h-6 text-red-600" />
              إعدادات المدير
              <Badge variant="destructive" className="text-xs">محمي</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="daily-limit" className="text-slate-700 mb-2 block">
                عدد الأسئلة اليومية المجانية
              </Label>
              <Input
                id="daily-limit"
                type="number"
                value={dailyQuestionLimit}
                onChange={(e) => setDailyQuestionLimit(e.target.value)}
                min="1"
                max="100"
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="admin-password" className="text-slate-700 mb-2 block">
                كلمة مرور لوحة الإدارة
              </Label>
              <Input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="أدخل كلمة مرور قوية"
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={saveSettings}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg font-bold rounded-xl shadow-lg"
          >
            حفظ الإعدادات
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
