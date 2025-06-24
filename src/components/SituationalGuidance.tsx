
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, BookOpen, Send, Lightbulb } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SituationalGuidanceProps {
  onSituationSubmit: (situation: string) => void;
  isLoading: boolean;
}

const SituationalGuidance: React.FC<SituationalGuidanceProps> = ({ 
  onSituationSubmit, 
  isLoading 
}) => {
  const [situation, setSituation] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!situation.trim()) {
      toast({
        title: "تنبيه",
        description: "يرجى وصف الموقف أولاً",
        variant: "destructive"
      });
      return;
    }

    onSituationSubmit(situation);
    setSituation('');
  };

  const exampleSituations = [
    "أخذت شيئاً بالخطأ ولا أعرف كيف أرده",
    "تأخرت عن صلاة جماعة بسبب العمل",
    "صديقي يطلب مني كذبة بيضاء لمساعدته",
    "أشك في حلال المال الذي أكسبه",
    "أريد التوبة من ذنب أكرره",
  ];

  return (
    <Card className="mb-6 bg-gradient-to-r from-rose-50 to-orange-50 border-rose-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-6 h-6 text-rose-600" />
          <h3 className="text-lg font-semibold text-slate-800">اسألني عن موقف</h3>
          <Lightbulb className="w-5 h-5 text-orange-500" />
        </div>

        <p className="text-slate-600 mb-4 text-sm">
          واجهت موقفاً محيراً؟ اكتب ما حدث معك وسأرشدك للحل الشرعي المناسب
        </p>

        <div className="space-y-4">
          <Textarea
            placeholder="مثال: سرقت بالخطأ ومش عارف أرجع الحاجة... اكتب موقفك هنا"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            className="min-h-[100px] border-2 border-rose-200 focus:border-rose-400 bg-white/70 text-slate-800"
            disabled={isLoading}
          />

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !situation.trim()}
            className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Send className="w-4 h-4 ml-2" />
            )}
            احصل على الإرشاد الشرعي
          </Button>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700 mb-2">أمثلة على مواقف:</p>
          <div className="grid gap-2">
            {exampleSituations.map((example, index) => (
              <button
                key={index}
                onClick={() => setSituation(example)}
                className="text-right p-2 rounded-lg bg-white/50 border border-rose-200 hover:bg-rose-100 text-sm text-slate-700 transition-colors"
                disabled={isLoading}
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 p-3 bg-white/60 rounded-lg border border-rose-200">
          <div className="flex items-center gap-2 text-rose-700">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">
              ستحصل على إرشاد شرعي مع الأدلة من القرآن والسنة
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SituationalGuidance;
