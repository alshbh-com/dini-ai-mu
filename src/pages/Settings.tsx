
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Moon, Sun, Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyQuestionLimit, setDailyQuestionLimit] = useState("10");
  const [adminPassword, setAdminPassword] = useState("");
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
    } catch (error) {
      console.error("Error loading settings:", error);
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
          <SettingsIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold font-amiri text-slate-800">الإعدادات</h1>
        </div>

        {/* Display Settings */}
        <Card className="mb-6 shadow-lg border border-blue-100 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              {isDarkMode ? <Moon className="w-6 h-6 text-blue-600" /> : <Sun className="w-6 h-6 text-blue-600" />}
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
        <Card className="mb-6 shadow-lg border border-blue-100 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              {notificationsEnabled ? <Bell className="w-6 h-6 text-blue-600" /> : <BellOff className="w-6 h-6 text-blue-600" />}
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-bold rounded-xl shadow-lg"
          >
            حفظ الإعدادات
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
