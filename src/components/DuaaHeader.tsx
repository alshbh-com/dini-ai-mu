
import { Crown, Heart, Sparkles } from "lucide-react";

const DuaaHeader = () => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white py-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      <div className="container mx-auto px-4 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-emerald-800 animate-pulse" />
          </div>
          <span className="font-amiri text-2xl font-bold bg-gradient-to-r from-amber-200 to-yellow-200 bg-clip-text text-transparent">
            دعاء خاص
          </span>
          <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-emerald-800 animate-pulse" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-white/20">
          <p className="font-amiri text-2xl leading-relaxed text-white mb-2">
            اللهم ادخل محمد عبد العظيم ومحمد حافظ الجنة بغير حساب ولا عذاب
          </p>
          <div className="flex items-center justify-center gap-2 text-amber-200">
            <Sparkles className="w-5 h-5" />
            <p className="text-lg font-cairo">
              🤲 آمين يا رب العالمين
            </p>
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuaaHeader;
