
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Mic, Send, Heart, Settings, Star, Crown, Bookmark, Sparkles, Moon, Shield, Menu, X, Volume2, Calendar, Award, Users, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import PrayerReminder from "@/components/PrayerReminder";
import DuaaHeader from "@/components/DuaaHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import AdminPanel from "@/components/AdminPanel";
import AnswerFeedback from "@/components/AnswerFeedback";
import { supabase } from "@/integrations/supabase/client";
import { getUserIdentifier } from "@/utils/userIdentifier";
import FreeTrialManager from "@/components/FreeTrialManager";

const Index = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState("");
  const [dailyQuestions, setDailyQuestions] = useState(10);
  const [isRecording, setIsRecording] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const [userIdentifier, setUserIdentifier] = useState("");
  const [currentQuestionId, setCurrentQuestionId] = useState<string>("");
  const { toast } = useToast();

  // Load daily questions limit and subscription status
  useEffect(() => {
    const identifier = getUserIdentifier();
    setUserIdentifier(identifier);
    loadDailyLimit();
    checkSubscriptionStatus(identifier);
  }, []);

  const checkSubscriptionStatus = async (userId: string) => {
    try {
      console.log("التحقق من حالة الاشتراك للمستخدم:", userId);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_ip', userId)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error checking subscription:", error);
      } else {
        console.log("نتيجة التحقق من الاشتراك:", data);
        setSubscription(data);
        
        if (data) {
          // تحديد نوع الاشتراك والأسئلة المتاحة
          if (data.subscription_type === 'free_trial') {
            const endDate = new Date(data.end_date);
            const now = new Date();
            const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            console.log(`التجربة المجانية - أيام متبقية: ${daysLeft}`);
            
            if (daysLeft > 0) {
              setDailyQuestions(999); // أسئلة غير محدودة للتجربة المجانية
            } else {
              // انتهت فترة التجربة المجانية
              setSubscription(null);
              setDailyQuestions(10);
              console.log("انتهت فترة التجربة المجانية - العودة للوضع المجاني");
            }
          } else {
            setDailyQuestions(999); // أسئلة غير محدودة للمشتركين المدفوعين
            console.log("اشتراك مدفوع نشط");
          }
        } else {
          console.log("لا يوجد اشتراك نشط");
          setDailyQuestions(10);
        }
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setIsSubscriptionLoading(false);
    }
  };

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
            setDailyQuestions(parseInt(data.setting_value) || 10);
            localStorage.setItem("dailyQuestions", JSON.stringify({ 
              date: today, 
              count: parseInt(data.setting_value) || 10
            }));
          }
        } else {
          setDailyQuestions(parseInt(data.setting_value) || 10);
        }
      }
    } catch (error) {
      console.error("Error loading daily limit:", error);
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

    if (!subscription && dailyQuestions <= 0) {
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
    setCurrentQuestionId("");

    try {
      let promptText = "";
      const questionLower = question.toLowerCase();
      
      if (questionLower.includes("مطور") || questionLower.includes("صانع") || questionLower.includes("من صنع") || questionLower.includes("معلومات التطبيق")) {
        promptText = `هذا التطبيق تم تطويره من قبل:
        - المطور: محمد عبد العظيم علي
        - الجنسية: مصري
        - العمر: 19 عام
        - اسم الشركة: Alshbh
        - رقم التواصل واتساب: +201204486263
        
        التطبيق يهدف لنشر العلم الشرعي وخدمة المسلمين بتقديم إجابات من القرآن والسنة.
        
        أما بالنسبة لسؤالك: ${question}`;
      } else {
        promptText = subscription 
          ? `أنت مساعد ديني إسلامي متخصص. أجب على السؤال التالي بناءً على القرآن الكريم والسنة النبوية الصحيحة. قدم إجابة مفصلة وشاملة مع ذكر المصادر والأدلة.

          قواعد مهمة:
          - لا تفتي في مسائل الدماء أو الطلاق أو التكفير
          - إذا لم تكن متأكداً من الإجابة، انصح بالرجوع لأهل العلم
          - اذكر المصدر مع رقم الآية أو الحديث إن أمكن
          - قدم الإجابة بتفصيل مناسب مع الشرح
          
          السؤال: ${question}`
          : `أنت مساعد ديني إسلامي. أجب على السؤال التالي بناءً على القرآن الكريم والسنة النبوية الصحيحة فقط. 
          
          قواعد مهمة:
          - لا تفتي في مسائل الدماء أو الطلاق أو التكفير
          - إذا لم تكن متأكداً من الإجابة، انصح بالرجوع لأهل العلم
          - اذكر المصدر إذا توفر (آية قرآنية أو حديث صحيح)
          - كن مختصراً ومفيداً
          
          السؤال: ${question}`;
      }

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
                text: promptText
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
          sourceText = subscription 
            ? "المصدر: من القرآن الكريم والسنة النبوية الصحيحة - إجابة مفصلة للمشتركين"
            : "المصدر: من القرآن الكريم والسنة النبوية الصحيحة";
          setSource(sourceText);
        }

        // Save to database and get the question ID
        const { data: questionData, error } = await supabase
          .from('questions')
          .insert({
            question,
            answer: responseText,
            source: sourceText,
            user_ip: userIdentifier
          })
          .select('id')
          .single();

        if (questionData) {
          setCurrentQuestionId(questionData.id);
        }

        if (!subscription) {
          const newCount = dailyQuestions - 1;
          setDailyQuestions(newCount);
          const today = new Date().toDateString();
          localStorage.setItem("dailyQuestions", JSON.stringify({ date: today, count: newCount }));
        }

        await updateStats();

        const remainingMessage = subscription 
          ? "أسئلة غير محدودة للمشتركين"
          : `باقي لديك ${dailyQuestions - 1} أسئلة اليوم`;

        toast({
          title: "تم الحصول على الإجابة",
          description: remainingMessage
        });

        setQuestion("");
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
      if (!subscription) {
        const { count } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_ip', userIdentifier);

        if (count && count >= 20) {
          toast({
            title: "تم الوصول للحد الأقصى",
            description: "المستخدمون المجانيون يمكنهم حفظ 20 عنصر فقط. اشترك للحصول على حفظ غير محدود",
            variant: "destructive"
          });
          return;
        }
      }

      const { data: questionData } = await supabase
        .from('questions')
        .select('id')
        .eq('question', question || "السؤال الحالي")
        .eq('user_ip', userIdentifier)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (questionData) {
        await supabase
          .from('favorites')
          .insert({
            question_id: questionData.id,
            user_ip: userIdentifier
          });

        toast({
          title: "تم الحفظ",
          description: subscription 
            ? "تم إضافة السؤال والإجابة للمفضلة (حفظ غير محدود للمشتركين)"
            : "تم إضافة السؤال والإجابة للمفضلة"
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
    
    const shareText = `السؤال: ${question || "سؤال مخفي"}\n\nالإجابة: ${answer}\n\n${source}\n\nمن تطبيق: اسأل في الدين\nتطوير: محمد عبد العظيم علي\nواتساب: +201204486263\nمعرف المستخدم: ${userIdentifier}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "اسأل في الدين",
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

  const playAnswerAudio = () => {
    if (!subscription) {
      toast({
        title: "ميزة المشتركين",
        description: "الدعم الصوتي متاح للمشتركين فقط",
        variant: "destructive"
      });
      return;
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(answer);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
      
      toast({
        title: "تم تشغيل الصوت",
        description: "ميزة الدعم الصوتي للمشتركين"
      });
    } else {
      toast({
        title: "غير مدعوم",
        description: "المتصفح لا يدعم تقنية تحويل النص لصوت",
        variant: "destructive"
      });
    }
  };

  if (showAdminPanel) {
    return <AdminPanel onClose={() => setShowAdminPanel(false)} />;
  }

  if (isSubscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-slate-600 mt-4">جاري التحقق من حالة الاشتراك...</p>
        </div>
      </div>
    );
  }

  const getSubscriptionStatus = () => {
    if (!subscription) return "مستخدم جديد - احصل على 15 يوم مجاناً!";
    
    if (subscription.subscription_type === 'free_trial') {
      const endDate = new Date(subscription.end_date);
      const now = new Date();
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft > 0) {
        return `🎁 تجربة مجانية - ${daysLeft} يوم متبقي`;
      } else {
        return "انتهت التجربة المجانية";
      }
    }
    
    return "مشترك مميز 👑";
  };

  const getSubscriptionBadgeColor = () => {
    if (!subscription) return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
    
    if (subscription.subscription_type === 'free_trial') {
      const endDate = new Date(subscription.end_date);
      const now = new Date();
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft > 0) {
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      } else {
        return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white';
      }
    }
    
    return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <FreeTrialManager />
      <DuaaHeader />
      
      {subscription && <PrayerReminder />}

      <div className="container mx-auto px-3 py-4">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              <Sparkles className="w-3 h-3 text-blue-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-amiri text-slate-800">اسأل في الدين</h1>
              <p className="text-indigo-600 text-xs md:text-sm">دليلك الموثوق للمعرفة الإسلامية</p>
              <Badge className={`text-xs mt-1 ${getSubscriptionBadgeColor()}`}>
                <Crown className="w-3 h-3 ml-1" />
                {getSubscriptionStatus()}
              </Badge>
            </div>
          </div>
          
          <Button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            variant="outline"
            size="sm"
            className="md:hidden border-slate-400 text-slate-600"
          >
            {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>

          <div className="hidden md:flex gap-2">
            <Button
              onClick={() => setShowAdminPanel(true)}
              variant="outline"
              size="sm"
              className="border-red-400 text-red-600 hover:bg-red-50"
            >
              <Shield className="w-4 h-4 ml-1" />
              الإدارة
            </Button>
            <Link to="/favorites">
              <Button variant="outline" size="sm" className="border-indigo-400 text-indigo-600 hover:bg-indigo-50">
                <Heart className="w-4 h-4 ml-1" />
                المفضلة
              </Button>
            </Link>
            <Link to="/subscription">
              <Button variant="outline" size="sm" className="border-purple-400 text-purple-600 hover:bg-purple-50">
                <Crown className="w-4 h-4 ml-1" />
                الاشتراك
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" size="sm" className="border-slate-400 text-slate-600 hover:bg-slate-50">
                <Settings className="w-4 h-4 ml-1" />
                الإعدادات
              </Button>
            </Link>
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden mb-6 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 shadow-lg">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => {
                  setShowAdminPanel(true);
                  setShowMobileMenu(false);
                }}
                variant="outline"
                size="sm"
                className="border-red-400 text-red-600 hover:bg-red-50 w-full"
              >
                <Shield className="w-4 h-4 ml-1" />
                الإدارة
              </Button>
              <Link to="/favorites">
                <Button variant="outline" size="sm" className="border-indigo-400 text-indigo-600 hover:bg-indigo-50 w-full">
                  <Heart className="w-4 h-4 ml-1" />
                  المفضلة
                </Button>
              </Link>
              <Link to="/subscription">
                <Button variant="outline" size="sm" className="border-purple-400 text-purple-600 hover:bg-purple-50 w-full">
                  <Crown className="w-4 h-4 ml-1" />
                  الاشتراك
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="outline" size="sm" className="border-slate-400 text-slate-600 hover:bg-slate-50 w-full">
                  <Settings className="w-4 h-4 ml-1" />
                  الإعدادات
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs text-slate-600 border border-slate-200">
            <Users className="w-3 h-3" />
            معرف المستخدم: {userIdentifier.substring(0, 20)}...
          </div>
        </div>

        <div className="text-center mb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-sm md:text-base shadow-lg ${getSubscriptionBadgeColor()}`}>
            {subscription ? <Crown className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
            {subscription ? 
              (subscription.subscription_type === 'free_trial' ? 
                `أسئلة غير محدودة - ${getSubscriptionStatus()}` : 
                "أسئلة غير محدودة - مشترك مميز"
              ) : 
              `الأسئلة المتبقية اليوم: ${dailyQuestions}`
            }
            <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
          </div>
        </div>

        
        <Card className="max-w-4xl mx-auto mb-6 shadow-xl border border-indigo-100 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 md:p-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
                <Star className="w-5 h-5 md:w-6 md:h-6 text-indigo-500 animate-pulse" />
                <h2 className="text-lg md:text-xl font-amiri text-slate-800">
                  اسأل ما شئت، نجيبك بإذن الله من الكتاب والسنة
                </h2>
                <Star className="w-5 h-5 md:w-6 md:h-6 text-indigo-500 animate-pulse" />
              </div>
              <p className="text-slate-600 text-sm md:text-base">
                {subscription 
                  ? "احصل على إجابات مفصلة وشاملة مع المصادر - للمشتركين المميزين"
                  : "احصل على إجابات موثوقة من القرآن الكريم والسنة النبوية الصحيحة"
                }
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="اكتب سؤالك الديني هنا..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[120px] md:min-h-[140px] text-base md:text-lg border-2 border-indigo-200 focus:border-indigo-400 bg-white/50 backdrop-blur-sm text-slate-800 placeholder:text-slate-500 rounded-xl"
                  disabled={isLoading}
                />
                <div className="absolute top-3 right-3">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={askQuestion}
                  disabled={isLoading || (!subscription && dailyQuestions <= 0)}
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                >
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <Send className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                      اسأل الآن
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-3 md:px-6 md:py-4 text-base md:text-lg rounded-xl transition-all duration-300 w-full sm:w-auto"
                  disabled={isRecording}
                >
                  <Mic className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                  تسجيل صوتي
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {answer && (
          <Card className="max-w-4xl mx-auto mb-6 shadow-xl border border-green-100 bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm animate-fade-in">
            <CardContent className="p-4 md:p-8">
              <div className="mb-4">
                <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-3 flex items-center">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center ml-2">
                    <Star className="w-3 h-3 md:w-5 md:h-5 text-white" />
                  </div>
                  الإجابة:
                  {subscription && (
                    <Badge className="bg-purple-600 text-white text-xs mr-2">
                      <Crown className="w-3 h-3 ml-1" />
                      مفصلة للمشتركين
                    </Badge>
                  )}
                </h3>
                <div className="bg-white/60 backdrop-blur-sm p-4 md:p-6 rounded-xl text-sm md:text-base leading-relaxed text-slate-800 border border-green-200">
                  {answer}
                </div>
              </div>

              {source && (
                <div className="mb-4 p-3 md:p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                  <p className="text-sm md:text-base text-indigo-700 font-medium flex items-center">
                    <BookOpen className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                    {source}
                  </p>
                </div>
              )}

              {/* أزرار التقييم والإبلاغ */}
              <AnswerFeedback 
                questionId={currentQuestionId}
                answer={answer}
              />

              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                <Button
                  onClick={saveToFavorites}
                  variant="outline"
                  className="border-2 border-rose-300 text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-300 w-full sm:w-auto"
                >
                  <Bookmark className="w-4 h-4 ml-2" />
                  حفظ في المفضلة
                </Button>

                <Button
                  onClick={shareAnswer}
                  variant="outline"
                  className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 w-full sm:w-auto"
                >
                  <Send className="w-4 h-4 ml-2" />
                  مشاركة الإجابة
                </Button>

                {subscription && (
                  <Button
                    onClick={playAnswerAudio}
                    variant="outline"
                    className="border-2 border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300 w-full sm:w-auto"
                  >
                    <Volume2 className="w-4 h-4 ml-2" />
                    تشغيل صوتي
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="bg-white/70 backdrop-blur-sm border border-blue-200">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-slate-800 mb-1">10 أسئلة يومياً</h3>
              <p className="text-xs text-slate-600">مجاناً للجميع</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border border-green-200">
            <CardContent className="p-4 text-center">
              <Bookmark className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold text-slate-800 mb-1">20 مفضلة</h3>
              <p className="text-xs text-slate-600">احفظ إجاباتك المهمة</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border border-purple-200">
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold text-slate-800 mb-1">مصادر موثوقة</h3>
              <p className="text-xs text-slate-600">من القرآن والسنة</p>
            </CardContent>
          </Card>
        </div>

        {subscription && (
          <Card className="max-w-4xl mx-auto mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-center mb-4 text-purple-800 flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6" />
                المميزات الحصرية للمشتركين
              </h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <Volume2 className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium">دعم صوتي</p>
                </div>
                <div className="text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium">تذكير الصلاة</p>
                </div>
                <div className="text-center">
                  <Trophy className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium">مسابقات شهرية</p>
                </div>
                <div className="text-center">
                  <Star className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium">إجابات مفصلة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-8 text-slate-600">
          <div className="max-w-2xl mx-auto px-4">
            <p className="font-amiri text-lg md:text-xl mb-3 text-indigo-700">
              "وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا"
            </p>
            <p className="text-sm md:text-base leading-relaxed mb-2">
              الإجابات مبنية على المصادر الإسلامية المعتمدة. للمسائل المعقدة، يُرجى الرجوع لأهل العلم.
            </p>
            <p className="text-xs text-slate-500 mb-4">
              تطوير: محمد عبد العظيم علي - مصر | شركة: Alshbh | واتساب: +201204486263
            </p>
            <div className="flex items-center justify-center gap-2 mt-3 text-indigo-500">
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
