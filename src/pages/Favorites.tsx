
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Heart, Share, Trash2, BookOpen, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Favorite {
  id: string;
  question_id: string;
  created_at: string;
  questions: {
    question: string;
    answer: string;
    source: string;
  };
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFavorites();
  }, []);

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
          question_id,
          created_at,
          questions (
            question,
            answer,
            source
          )
        `)
        .eq('user_ip', userIP)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
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
    setDeleting(favoriteId);
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      toast({
        title: "تم الحذف",
        description: "تم حذف السؤال من المفضلة"
      });
    } catch (error) {
      console.error("Error deleting favorite:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف السؤال",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  const shareFavorite = async (favorite: Favorite) => {
    const shareText = `السؤال: ${favorite.questions.question}\n\nالإجابة: ${favorite.questions.answer}\n\n${favorite.questions.source}\n\nمن تطبيق: مُعينك الديني`;
    
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
          description: "تم نسخ الإجابة للحافظة"
        });
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "تم النسخ",
        description: "تم نسخ الإجابة للحافظة"
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
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500" />
            <h1 className="text-2xl sm:text-3xl font-bold font-amiri text-slate-800">المفضلة</h1>
          </div>
          {favorites.length > 0 && (
            <Badge className="bg-rose-500 text-white mr-auto">
              {favorites.length} عنصر
            </Badge>
          )}
        </div>

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <Card className="max-w-2xl mx-auto text-center py-12 bg-white/80 backdrop-blur-sm shadow-xl border border-slate-200">
            <CardContent>
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-indigo-500 opacity-50" />
              <h3 className="text-xl font-amiri text-slate-800 mb-2">لا توجد أسئلة محفوظة</h3>
              <p className="text-slate-600 mb-4">
                ابدأ بحفظ الأسئلة والإجابات المهمة لديك
              </p>
              <Link to="/">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  اطرح سؤالاً جديداً
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="shadow-lg border-slate-200 hover:border-indigo-300 transition-all bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg font-amiri text-slate-800 leading-relaxed flex-1">
                      {favorite.questions.question}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 flex-shrink-0">
                      {new Date(favorite.created_at).toLocaleDateString('ar-SA')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="bg-slate-50 p-4 rounded-lg text-slate-800 leading-relaxed border border-slate-200">
                      {favorite.questions.answer}
                    </div>
                  </div>

                  {favorite.questions.source && (
                    <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <p className="text-sm font-medium text-indigo-700">{favorite.questions.source}</p>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end flex-wrap">
                    <Button
                      onClick={() => shareFavorite(favorite)}
                      variant="outline"
                      size="sm"
                      className="border-blue-400 text-blue-600 hover:bg-blue-50"
                    >
                      <Share className="w-4 h-4 ml-1" />
                      مشاركة
                    </Button>
                    <Button
                      onClick={() => deleteFavorite(favorite.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-400 text-red-600 hover:bg-red-50"
                      disabled={deleting === favorite.id}
                    >
                      {deleting === favorite.id ? (
                        <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 ml-1" />
                      )}
                      حذف
                    </Button>
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
