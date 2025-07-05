import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getUserIdentifier } from "@/utils/userIdentifier";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";

interface AnswerFeedbackProps {
  questionId?: string;
  answer: string;
}

interface ReportFormData {
  reason: string;
}

const AnswerFeedback = ({ questionId, answer }: AnswerFeedbackProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ReportFormData>({
    defaultValues: {
      reason: ""
    }
  });

  const submitHelpfulFeedback = async () => {
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
          report_type: 'helpful',
          comment: 'إجابة مفيدة'
        });

      if (error) {
        console.error('Error submitting feedback:', error);
        throw error;
      }

      // تحديث عداد التقييمات في جدول الأسئلة
      if (questionId) {
        // First get the current count
        const { data: currentQuestion } = await supabase
          .from('questions')
          .select('helpful_count, report_count')
          .eq('id', questionId)
          .single();

        if (currentQuestion) {
          const currentCount = currentQuestion.helpful_count || 0;
          
          const { error: updateError } = await supabase
            .from('questions')
            .update({
              helpful_count: currentCount + 1
            })
            .eq('id', questionId);

          if (updateError) {
            console.error('Error updating question count:', updateError);
          }
        }
      }

      setHasVoted(true);
      
      toast({
        title: "شكراً لك!",
        description: "تم تسجيل تقييمك الإيجابي"
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

  const submitReportFeedback = async (data: ReportFormData) => {
    if (isSubmitting || hasVoted) return;
    
    setIsSubmitting(true);
    
    try {
      const userIdentifier = getUserIdentifier();
      
      // إدراج البلاغ في قاعدة البيانات
      const { error } = await supabase
        .from('content_reports')
        .insert({
          question_id: questionId,
          user_ip: userIdentifier,
          report_type: 'inappropriate',
          comment: data.reason
        });

      if (error) {
        console.error('Error submitting report:', error);
        throw error;
      }

      // تحديث عداد البلاغات في جدول الأسئلة
      if (questionId) {
        const { data: currentQuestion } = await supabase
          .from('questions')
          .select('helpful_count, report_count')
          .eq('id', questionId)
          .single();

        if (currentQuestion) {
          const currentCount = currentQuestion.report_count || 0;
          
          const { error: updateError } = await supabase
            .from('questions')
            .update({
              report_count: currentCount + 1
            })
            .eq('id', questionId);

          if (updateError) {
            console.error('Error updating question count:', updateError);
          }
        }
      }

      setHasVoted(true);
      setReportDialogOpen(false);
      form.reset();
      
      toast({
        title: "تم الإبلاغ",
        description: "تم إرسال البلاغ وسيتم مراجعته"
      });

    } catch (error) {
      console.error('Report error:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إرسال البلاغ. حاول مرة أخرى",
        variant: "destructive"
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="flex gap-3 justify-center mt-4">
      <Button
        onClick={submitHelpfulFeedback}
        disabled={isSubmitting || hasVoted}
        variant="outline"
        size="sm"
        className="border-2 border-green-300 text-green-600 hover:bg-green-50 transition-all duration-300"
      >
        <ThumbsUp className="w-4 h-4 ml-2" />
        مفيد
      </Button>
      
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={isSubmitting || hasVoted}
            variant="outline"
            size="sm"
            className="border-2 border-red-300 text-red-600 hover:bg-red-50 transition-all duration-300"
          >
            <Flag className="w-4 h-4 ml-2" />
            إبلاغ عن محتوى مسيء
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-right">إبلاغ عن محتوى مسيء</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitReportFeedback)} className="space-y-4">
              <FormField
                control={form.control}
                name="reason"
                rules={{ required: "يرجى تحديد سبب الإبلاغ" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">سبب الإبلاغ</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="يرجى توضيح السبب في الإبلاغ عن هذا المحتوى..."
                        className="resize-none text-right bg-white"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReportDialogOpen(false)}
                  className="bg-white hover:bg-gray-50"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isSubmitting ? "جاري الإرسال..." : "إرسال البلاغ"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnswerFeedback;
