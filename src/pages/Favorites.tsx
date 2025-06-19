
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Heart, Share, Trash2, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Favorite {
  id: number;
  question: string;
  answer: string;
  source: string;
  date: string;
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(savedFavorites);
  }, []);

  const deleteFavorite = (id: number) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    toast({
      title: "تم الحذف",
      description: "تم حذف السؤال من المفضلة"
    });
  };

  const shareFavorite = async (favorite: Favorite) => {
    const shareText = `السؤال: ${favorite.question}\n\nالإجابة: ${favorite.answer}\n\n${favorite.source}\n\nمن تطبيق: مُعينك الديني`;
    
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-cream via-white to-islamic-cream">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm" className="border-islamic-gold text-islamic-gold hover:bg-islamic-gold hover:text-white">
              <ArrowRight className="w-4 h-4 ml-1" />
              العودة للرئيسية
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-islamic-gold" />
            <h1 className="text-3xl font-bold font-amiri text-islamic-green">المفضلة</h1>
          </div>
        </div>

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <Card className="max-w-2xl mx-auto text-center py-12">
            <CardContent>
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-islamic-gold opacity-50" />
              <h3 className="text-xl font-amiri text-islamic-green mb-2">لا توجد أسئلة محفوظة</h3>
              <p className="text-muted-foreground mb-4">
                ابدأ بحفظ الأسئلة والإجابات المهمة لديك
              </p>
              <Link to="/">
                <Button className="bg-islamic-green hover:bg-islamic-green-dark text-white">
                  اطرح سؤالاً جديداً
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="shadow-lg border-islamic-gold/20 hover:border-islamic-gold/40 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg font-amiri text-islamic-green leading-relaxed">
                      {favorite.question}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {favorite.date}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="bg-islamic-cream p-4 rounded-lg text-islamic-green leading-relaxed">
                      {favorite.answer}
                    </div>
                  </div>

                  {favorite.source && (
                    <div className="mb-4 p-3 bg-islamic-gold/10 rounded-lg">
                      <p className="text-sm font-medium text-islamic-green">{favorite.source}</p>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={() => shareFavorite(favorite)}
                      variant="outline"
                      size="sm"
                      className="border-islamic-gold text-islamic-gold hover:bg-islamic-gold hover:text-white"
                    >
                      <Share className="w-4 h-4 ml-1" />
                      مشاركة
                    </Button>
                    <Button
                      onClick={() => deleteFavorite(favorite.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4 ml-1" />
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
