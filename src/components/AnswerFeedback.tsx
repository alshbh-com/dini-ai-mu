
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, MessageSquare, Star } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getUserIdentifier } from "@/utils/userIdentifier";

interface AnswerFeedbackProps {
  questionId?: string;
  answer: string;
  onFeedback: (helpful: boolean, comment?: string) => void;
}

const AnswerFeedback: React.FC<AnswerFeedbackProps> = ({ questionId, answer, onFeedback }) => {
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const { toast } = useToast();

  const handleFeedback = async (isHelpful: boolean) => {
    try {
      const userIdentifier = getUserIdentifier();
      
      // Save feedback to database
      await supabase
        .from('answer_feedback')
        .insert({
          question_id: questionId,
          user_ip: userIdentifier,
          is_helpful: isHelpful,
          comment: comment || null,
          answer_text: answer.substring(0, 1000) // Store first 1000 chars
        });

      setFeedback(isHelpful ? 'helpful' : 'not-helpful');
      onFeedback(isHelpful, comment);

      toast({
        title: "شكراً لك",
        description: isHelpful 
          ? "تم تسجيل تقييمك الإيجابي - سيساعد في تحسين الإجابات"
          : "شكراً لملاحظتك - سنعمل على تحسين جودة الإجابات",
      });

      if (!isHelpful) {
        setShowComment(true);
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ التقييم",
        variant: "destructive"
      });
    }
  };

  if (feedback && !showComment) {
    return (
      <Card className="bg-green-50 border-green-200 mt-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-700">
            <Star className="w-5 h-5" />
            <span className="font-medium">تم حفظ تقييمك - بارك الله فيك</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 border-slate-200">
      <CardContent className="p-4">
        <div className="text-center">
          <p className="text-slate-700 font-medium mb-4">هل كانت هذه الإجابة مفيدة؟</p>
          
          <div className="flex gap-4 justify-center mb-4">
            <Button
              onClick={() => handleFeedback(true)}
              variant="outline"
              className="flex items-center gap-2 border-green-300 text-green-600 hover:bg-green-50"
              disabled={feedback !== null}
            >
              <ThumbsUp className="w-4 h-4" />
              مفيدة
            </Button>
            
            <Button
              onClick={() => handleFeedback(false)}
              variant="outline"
              className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
              disabled={feedback !== null}
            >
              <ThumbsDown className="w-4 h-4" />
              غير مفيدة
            </Button>
          </div>

          {showComment && (
            <div className="mt-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="اختياري: كيف يمكننا تحسين الإجابة؟"
                className="w-full p-3 border border-slate-300 rounded-lg text-sm"
                rows={3}
              />
              <Button
                onClick={() => {
                  setShowComment(false);
                  toast({
                    title: "شكراً لك",
                    description: "تم حفظ ملاحظتك وسنعمل على التحسين"
                  });
                }}
                className="mt-2 bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <MessageSquare className="w-4 h-4 ml-1" />
                إرسال الملاحظة
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnswerFeedback;
