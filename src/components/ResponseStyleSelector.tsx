
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Zap, GraduationCap, Baby } from 'lucide-react';

export type ResponseStyle = 'brief' | 'detailed' | 'scholarly' | 'beginner';

interface ResponseStyleSelectorProps {
  selectedStyle: ResponseStyle;
  onStyleChange: (style: ResponseStyle) => void;
}

const ResponseStyleSelector: React.FC<ResponseStyleSelectorProps> = ({ 
  selectedStyle, 
  onStyleChange 
}) => {
  const styles = [
    {
      id: 'brief' as ResponseStyle,
      name: 'رد مختصر',
      description: 'إجابة سريعة ومباشرة',
      icon: Zap,
      color: 'blue'
    },
    {
      id: 'detailed' as ResponseStyle,
      name: 'رد مفصل',
      description: 'شرح شامل مع الأدلة',
      icon: BookOpen,
      color: 'green'
    },
    {
      id: 'scholarly' as ResponseStyle,
      name: 'شرح العلماء',
      description: 'آراء الفقهاء والمذاهب',
      icon: GraduationCap,
      color: 'purple'
    },
    {
      id: 'beginner' as ResponseStyle,
      name: 'وضع المبتدئ',
      description: 'تبسيط للأطفال والمبتدئين',
      icon: Baby,
      color: 'orange'
    }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="font-semibold text-slate-800 mb-3 text-center">اختر نوع الإجابة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {styles.map((style) => {
            const Icon = style.icon;
            const isSelected = selectedStyle === style.id;
            
            return (
              <Button
                key={style.id}
                onClick={() => onStyleChange(style.id)}
                variant={isSelected ? "default" : "outline"}
                className={`flex flex-col items-center p-4 h-auto ${
                  isSelected
                    ? `bg-${style.color}-500 hover:bg-${style.color}-600 text-white`
                    : `border-${style.color}-300 text-${style.color}-600 hover:bg-${style.color}-50`
                }`}
              >
                <Icon className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">{style.name}</span>
                <span className="text-xs opacity-75 text-center mt-1">
                  {style.description}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResponseStyleSelector;
