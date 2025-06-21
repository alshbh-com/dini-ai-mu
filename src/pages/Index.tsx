
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

      let { data: todayStats, error: statsError } = await supabase
        .from('stats')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      if (statsError) {
        console.error("Error fetching today's stats:", statsError);
        return;
      }

      if (!todayStats) {
        const { data: newStats, error: insertError } = await supabase
          .from('stats')
          .insert({ 
            date: today, 
            daily_users: 1, 
            total_questions: 0 
          })
          .select()
          .maybeSingle();

        if (insertError) {
          console.error("Error inserting today's stats:", insertError);
          return;
        }
        todayStats = newStats;
      }

      const { count: questionsCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('user_ip', userID);

      setQuestionsToday(questionsCount || 0);

      if (todayStats) {
        const { error: updateError } = await supabase
          .from('stats')
          .update({ daily_users: (todayStats.daily_users || 0) + 1 })
          .eq('date', today);

        if (updateError) {
          console.error("Error updating daily users:", updateError);
        }
      }

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
      
      const response = await fetch('/api/ask-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: questionWithID,
          subscription: subscription ? true : false
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في الحصول على الإجابة');
      }

      const data = await response.json();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DuaaHeader />
      <div className="flex items-center justify-center py-12">
        <div className="container mx-auto max-w-2xl">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-2">
                <Brain className="w-8 h-8 text-blue-600" />
                مُعينك الديني
              </CardTitle>
              <CardDescription className="text-slate-600">
                اسأل سؤالك وسنجيب عليك من القرآن والسنة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">السؤال</Label>
                <Input
                  id="question"
                  placeholder="اكتب سؤالك هنا..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
              <div className="flex justify-between items-center">
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري البحث
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      إرسال السؤال
                    </>
                  )}
                </Button>
                {!subscription && (
                  <Badge variant="secondary">
                    {questionsToday} / 999 سؤال اليوم
                  </Badge>
                )}
              </div>
              {answer && (
                <div className="space-y-2 mt-6">
                  <Label htmlFor="answer">الإجابة</Label>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-slate-700 whitespace-pre-line">{answer}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="text-center mt-4 space-x-4">
            <Link to="/subscription">
              <Button variant="outline">
                <Heart className="w-4 h-4 ml-1" />
                المساهمة
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline">
                <UserCog className="w-4 h-4 ml-1" />
                الإعدادات
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline">
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
