
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Mic, Send, Heart, Settings, Star, Crown, Bookmark, Sparkles, Moon } from "lucide-react";
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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCyL3PUbUqM6LordRdgFtBX5jSeyFLEytM`,
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
      console.log("API Response:", data);
      
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
      } else {
        throw new Error("No response from AI");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header with Duaa */}
      <DuaaHeader />
      
      {/* Prayer Reminder */}
      <PrayerReminder />

      {/* Navigation */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BookOpen className="w-10 h-10 text-amber-400" />
              <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-amiri text-white">مُعينك الديني</h1>
              <p className="text-amber-200 text-sm">دليلك الموثوق للمعرفة الإسلامية</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link to="/favorites">
              <Button variant="outline" size="sm" className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-900 transition-all duration-300">
                <Heart className="w-4 h-4 ml-1" />
                المفضلة
              </Button>
            </Link>
            <Link to="/subscription">
              <Button variant="outline" size="sm" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white transition-all duration-300">
                <Crown className="w-4 h-4 ml-1" />
                الاشتراك
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" size="sm" className="border-slate-400 text-slate-400 hover:bg-slate-400 hover:text-white transition-all duration-300">
                <Settings className="w-4 h-4 ml-1" />
                الإعدادات
              </Button>
            </Link>
          </div>
        </div>

        {/* Daily Questions Counter */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 px-6 py-3 rounded-full font-bold text-lg shadow-lg">
            <Moon className="w-5 h-5" />
            الأسئلة المتبقية اليوم: {dailyQuestions}
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Main Question Card */}
        <Card className="max-w-4xl mx-auto mb-8 shadow-2xl border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md">
          <CardContent className="p-10">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="w-6 h-6 text-amber-400 animate-pulse" />
                <h2 className="text-2xl font-amiri text-white">
                  اسأل ما شئت، نجيبك بإذن الله من الكتاب والسنة
                </h2>
                <Star className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>
              <p className="text-slate-300 text-lg">
                احصل على إجابات موثوقة من القرآن الكريم والسنة النبوية الصحيحة
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <Textarea
                  placeholder="اكتب سؤالك الديني هنا..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[140px] text-lg border-2 border-amber-400/30 focus:border-amber-400 bg-white/10 backdrop-blur-sm text-white placeholder:text-slate-300 rounded-xl"
                  disabled={isLoading}
                />
                <div className="absolute top-4 right-4">
                  <BookOpen className="w-6 h-6 text-amber-400/50" />
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={askQuestion}
                  disabled={isLoading || dailyQuestions <= 0}
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-900 px-10 py-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
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
                  className="border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-4 text-lg rounded-xl transition-all duration-300"
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
          <Card className="max-w-4xl mx-auto mb-8 shadow-2xl border-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-md animate-fade-in">
            <CardContent className="p-10">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center ml-3">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  الإجابة:
                </h3>
                <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl text-lg leading-relaxed text-white border border-white/20">
                  {answer}
                </div>
              </div>

              {source && (
                <div className="mb-6 p-6 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 rounded-xl border border-amber-400/30">
                  <p className="text-amber-200 font-medium flex items-center">
                    <BookOpen className="w-5 h-5 ml-2" />
                    {source}
                  </p>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={saveToFavorites}
                  variant="outline"
                  className="border-2 border-rose-400 text-rose-400 hover:bg-rose-400 hover:text-white rounded-xl transition-all duration-300"
                >
                  <Bookmark className="w-4 h-4 ml-2" />
                  حفظ في المفضلة
                </Button>

                <Button
                  onClick={shareAnswer}
                  variant="outline"
                  className="border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white rounded-xl transition-all duration-300"
                >
                  <Send className="w-4 h-4 ml-2" />
                  مشاركة الإجابة
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-slate-300">
          <div className="max-w-2xl mx-auto">
            <p className="font-amiri text-xl mb-4 text-amber-200">
              "وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا"
            </p>
            <p className="text-base leading-relaxed">
              الإجابات مبنية على المصادر الإسلامية المعتمدة. للمسائل المعقدة، يُرجى الرجوع لأهل العلم.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-amber-400">
              <Star className="w-4 h-4" />
              <span className="text-sm">بارك الله فيك</span>
              <Star className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
