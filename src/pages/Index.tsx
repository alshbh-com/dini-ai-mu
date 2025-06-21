
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Brain, Book, Loader2, MessageSquare, UserCog, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import DuaaHeader from "@/components/DuaaHeader";

const Index = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [questionsToday, setQuestionsToday] = useState(0);
  const [subscription, setSubscription] = useState<any>(null);

  const generateUserID = () => {
    const existing = localStorage.getItem('userID');
    if (existing) return existing;
    
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const userID = `USER_${timestamp}_${random}`.toUpperCase();
    localStorage.setItem('userID', userID);
    return userID;
  };

  useEffect(() => {
    const userID = generateUserID();
    console.log('User ID:', userID);
  }, []);

  useEffect(() => {
    checkSubscriptionStatus();
    updateUserStats();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const userID = generateUserID();
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_ip', userID)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .maybeSingle();

      if (error) {
        console.error("Error checking subscription:", error);
        setSubscription(null);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setSubscription(null);
    }
  };

  const updateUserStats = async () => {
    try {
      const userID = generateUserID();
      const today = new Date().toISOString().split('T')[0];

      const { count: questionsCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('user_ip', userID)
        .gte('created_at', today + 'T00:00:00.000Z')
        .lte('created_at', today + 'T23:59:59.999Z');

      setQuestionsToday(questionsCount || 0);

    } catch (error) {
      console.error("Error updating user stats:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    if (!subscription && questionsToday >= 999) {
      toast({
        title: "وصلت للحد اليومي",
        description: "تم الوصول للحد الأقصى من الأسئلة اليوم. جرب غداً أو فكر في المساهمة الشهرية.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setAnswer("");
    
    try {
      const userID = generateUserID();
      
      const questionWithID = `${question}\n\n[معرف المستخدم: ${userID}]`;
      
      console.log('Sending question to edge function...');
      
      const response = await fetch('https://gndhnoijwexuuayvxwom.supabase.co/functions/v1/ask-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZGhub2lqd2V4dXVheXZ4d29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNzU4NTUsImV4cCI6MjA2NTk1MTg1NX0.rOuiEISzdVlvJvuKm_326YG3Lcl6-mUclcfwSsBDNrQ'}`,
        },
        body: JSON.stringify({ 
          question: questionWithID,
          subscription: subscription ? true : false
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error('فشل في الحصول على الإجابة');
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.answer) {
        setAnswer(data.answer);

        const { error: saveError } = await supabase
          .from('questions')
          .insert({
            question: question,
            answer: data.answer,
            user_ip: userID,
            source: data.source || null
          });

        if (saveError) {
          console.error('Error saving question:', saveError);
        }

        await updateUserStats();
      } else {
        throw new Error('لم يتم استلام إجابة');
      }

    } catch (error) {
      console.error('Error asking question:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في الحصول على الإجابة. جرب مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <DuaaHeader />
      <div className="flex items-center justify-center py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-4xl font-bold text-slate-700 flex items-center justify-center gap-3 mb-2">
                <Brain className="w-10 h-10 text-indigo-600" />
                مُعينك الديني
              </CardTitle>
              <CardDescription className="text-slate-500 text-lg">
                اسأل سؤالك وسنجيب عليك من القرآن والسنة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="space-y-3">
                <Label htmlFor="question" className="text-slate-600 font-medium">السؤال</Label>
                <Input
                  id="question"
                  placeholder="اكتب سؤالك هنا..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="border-slate-200 focus:border-indigo-400 focus:ring-indigo-200 rounded-xl py-3 px-4 text-lg bg-slate-50/50"
                />
              </div>
              <div className="flex justify-between items-center pt-2">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      جاري البحث...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-5 w-5" />
                      إرسال السؤال
                    </>
                  )}
                </Button>
                {!subscription && (
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">
                    {questionsToday} / 999 سؤال اليوم
                  </Badge>
                )}
              </div>
              {answer && (
                <div className="space-y-3 mt-8">
                  <Label htmlFor="answer" className="text-slate-600 font-medium">الإجابة</Label>
                  <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30">
                    <CardContent className="pt-6">
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed text-lg">{answer}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="text-center mt-6 space-x-4 flex justify-center gap-4 flex-wrap">
            <Link to="/subscription">
              <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6 py-3">
                <Heart className="w-4 h-4 ml-1" />
                المساهمة
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6 py-3">
                <UserCog className="w-4 h-4 ml-1" />
                الإعدادات
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6 py-3">
                <Book className="w-4 h-4 ml-1" />
                عن التطبيق
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
