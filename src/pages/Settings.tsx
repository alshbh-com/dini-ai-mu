
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Settings as SettingsIcon, MessageCircle, Shield, Book, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();

  const contactSupport = () => {
    const phoneNumber = "201204486263";
    const message = "السلام عليكم، أحتاج مساعدة في تطبيق مُعينك الديني";
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  const clearData = () => {
    if (confirm("هل أنت متأكد من حذف جميع البيانات؟ لن يمكن استرجاعها.")) {
      localStorage.removeItem("favorites");
      localStorage.removeItem("questionHistory");
      localStorage.removeItem("dailyQuestions");
      localStorage.removeItem("lastPrayerReminder");
      toast({
        title: "تم الحذف",
        description: "تم حذف جميع البيانات بنجاح"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-cream via-white to-islamic-cream">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm" className="border-islamic-gold text-islamic-gold hover:bg-islamic-gold hover:text-white">
              <ArrowRight className="w-4 h-4 ml-1" />
              العودة للرئيسية
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-islamic-gold" />
            <h1 className="text-3xl font-bold font-amiri text-islamic-green">الإعدادات</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Support */}
          <Card className="shadow-lg border-islamic-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-islamic-green">
                <MessageCircle className="w-6 h-6 text-islamic-gold" />
                الدعم والمساعدة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                تواصل معنا في حال واجهت أي مشكلة أو كان لديك استفسار
              </p>
              <Button 
                onClick={contactSupport}
                className="bg-islamic-green hover:bg-islamic-green-dark text-white"
              >
                <MessageCircle className="w-5 h-5 ml-2" />
                تواصل عبر واتساب
              </Button>
            </CardContent>
          </Card>

          {/* Privacy Policy */}
          <Card className="shadow-lg border-islamic-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-islamic-green">
                <Shield className="w-6 h-6 text-islamic-gold" />
                سياسة الخصوصية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-islamic-green mb-2">جمع البيانات:</h4>
                  <p className="text-muted-foreground">
                    نحتفظ بأسئلتك وإجاباتك محلياً على جهازك فقط. لا نرسل بياناتك الشخصية لأطراف ثالثة.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-islamic-green mb-2">استخدام البيانات:</h4>
                  <p className="text-muted-foreground">
                    نستخدم أسئلتك فقط لتقديم إجابات دقيقة من المصادر الإسلامية المعتمدة.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-islamic-green mb-2">الأمان:</h4>
                  <p className="text-muted-foreground">
                    جميع الاتصالات مشفرة ومحمية. لا نحتفظ بمعلومات شخصية غير ضرورية.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Guidelines */}
          <Card className="shadow-lg border-islamic-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-islamic-green">
                <Book className="w-6 h-6 text-islamic-gold" />
                إرشادات الاستخدام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-islamic-gold font-bold">•</span>
                  <span>اطرح أسئلة واضحة ومحددة للحصول على إجابات دقيقة</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-islamic-gold font-bold">•</span>
                  <span>تجنب الأسئلة الحساسة المتعلقة بالفتوى المباشرة في مسائل الدماء والطلاق</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-islamic-gold font-bold">•</span>
                  <span>راجع مصادر الإجابات وارجع لأهل العلم في المسائل المعقدة</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-islamic-gold font-bold">•</span>
                  <span>استخدم التطبيق بنية طلب العلم والتقرب إلى الله</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="shadow-lg border-islamic-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-islamic-green">
                <HelpCircle className="w-6 h-6 text-islamic-gold" />
                الأسئلة الشائعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-islamic-green mb-1">كيف يعمل التطبيق؟</h4>
                  <p className="text-sm text-muted-foreground">
                    يستخدم التطبيق ذكاء اصطناعي متقدم مدرب على المصادر الإسلامية المعتمدة لتقديم إجابات موثوقة.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-islamic-green mb-1">هل الإجابات موثوقة؟</h4>
                  <p className="text-sm text-muted-foreground">
                    نعم، ولكن ننصح بمراجعة أهل العلم في المسائل المعقدة والمصيرية.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-islamic-green mb-1">كيف أقوم بالاشتراك؟</h4>
                  <p className="text-sm text-muted-foreground">
                    تواصل معنا عبر واتساب أو من خلال صفحة الاشتراك في التطبيق.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="shadow-lg border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">إدارة البيانات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                حذف جميع البيانات المحفوظة محلياً (المفضلة، السجل، إلخ)
              </p>
              <Button 
                onClick={clearData}
                variant="destructive"
              >
                حذف جميع البيانات
              </Button>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card className="shadow-lg border-islamic-gold/20">
            <CardContent className="pt-6 text-center">
              <h3 className="font-amiri text-lg text-islamic-green mb-2">مُعينك الديني</h3>
              <p className="text-sm text-muted-foreground mb-2">الإصدار 1.0.0</p>
              <p className="text-xs text-muted-foreground">
                تم تطويره بحب لخدمة المجتمع الإسلامي
              </p>
              <div className="mt-4 text-center">
                <p className="font-amiri text-islamic-green">
                  "وَقُل رَّبِّ زِدْنِي عِلْمًا"
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
