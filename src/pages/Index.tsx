
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Settings, Shield, Heart, Clock, Sparkles, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getUserIdentifier } from "@/utils/userIdentifier";
import PrayerReminder from "@/components/PrayerReminder";
import DuaaHeader from "@/components/DuaaHeader";
import DailyQuiz from "@/components/DailyQuiz";
import VoiceSearch from "@/components/VoiceSearch";
import ResponseStyleSelector from "@/components/ResponseStyleSelector";
import SituationalGuidance from "@/components/SituationalGuidance";
import AnswerFeedback from "@/components/AnswerFeedback";
import AdminPanel from "@/components/AdminPanel";
import FreeTrialManager from "@/components/FreeTrialManager";
import SubscriptionActivation from "@/components/SubscriptionActivation";
import PremiumFeaturesList from "@/components/PremiumFeaturesList";

interface Question {
  id: string;
  question: string;
  answer: string;
  created_at: string;
  source?: string;
}

const Index = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [backgroundImage, setBackgroundImage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadBackgroundImage();
  }, []);

  const loadBackgroundImage = async () => {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'background_image')
        .maybeSingle();

      if (data && data.setting_value) {
        setBackgroundImage(data.setting_value);
      }
    } catch (error) {
      console.error("Error loading background image:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const userIp = await getUserIdentifier();
      
      // Simulate AI response (replace with actual AI integration)
      const response = "هذا مثال على إجابة من الذكاء الاصطناعي. يرجى دمج خدمة الذكاء الاصطناعي الفعلية هنا.";
      
      // Save to database
      const { data, error } = await supabase
        .from('questions')
        .insert({
          question: question.trim(),
          answer: response,
          user_ip: userIp,
          source: "AI Assistant"
        })
        .select()
        .single();

      if (error) throw error;

      setAnswer(response);
      setCurrentQuestion(data);
      
      toast({
        title: "تم الإرسال",
        description: "تم الحصول على الإجابة بنجاح"
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إرسال السؤال",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const backgroundStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed'
  } : {};

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" 
      style={backgroundStyle}
    >
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-amiri text-slate-800">مُعينك الديني</h1>
              <p className="text-slate-600 font-cairo">مساعدك الذكي للأسئلة الدينية</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowAdminPanel(true)}
              variant="outline"
              size="sm"
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              <Shield className="w-4 h-4 ml-1" />
              الإدارة
            </Button>
            <Link to="/settings">
              <Button variant="outline" size="sm" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                <Settings className="w-4 h-4 ml-1" />
                الإعدادات
              </Button>
            </Link>
            <Link to="/favorites">
              <Button variant="outline" size="sm" className="border-rose-500 text-rose-600 hover:bg-rose-50">
                <Heart className="w-4 h-4 ml-1" />
                المحفوظات
              </Button>
            </Link>
          </div>
        </div>

        {/* Prayer Reminder */}
        <PrayerReminder />

        {/* Duaa Header */}
        <DuaaHeader />

        {/* Question Input Form - Moved to top */}
        <Card className="mb-8 shadow-lg border border-blue-200 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800 font-amiri">
              <Sparkles className="w-6 h-6 text-blue-600" />
              اسأل سؤالك الديني
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3">
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="اكتب سؤالك الديني هنا..."
                  className="flex-1 min-h-[100px] text-lg border-blue-200 focus:border-blue-500 font-cairo resize-none"
                  disabled={isLoading}
                />
                <VoiceSearch onTranscript={setQuestion} />
              </div>
              
              <div className="flex gap-3">
                <ResponseStyleSelector />
                <SituationalGuidance />
              </div>

              <Button
                type="submit"
                disabled={!question.trim() || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-bold rounded-xl shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري البحث...
                  </>
                ) : (
                  <>
                    <Send className="ml-2 h-5 w-5" />
                    اسأل الآن
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Answer Display */}
        {answer && (
          <Card className="mb-8 shadow-lg border border-emerald-200 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800 font-amiri">
                <MessageSquare className="w-6 h-6 text-emerald-600" />
                الإجابة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none text-slate-700 font-cairo leading-relaxed">
                {answer.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-lg leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              {currentQuestion && (
                <AnswerFeedback 
                  questionId={currentQuestion.id}
                  answerText={answer}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Daily Quiz */}
        <DailyQuiz />

        {/* Trial Manager */}
        <FreeTrialManager />

        {/* Subscription Activation */}
        <SubscriptionActivation />

        {/* Premium Features */}
        <PremiumFeaturesList />

        {/* Admin Panel Modal */}
        {showAdminPanel && (
          <AdminPanel onClose={() => setShowAdminPanel(false)} />
        )}
      </div>
    </div>
  );
};

export default Index;
