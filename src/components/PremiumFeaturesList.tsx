
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Feature {
  id: string;
  feature_key: string;
  feature_name_ar: string;
  feature_description_ar: string;
  is_premium: boolean;
}

interface PremiumFeaturesListProps {
  isSubscribed?: boolean;
  showTitle?: boolean;
}

const PremiumFeaturesList = ({ isSubscribed = false, showTitle = true }: PremiumFeaturesListProps) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_features')
        .select('*')
        .eq('is_premium', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error("خطأ في تحميل المميزات:", error);
    }
    setLoading(false);
  };

  const getFeatureIcon = (featureKey: string) => {
    const iconMap: Record<string, string> = {
      unlimited_questions: "♾️",
      detailed_answers: "📝",
      voice_support: "🔊",
      unlimited_favorites: "⭐",
      priority_response: "⚡",
      prayer_reminders: "🕌",
      monthly_contests: "🏆",
      exclusive_channel: "👥",
      custom_support: "🤝",
      early_features: "🚀",
      hadith_audio: "📿",
      quran_recitation: "📖",
      bookmark_categories: "📚",
      offline_mode: "📱",
      advanced_search: "🔍",
      daily_hadith: "☀️",
      islamic_calendar: "📅",
      qibla_direction: "🧭",
      tasbih_counter: "📿",
      dua_collections: "🤲",
      scholar_opinions: "👨‍🏫",
      fatwa_history: "📜",
      translation_support: "🌍",
      weekly_lessons: "🎓",
      ramadan_features: "🌙",
      hajj_guide: "🕋",
      islamic_stories: "📚",
      charity_calculator: "💰",
      islamic_names: "👶",
      community_forum: "💬"
    };
    return iconMap[featureKey] || "✨";
  };

  if (loading) {
    return (
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">جاري تحميل المميزات...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${isSubscribed ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'}`}>
      {showTitle && (
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Crown className="w-6 h-6 text-purple-600" />
            مميزات المساهمة الشهرية
            <Badge className="bg-purple-600 text-white">30 ميزة</Badge>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid gap-3">
          {features.map((feature, index) => (
            <div 
              key={feature.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                isSubscribed 
                  ? 'bg-green-100 border-green-200' 
                  : 'bg-white border-purple-200 hover:border-purple-300'
              }`}
            >
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                  isSubscribed ? 'bg-green-200' : 'bg-purple-100'
                }`}>
                  {isSubscribed ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    getFeatureIcon(feature.feature_key)
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-800 text-sm">
                    {feature.feature_name_ar}
                  </h4>
                  {isSubscribed && (
                    <Badge className="bg-green-600 text-white text-xs">مفعلة</Badge>
                  )}
                  {index < 10 && !isSubscribed && (
                    <Badge variant="outline" className="text-xs border-purple-400 text-purple-600">
                      الأكثر طلباً
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {feature.feature_description_ar}
                </p>
              </div>
              
              <div className="flex-shrink-0">
                {isSubscribed ? (
                  <Star className="w-4 h-4 text-green-600" />
                ) : (
                  <Zap className="w-4 h-4 text-purple-600" />
                )}
              </div>
            </div>
          ))}
        </div>
        
        {!isSubscribed && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
            <div className="text-center">
              <Crown className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold text-purple-800 mb-2">
                احصل على جميع هذه المميزات!
              </h3>
              <p className="text-sm text-purple-700">
                مساهمة شهرية بسيطة تمنحك الوصول لجميع المميزات الـ30 فوراً
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PremiumFeaturesList;
