
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Mic, Send, Heart, Settings, Star, Crown, Bookmark, Sparkles, Moon, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import PrayerReminder from "@/components/PrayerReminder";
import DuaaHeader from "@/components/DuaaHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import AdminPanel from "@/components/AdminPanel";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState("");
  const [dailyQuestions, setDailyQuestions] = useState(5);
  const [isRecording, setIsRecording] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { toast } = useToast();

  // Load daily questions limit from database
  useEffect(() => {
    loadDailyLimit();
    loadUserQuestions();
  }, []);

  const loadDailyLimit = async () => {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'daily_question_limit')
        .single();
      
      if (data) {
        const saved = localStorage.getItem("dailyQuestions");
        if (saved) {
          const userData = JSON.parse(saved);
          const today = new Date().toDateString();
          if (userData.date === today) {
            setDailyQuestions(userData.count);
          } else {
            setDailyQuestions(parseInt(data.setting_value));
            localStorage.setItem("dailyQuestions", JSON.stringify({ 
              date: today, 
              count: parseInt(data.setting_value) 
            }));
          }
        } else {
          setDailyQuestions(parseInt(data.setting_value));
        }
      }
    } catch (error) {
      console.error("Error loading daily limit:", error);
    }
  };

  const loadUserQuestions = async () => {
    try {
      const userIP = await getUserIP();
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('user_ip', userIP)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0) {
        setQuestion(data[0].question);
        setAnswer(data[0].answer);
        setSource(data[0].source || "");
      }
    } catch (error) {
      console.error("Error loading user questions:", error);
    }
  };

  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'anonymous';
    }
  };

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
      
      if (data.candidates && data.candidates[0]) {
        const responseText = data.candidates[0].content.parts[0].text;
        setAnswer(responseText);
        
        let sourceText = "";
        if (responseText.includes("القرآن") || responseText.includes("الحديث") || responseText.includes("البخاري") || responseText.includes("مسلم")) {
          sourceText = "المصدر: من القرآن الكريم والسنة النبوية الصحيحة";
          setSource(sourceText);
        }

        // Save to database
        const userIP = await getUserIP();
        await supabase
          .from('questions')
          .insert({
            question,
            answer: responseText,
            source: sourceText,
            user_ip: userIP
          });

        // Update daily questions count
        const newCount = dailyQuestions - 1;
        setDailyQuestions(newCount);
        const today = new Date().toDateString();
        localStorage.setItem("dailyQuestions", JSON.stringify({ date: today, count: newCount }));

        // Update stats
        await updateStats();

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

  const updateStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: existingStats } = await supabase
        .from('stats')
        .select('*')
        .eq('date', today)
        .single();

      if (existingStats) {
        await supabase
          .from('stats')
          .update({
            total_questions: existingStats.total_questions + 1,
            daily_users: existingStats.daily_users + 1
          })
          .eq('date', today);
      } else {
        await supabase
          .from('stats')
          .insert({
            date: today,
            total_questions: 1,
            daily_users: 1
          });
      }
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  };

  const saveToFavorites = async () => {
    if (!answer) return;
    
    try {
      const userIP = await getUserIP();
      const { data: questionData } = await supabase
        .from('questions')
        .select('id')
        .eq('question', question)
        .eq('user_ip', userIP)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (questionData) {
        await supabase
          .from('favorites')
          .insert({
            question_id: questionData.id,
            user_ip: userIP
          });

        toast({
          title: "تم الحفظ",
          description: "تم إضافة السؤال والإجابة للمفضلة"
        });
      }
    } catch (error) {
      console.error("Error saving to favorites:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ السؤال",
        variant: "destructive"
      });
    }
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

  if (showAdminPanel) {
    return <AdminPanel onClose={() => setShowAdminPanel(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with Duaa */}
      <DuaaHeader />
      
      {/* Prayer Reminder */}
      <PrayerReminder />

      {/* Navigation */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BookOpen className="w-10 h-10 text-indigo-600" />
              <Sparkles className="w-4 h-4 text-blue-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-amiri text-slate-800">مُعينك الديني</h1>
              <p className="text-indigo-600 text-sm">دليلك الموثوق للمعرفة الإسلامية</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAdminPanel(true)}
              variant="outline"
              size="sm"
              className="border-red-400 text-red-600 hover:bg-red-50 transition-all duration-300"
            >
              <Shield className="w-4 h-4 ml-1" />
              الإدارة
            </Button>
            <Link to="/favorites">
              <Button variant="outline" size="sm" className="border-indigo-400 text-indigo-600 hover:bg-indigo-50 transition-all duration-300">
                <Heart className="w-4 h-4 ml-1" />
                المفضلة
              </Button>
            </Link>
            <Link to="/subscription">
              <Button variant="outline" size="sm" className="border-purple-400 text-purple-600 hover:bg-purple-50 transition-all duration-300">
                <Crown className="w-4 h-4 ml-1" />
                الاشتراك
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" size="sm" className="border-slate-400 text-slate-600 hover:bg-slate-50 transition-all duration-300">
                <Settings className="w-4 h-4 ml-1" />
                الإعدادات
              </Button>
            </Link>
          </div>
        </div>

        {/* Daily Questions Counter */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
            <Moon className="w-5 h-5" />
            الأسئلة المتبقية اليوم: {dailyQuestions}
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Main Question Card */}
        <Card className="max-w-4xl mx-auto mb-8 shadow-xl border border-indigo-100 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-10">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="w-6 h-6 text-indigo-500 animate-pulse" />
                <h2 className="text-2xl font-amiri text-slate-800">
                  اسأل ما شئت، نجيبك بإذن الله من الكتاب والسنة
                </h2>
                <Star className="w-6 h-6 text-indigo-500 animate-pulse" />
              </div>
              <p className="text-slate-600 text-lg">
                احصل على إجابات موثوقة من القرآن الكريم والسنة النبوية الصحيحة
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <Textarea
                  placeholder="اكتب سؤالك الديني هنا..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[140px] text-lg border-2 border-indigo-200 focus:border-indigo-400 bg-white/50 backdrop-blur-sm text-slate-800 placeholder:text-slate-500 rounded-xl"
                  disabled={isLoading}
                />
                <div className="absolute top-4 right-4">
                  <BookOpen className="w-6 h-6 text-indigo-400" />
                </div>
              </div>

              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  onClick={askQuestion}
                  disabled={isLoading || dailyQuestions <= 0}
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-10 py-4 text-lg font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
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
                  className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg rounded-xl transition-all duration-300"
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
          <Card className="max-w-4xl mx-auto mb-8 shadow-xl border border-green-100 bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm animate-fade-in">
            <CardContent className="p-10">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center ml-3">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  الإجابة:
                </h3>
                <div className="bg-white/60 backdrop-blur-sm p-8 rounded-xl text-lg leading-relaxed text-slate-800 border border-green-200">
                  {answer}
                </div>
              </div>

              {source && (
                <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                  <p className="text-indigo-700 font-medium flex items-center">
                    <BookOpen className="w-5 h-5 ml-2" />
                    {source}
                  </p>
                </div>
              )}

              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  onClick={saveToFavorites}
                  variant="outline"
                  className="border-2 border-rose-300 text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-300"
                >
                  <Bookmark className="w-4 h-4 ml-2" />
                  حفظ في المفضلة
                </Button>

                <Button
                  onClick={shareAnswer}
                  variant="outline"
                  className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                >
                  <Send className="w-4 h-4 ml-2" />
                  مشاركة الإجابة
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-slate-600">
          <div className="max-w-2xl mx-auto">
            <p className="font-amiri text-xl mb-4 text-indigo-700">
              "وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا"
            </p>
            <p className="text-base leading-relaxed">
              الإجابات مبنية على المصادر الإسلامية المعتمدة. للمسائل المعقدة، يُرجى الرجوع لأهل العلم.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-indigo-500">
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
