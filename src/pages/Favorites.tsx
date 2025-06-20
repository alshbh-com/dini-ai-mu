
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Heart, Trash2, Share2, Loader2, Crown, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Favorite {
  id: string;
  created_at: string;
  questions: {
    id: string;
    question: string;
    answer: string;
    source: string | null;
    created_at: string;
  };
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFavorites();
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const userIP = await getUserIP();
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_ip', userIP)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error checking subscription:", error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'anonymous';
    }
  };

  const loadFavorites = async () => {
    try {
      const userIP = await getUserIP();
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          created_at,
          questions (
            id,
            question,
            answer,
            source,
            created_at
          )
        `)
        .eq('user_ip', userIP)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading favorites:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ في تحميل المفضلة",
          variant: "destructive"
        });
      } else {
        setFavorites(data || []);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل المفضلة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف العنصر من المفضلة بنجاح"
      });
      
      loadFavorites();
    } catch (error) {
      console.error("Error deleting favorite:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف العنصر",
        variant: "destructive"
      });
    }
  };

  const clearAllFavorites = async () => {
    try {
      const userIP = await getUserIP();
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_ip', userIP);

      if (error) throw error;

      toast({
        title: "تم المسح",
        description: "تم مسح جميع العناصر من المفضلة"
      });
      
      setFavorites([]);
    } catch (error) {
      console.error("Error clearing favorites:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في مسح المفضلة",
        variant: "destructive"
      });
    }
  };

  const shareItem = async (question: string, answer: string, source: string | null) => {
    const shareText = `السؤال: ${question}\n\nالإجابة: ${answer}${source ? `\n\n${source}` : ''}\n\nمن تطبيق: مُعينك الديني`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "مُعينك الديني",
          text: shareText
        });
      } catch (error) {
        navigator.clipboard.writeText(shareText);
        toast({
          title: "تم النسخ",
          description: "تم نسخ المحتوى للحافظة"
        });
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "تم النسخ",
        description: "تم نسخ المحتوى للحافظة"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-slate-600">جاري تحميل المفضلة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm" className="border-indigo-400 text-indigo-600 hover:bg-indigo-50">
              <ArrowRight className="w-4 h-4 ml-1" />
              العودة للرئيسية
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-rose-600" />
            <h1 className="text-2xl sm:text-3xl font-bold font-amiri text-slate-800">المفضلة</h1>
            {subscription && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Crown className="w-3 h-3 ml-1" />
                غير محدود
              </Badge>
            )}
          </div>
        </div>

        {/* Storage Status */}
        <Card className={`mb-6 ${subscription ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'}`}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {subscription ? (
                <Crown className="w-6 h-6 text-purple-600" />
              ) : (
                <BookOpen className="w-6 h-6 text-blue-600" />
              )}
              <h3 className={`text-lg font-semibold ${subscription ? 'text-purple-800' : 'text-blue-800'}`}>
                {subscription ? "تخزين غير محدود" : `المحفوظ: ${favorites.length}/10`}
              </h3>
            </div>
            <p className={`text-sm ${subscription ? 'text-purple-700' : 'text-blue-700'}`}>
              {subscription 
                ? "يمكنك حفظ عدد غير محدود من الأسئلة والإجابات"
                : "المستخدمون المجانيون يمكنهم حفظ 10 عناصر فقط"
              }
            </p>
            {!subscription && favorites.length >= 10 && (
              <Badge className="bg-red-600 text-white mt-2">
                تم الوصول للحد الأقصى
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Clear All Button */}
        {favorites.length > 0 && (
          <div className="flex justify-end mb-6">
            <Button 
              onClick={clearAllFavorites}
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              مسح الكل
            </Button>
          </div>
        )}

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
            <CardContent className="p-8 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">لا توجد عناصر محفوظة</h3>
              <p className="text-slate-600 mb-4">
                ابدأ بحفظ الأسئلة والإجابات المهمة في المفضلة
              </p>
              <Link to="/">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  ابدأ الآن
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg font-amiri text-slate-800 leading-relaxed">
                      {favorite.questions?.question || "سؤال محذوف"}
                    </CardTitle>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        onClick={() => shareItem(
                          favorite.questions?.question || "",
                          favorite.questions?.answer || "",
                          favorite.questions?.source
                        )}
                        variant="outline"
                        size="sm"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => deleteFavorite(favorite.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">الإجابة:</h4>
                    <p className="text-green-700 leading-relaxed text-sm">
                      {favorite.questions?.answer || "إجابة محذوفة"}
                    </p>
                  </div>
                  
                  {favorite.questions?.source && (
                    <div className="bg-indigo-50 p-3 rounded-lg mb-4 border border-indigo-200">
                      <p className="text-indigo-700 text-sm font-medium">
                        {favorite.questions.source}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm text-slate-500">
                    <span>
                      تم الحفظ: {new Date(favorite.created_at).toLocaleDateString('ar-SA')}
                    </span>
                    <span>
                      تاريخ السؤال: {favorite.questions?.created_at ? new Date(favorite.questions.created_at).toLocaleDateString('ar-SA') : 'غير متوفر'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
