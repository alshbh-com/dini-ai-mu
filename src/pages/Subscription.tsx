
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Crown, Check, MessageCircle, Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Subscription = () => {
  const { toast } = useToast();

  const contactWhatsApp = () => {
    const phoneNumber = "201204486263";
    const message = "السلام عليكم، أريد الاشتراك في تطبيق مُعينك الديني";
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  const features = {
    free: [
      "5 أسئلة يومياً",
      "إجابات من القرآن والسنة",
      "حفظ 10 أسئلة في المفضلة",
      "مشاركة الإجابات"
    ],
    premium: [
      "أسئلة غير محدودة",
      "إجابات مفصلة مع المصادر",
      "حفظ غير محدود في المفضلة",
      "دعم صوتي للإجابات (TTS)",
      "أولوية في الرد",
      "إشعارات تذكير الصلاة",
      "تحديثات مجانية مدى الحياة",
      "دعم فني مخصص"
    ]
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
            <Crown className="w-8 h-8 text-islamic-gold" />
            <h1 className="text-3xl font-bold font-amiri text-islamic-green">خطط الاشتراك</h1>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="relative shadow-lg border-2 border-gray-200">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-amiri text-islamic-green flex items-center justify-center gap-2">
                <Heart className="w-6 h-6" />
                الخطة المجانية
              </CardTitle>
              <div className="text-3xl font-bold text-islamic-green mt-2">
                مجاناً
              </div>
              <p className="text-muted-foreground">للاستخدام الأساسي</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {features.free.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-gray-500 hover:bg-gray-600 text-white"
                disabled
              >
                الخطة الحالية
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative shadow-xl border-2 border-islamic-gold bg-gradient-to-br from-white to-islamic-gold/5">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-islamic-gold text-white px-4 py-1 text-sm font-semibold">
                الأكثر شعبية
              </Badge>
            </div>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-amiri text-islamic-green flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-islamic-gold" />
                الخطة المميزة
              </CardTitle>
              <div className="text-3xl font-bold text-islamic-gold mt-2">
                شهرياً
              </div>
              <p className="text-muted-foreground">للاستخدام المكثف</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {features.premium.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-islamic-gold" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={contactWhatsApp}
                className="w-full bg-islamic-green hover:bg-islamic-green-dark text-white text-lg py-3"
              >
                <MessageCircle className="w-5 h-5 ml-2" />
                اشترك عبر واتساب
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-12 max-w-3xl mx-auto">
          <Card className="bg-islamic-gold/10 border-islamic-gold/30">
            <CardContent className="p-6 text-center">
              <Star className="w-12 h-12 mx-auto mb-4 text-islamic-gold" />
              <h3 className="text-xl font-amiri text-islamic-green mb-4">
                لماذا تختار الخطة المميزة؟
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-right">
                <div>
                  <h4 className="font-semibold text-islamic-green mb-2">للطلاب والباحثين:</h4>
                  <p className="text-sm text-muted-foreground">
                    أسئلة غير محدودة لدراسة العلوم الشرعية والبحث في المسائل الفقهية
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-islamic-green mb-2">للمربين والدعاة:</h4>
                  <p className="text-sm text-muted-foreground">
                    إجابات شاملة ومصادر موثقة لتحضير الدروس والخطب
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-islamic-green mb-2">للعائلات:</h4>
                  <p className="text-sm text-muted-foreground">
                    تربية الأطفال على القيم الإسلامية بإجابات واضحة ومفهومة
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-islamic-green mb-2">لعموم المسلمين:</h4>
                  <p className="text-sm text-muted-foreground">
                    فهم أعمق للدين وحلول للمشاكل الحياتية وفق الشريعة الإسلامية
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            للاستفسارات أو المساعدة في الاشتراك، تواصل معنا عبر واتساب
          </p>
          <Button 
            onClick={contactWhatsApp}
            variant="outline"
            className="border-islamic-gold text-islamic-gold hover:bg-islamic-gold hover:text-white"
          >
            <MessageCircle className="w-5 h-5 ml-2" />
            +20 120 448 6263
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
