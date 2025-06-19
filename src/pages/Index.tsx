
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Mic, Send, Heart, Settings, Star, Crown, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import PrayerReminder from "@/components/PrayerReminder";
import DuaaHeader from "@/components/DuaaHeader";
import LoadingSpinner from "@/components/LoadingSpinner";

const Index = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState("");
  const [dailyQuestions, setDailyQuestions] = useState(5);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  // Load saved questions count
  useEffect(() => {
    const saved = localStorage.getItem("dailyQuestions");
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toDateString();
      if (data.date === today) {
        setDailyQuestions(data.count);
      } else {
        // Reset for new day
        localStorage.setItem("dailyQuestions", JSON.stringify({ date: today, count: 5 }));
        setDailyQuestions(5);
      }
    }
  }, []);

  const askQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "تنبيه",
        description: "يرجى كتابة السؤال أولاً",
        variant: "destructive"
      });
      return;
    }

    if (dailyQuestions <= 0) {
      toast({
        title: "انتهت الأسئلة المجانية",
        description: "اشترك للحصول على أسئلة غير محدودة",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setAnswer("");
    setSource("");

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCyL3PUbUqM6LordRdgFtBX5jSeyFLEytM`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `أنت مساعد ديني إسلامي. أجب على السؤال التالي بناءً على القرآن الكريم والسنة النبوية الصحيحة فقط. 
                
                قواعد مهمة:
                - لا تفتي في مسائل الدماء أو الطلاق أو التكفير
                - إذا لم تكن متأكداً من الإجابة، انصح بالرجوع لأهل العلم
                - اذكر المصدر إذا توفر (آية قرآنية أو حديث صحيح)
                - كن مختصراً ومفيداً
                
                السؤال: ${question}`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]) {
        const responseText = data.candidates[0].content.parts[0].text;
        setAnswer(responseText);
        
        // Extract source if mentioned
        if (responseText.includes("القرآن") || responseText.includes("الحديث") || responseText.includes("البخاري") || responseText.includes("مسلم")) {
          setSource("المصدر: من القرآن الكريم والسنة النبوية الصحيحة");
        }

        // Save question to history
        const history = JSON.parse(localStorage.getItem("questionHistory") || "[]");
        history.unshift({
          id: Date.now(),
          question,
          answer: responseText,
          source: source || "",
          date: new Date().toLocaleString("ar-SA")
        });
        localStorage.setItem("questionHistory", JSON.stringify(history.slice(0, 50))); // Keep last 50

        // Update daily questions count
        const newCount = dailyQuestions - 1;
        setDailyQuestions(newCount);
        const today = new Date().toDateString();
        localStorage.setItem("dailyQuestions", JSON.stringify({ date: today, count: newCount }));

        toast({
          title: "تم الحصول على الإجابة",
          description: `باقي لديك ${newCount} أسئلة اليوم`
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في الحصول على الإجابة. حاول مرة أخرى",
        variant: "destructive"
      });
      console.error("Error:", error);
    }

    setIsLoading(false);
  };

  const saveToFavorites = () => {
    if (!answer) return;
    
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const newFavorite = {
      id: Date.now(),
      question,
      answer,
      source,
      date: new Date().toLocaleString("ar-SA")
    };
    
    favorites.unshift(newFavorite);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    
    toast({
      title: "تم الحفظ",
      description: "تم إضافة السؤال والإجابة للمفضلة"
    });
  };

  const shareAnswer = async () => {
    if (!answer) return;
    
    const shareText = `السؤال: ${question}\n\nالإجابة: ${answer}\n\n${source}\n\nمن تطبيق: مُعينك الديني`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "مُعينك الديني",
          text: shareText
        });
      } catch (error) {
        // Fallback to copy
        navigator.clipboard.writeText(shareText);
        toast({
          title: "تم النسخ",
          description: "تم نسخ الإجابة للحافظة"
        });
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "تم النسخ",
        description: "تم نسخ الإجابة للحافظة"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-cream via-white to-islamic-cream">
      {/* Header with Duaa */}
      <DuaaHeader />
      
      {/* Prayer Reminder */}
      <PrayerReminder />

      {/* Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-islamic-gold" />
            <h1 className="text-2xl font-bold font-amiri text-islamic-green">مُعينك الديني</h1>
          </div>
          
          <div className="flex gap-2">
            <Link to="/favorites">
              <Button variant="outline" size="sm" className="border-islamic-gold text-islamic-gold hover:bg-islamic-gold hover:text-white">
                <Heart className="w-4 h-4 ml-1" />
                المفضلة
              </Button>
            </Link>
            <Link to="/subscription">
              <Button variant="outline" size="sm" className="border-islamic-gold text-islamic-gold hover:bg-islamic-gold hover:text-white">
                <Crown className="w-4 h-4 ml-1" />
                الاشتراك
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" size="sm" className="border-islamic-gold text-islamic-gold hover:bg-islamic-gold hover:text-white">
                <Settings className="w-4 h-4 ml-1" />
                الإعدادات
              </Button>
            </Link>
          </div>
        </div>

        {/* Daily Questions Counter */}
        <div className="text-center mb-6">
          <Badge variant="secondary" className="bg-islamic-gold text-white px-4 py-2 text-lg">
            الأسئلة المتبقية اليوم: {dailyQuestions}
          </Badge>
        </div>

        {/* Main Question Card */}
        <Card className="max-w-4xl mx-auto mb-6 shadow-xl border-2 border-islamic-gold/20">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-amiri text-islamic-green mb-2">
                اسأل ما شئت، نجيبك بإذن الله من الكتاب والسنة
              </h2>
              <p className="text-muted-foreground">
                احصل على إجابات موثوقة من القرآن الكريم والسنة النبوية الصحيحة
              </p>
            </div>

            <div className="space-y-4">
              <Textarea
                placeholder="اكتب سؤالك الديني هنا..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[120px] text-lg border-islamic-gold/30 focus:border-islamic-gold"
                disabled={isLoading}
              />

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={askQuestion}
                  disabled={isLoading || dailyQuestions <= 0}
                  className="bg-islamic-green hover:bg-islamic-green-dark text-white px-8 py-3 text-lg"
                >
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <Send className="w-5 h-5 ml-2" />
                      اسأل الآن
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="border-islamic-gold text-islamic-gold hover:bg-islamic-gold hover:text-white px-6 py-3"
                  disabled={isRecording}
                >
                  <Mic className="w-5 h-5 ml-2" />
                  تسجيل صوتي
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answer Card */}
        {answer && (
          <Card className="max-w-4xl mx-auto mb-6 shadow-xl border-2 border-islamic-gold/20 animate-fade-in">
            <CardContent className="p-8">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-islamic-green mb-3 flex items-center">
                  <Star className="w-5 h-5 ml-2 text-islamic-gold" />
                  الإجابة:
                </h3>
                <div className="bg-islamic-cream p-6 rounded-lg text-lg leading-relaxed">
                  {answer}
                </div>
              </div>

              {source && (
                <div className="mb-4 p-4 bg-islamic-gold/10 rounded-lg">
                  <p className="text-sm font-medium text-islamic-green">{source}</p>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={saveToFavorites}
                  variant="outline"
                  className="border-islamic-gold text-islamic-gold hover:bg-islamic-gold hover:text-white"
                >
                  <Bookmark className="w-4 h-4 ml-2" />
                  حفظ في المفضلة
                </Button>

                <Button
                  onClick={shareAnswer}
                  variant="outline"
                  className="border-islamic-gold text-islamic-gold hover:bg-islamic-gold hover:text-white"
                >
                  <Send className="w-4 h-4 ml-2" />
                  مشاركة الإجابة
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-muted-foreground">
          <p className="font-amiri">
            "وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا"
          </p>
          <p className="text-sm mt-2">
            الإجابات مبنية على المصادر الإسلامية المعتمدة. للمسائل المعقدة، يُرجى الرجوع لأهل العلم.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
