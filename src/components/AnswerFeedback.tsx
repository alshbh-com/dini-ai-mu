
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getUserIdentifier } from "@/utils/userIdentifier";

interface AnswerFeedbackProps {
  questionId?: string;
  answer: string;
}

const AnswerFeedback = ({ questionId, answer }: AnswerFeedbackProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const { toast } = useToast();

  const submitFeedback = async (type: 'helpful' | 'inappropriate') => {
    if (isSubmitting || hasVoted) return;
    
    setIsSubmitting(true);
    
    try {
      const userIdentifier = getUserIdentifier();
      
      // إدراج التقييم في قاعدة البيانات
      const { error } = await supabase
        .from('content_reports')
        .insert({
          question_id: questionId,
          user_ip: userIdentifier,
          report_type: type,
          comment: type === 'inappropriate' ? 'محتوى مسيء' : 'إجابة مفيدة'
        });

      if (error) {
        console.error('Error submitting feedback:', error);
        throw error;
      }

      // تحديث عداد التقييمات في جدول الأسئلة
      if (questionId) {
        const updateField = type === 'helpful' ? 'helpful_count' : 'report_count';
        await supabase.rpc('increment', {
          table_name: 'questions',
          row_id: questionId,
          column_name: updateField
        });
      }

      setHasVoted(true);
      
      toast({
        title: type === 'helpful' ? "شكراً لك!" : "تم الإبلاغ",
        description: type === 'helpful' 
          ? "تم تسجيل تقييمك الإيجابي" 
          : "تم إرسال البلاغ وسيتم مراجعته"
      });

    } catch (error) {
      console.error('Feedback error:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إرسال التقييم. حاول مرة أخرى",
        variant: "destructive"
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="flex gap-3 justify-center mt-4">
      <Button
        onClick={() => submitFeedback('helpful')}
        disabled={isSubmitting || hasVoted}
        variant="outline"
        size="sm"
        className="border-2 border-green-300 text-green-600 hover:bg-green-50 transition-all duration-300"
      >
        <ThumbsUp className="w-4 h-4 ml-2" />
        مفيد
      </Button>
      
      <Button
        onClick={() => submitFeedback('inappropriate')}
        disabled={isSubmitting || hasVoted}
        variant="outline"
        size="sm"
        className="border-2 border-red-300 text-red-600 hover:bg-red-50 transition-all duration-300"
      >
        <Flag className="w-4 h-4 ml-2" />
        إبلاغ عن محتوى مسيء
      </Button>
    </div>
  );
};

export default AnswerFeedback;
