
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, BookOpen, CheckCircle, XCircle, Star } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getUserIdentifier } from "@/utils/userIdentifier";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  source: string;
}

const DailyQuiz: React.FC = () => {
  const [todayQuestion, setTodayQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hasAnsweredToday, setHasAnsweredToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTodayQuestion();
  }, []);

  const loadTodayQuestion = async () => {
    try {
      const userIdentifier = getUserIdentifier();
      const today = new Date().toISOString().split('T')[0];

      // Check if user already answered today - use any to bypass TypeScript temporarily
      const { data: existingAnswer } = await (supabase as any)
        .from('daily_quiz_answers')
        .select('*')
        .eq('user_ip', userIdentifier)
        .eq('date', today)
        .maybeSingle();

      if (existingAnswer) {
        setHasAnsweredToday(true);
        setShowResult(true);
        setSelectedAnswer(existingAnswer.selected_answer);
      }

      // Get today's question - use any to bypass TypeScript temporarily
      const { data: question } = await (supabase as any)
        .from('daily_quiz_questions')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      if (question) {
        setTodayQuestion({
          id: question.id,
          question: question.question,
          options: question.options,
          correct_answer: question.correct_answer,
          explanation: question.explanation,
          source: question.source
        });
      } else {
        // Generate a random question if no specific question for today
        const questions = [
          {
            id: 'q1',
            question: 'كم عدد أركان الإسلام؟',
            options: ['أربعة', 'خمسة', 'ستة', 'سبعة'],
            correct_answer: 1,
            explanation: 'أركان الإسلام خمسة: الشهادتان، الصلاة، الزكاة، الصوم، الحج',
            source: 'حديث جبريل المشهور'
          },
          {
            id: 'q2',
            question: 'في أي سورة وردت آية الكرسي؟',
            options: ['الفاتحة', 'البقرة', 'آل عمران', 'النساء'],
            correct_answer: 1,
            explanation: 'آية الكرسي هي الآية رقم 255 من سورة البقرة',
            source: 'القرآن الكريم - سورة البقرة'
          },
          {
            id: 'q3',
            question: 'كم عدد الصلوات المفروضة في اليوم؟',
            options: ['ثلاث', 'أربع', 'خمس', 'ست'],
            correct_answer: 2,
            explanation: 'الصلوات المفروضة خمس: الفجر، الظهر، العصر، المغرب، العشاء',
            source: 'فرضت ليلة الإسراء والمعراج'
          }
        ];
        
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        setTodayQuestion(randomQuestion);
      }
    } catch (error) {
      console.error('Error loading daily question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null || !todayQuestion) return;

    try {
      const userIdentifier = getUserIdentifier();
      const today = new Date().toISOString().split('T')[0];
      const isCorrect = selectedAnswer === todayQuestion.correct_answer;

      // Save answer - use any to bypass TypeScript temporarily
      await (supabase as any)
        .from('daily_quiz_answers')
        .insert({
          user_ip: userIdentifier,
          question_id: todayQuestion.id,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          date: today
        });

      setShowResult(true);
      setHasAnsweredToday(true);

      toast({
        title: isCorrect ? "إجابة صحيحة! 🎉" : "إجابة خاطئة",
        description: isCorrect 
          ? "بارك الله فيك - أحسنت"
          : "لا بأس، تعلمنا شيئاً جديداً اليوم",
      });
    } catch (error) {
      console.error('Error saving answer:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ الإجابة",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">جاري تحميل السؤال اليومي...</p>
        </CardContent>
      </Card>
    );
  }

  if (!todayQuestion) {
    return null;
  }

  const isCorrect = selectedAnswer === todayQuestion.correct_answer;

  return (
    <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-800">التقييم الديني اليومي</h3>
          <Star className="w-5 h-5 text-yellow-500" />
        </div>

        <div className="bg-white rounded-lg p-4 mb-4 border border-indigo-100">
          <h4 className="font-medium text-slate-800 mb-4">{todayQuestion.question}</h4>
          
          <div className="space-y-3">
            {todayQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showResult && setSelectedAnswer(index)}
                disabled={showResult}
                className={`w-full text-right p-3 rounded-lg border transition-all ${
                  showResult
                    ? index === todayQuestion.correct_answer
                      ? 'bg-green-100 border-green-400 text-green-800'
                      : index === selectedAnswer && selectedAnswer !== todayQuestion.correct_answer
                      ? 'bg-red-100 border-red-400 text-red-800'
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                    : selectedAnswer === index
                    ? 'bg-indigo-100 border-indigo-400 text-indigo-800'
                    : 'bg-gray-50 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showResult && index === todayQuestion.correct_answer && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {showResult && index === selectedAnswer && selectedAnswer !== todayQuestion.correct_answer && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {!showResult && selectedAnswer !== null && (
          <Button 
            onClick={handleAnswerSubmit}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            تأكيد الإجابة
          </Button>
        )}

        {showResult && (
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-slate-600" />
              <span className="font-medium text-slate-800">الشرح:</span>
            </div>
            <p className="text-slate-700 mb-2">{todayQuestion.explanation}</p>
            <p className="text-sm text-slate-600">
              <strong>المصدر:</strong> {todayQuestion.source}
            </p>
            
            {hasAnsweredToday && (
              <p className="text-center text-indigo-600 font-medium mt-3">
                ✨ تم الإجابة على سؤال اليوم - عودة غداً لسؤال جديد
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyQuiz;
