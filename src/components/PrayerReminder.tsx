
import { useState, useEffect } from "react";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PrayerReminder = () => {
  const [showReminder, setShowReminder] = useState(false);
  const [currentPrayer, setCurrentPrayer] = useState("");

  useEffect(() => {
    // Simple prayer time logic - in real app, you'd use proper calculation
    const now = new Date();
    const hour = now.getHours();
    
    let prayer = "";
    if (hour >= 5 && hour < 12) prayer = "الضحى والصلاة";
    else if (hour >= 12 && hour < 15) prayer = "صلاة الظهر";
    else if (hour >= 15 && hour < 18) prayer = "صلاة العصر";
    else if (hour >= 18 && hour < 20) prayer = "صلاة المغرب";
    else if (hour >= 20 && hour < 23) prayer = "صلاة العشاء";
    else prayer = "قيام الليل";

    setCurrentPrayer(prayer);

    // Show reminder every 3 hours
    const lastShown = localStorage.getItem("lastPrayerReminder");
    const now_time = Date.now();
    if (!lastShown || now_time - parseInt(lastShown) > 3 * 60 * 60 * 1000) {
      setTimeout(() => setShowReminder(true), 3000);
    }
  }, []);

  const dismissReminder = () => {
    setShowReminder(false);
    localStorage.setItem("lastPrayerReminder", Date.now().toString());
  };

  if (!showReminder) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-50 flex justify-center">
      <Card className="max-w-md prayer-reminder bg-islamic-gold text-white border-0 shadow-2xl">
        <CardContent className="p-6 text-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissReminder}
            className="absolute top-2 right-2 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="mb-4">
            <Clock className="w-12 h-12 mx-auto mb-3 animate-pulse" />
            <h3 className="font-amiri text-xl font-bold mb-2">
              تذكير بالصلاة
            </h3>
            <p className="font-cairo text-lg">
              حان وقت {currentPrayer}
            </p>
          </div>
          
          <div className="text-sm opacity-90">
            <p className="font-amiri mb-2">
              "وَأَقِمِ الصَّلَاةَ لِذِكْرِي"
            </p>
            <p>
              لا تنسَ أداء الصلاة في وقتها 🕌
            </p>
          </div>
          
          <Button
            onClick={dismissReminder}
            variant="secondary"
            className="mt-4 bg-white text-islamic-gold hover:bg-gray-100"
          >
            جزاك الله خيراً
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrayerReminder;
