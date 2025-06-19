
import { Crown, Heart } from "lucide-react";

const DuaaHeader = () => {
  return (
    <div className="bg-gradient-to-r from-islamic-green via-islamic-green-light to-islamic-green text-white py-4 islamic-pattern">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-5 h-5 text-islamic-gold animate-pulse" />
          <span className="font-amiri text-lg font-semibold">دعاء خاص</span>
          <Heart className="w-5 h-5 text-islamic-gold animate-pulse" />
        </div>
        <p className="font-amiri text-xl leading-relaxed">
          اللهم ادخل محمد عبد العظيم ومحمد حافظ الجنة بغير حساب ولا عذاب
        </p>
        <p className="text-islamic-gold text-sm mt-1 font-cairo">
          🤲 آمين يا رب العالمين
        </p>
      </div>
    </div>
  );
};

export default DuaaHeader;
