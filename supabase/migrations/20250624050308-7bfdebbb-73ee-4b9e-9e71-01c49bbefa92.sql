
-- Create table for answer feedback
CREATE TABLE public.answer_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  user_ip TEXT NOT NULL,
  is_helpful BOOLEAN NOT NULL,
  comment TEXT,
  answer_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for daily quiz questions
CREATE TABLE public.daily_quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  source TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Create table for daily quiz answers
CREATE TABLE public.daily_quiz_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_ip TEXT NOT NULL,
  question_id TEXT NOT NULL,
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_ip, date)
);

-- Add some sample daily quiz questions
INSERT INTO public.daily_quiz_questions (question, options, correct_answer, explanation, source, date) VALUES
(
  'كم عدد أركان الإسلام؟',
  '["أربعة", "خمسة", "ستة", "سبعة"]',
  1,
  'أركان الإسلام خمسة: الشهادتان، الصلاة، الزكاة، الصوم، الحج',
  'حديث جبريل المشهور',
  CURRENT_DATE
),
(
  'في أي سورة وردت آية الكرسي؟',
  '["الفاتحة", "البقرة", "آل عمران", "النساء"]',
  1,
  'آية الكرسي هي الآية رقم 255 من سورة البقرة',
  'القرآن الكريم - سورة البقرة',
  CURRENT_DATE + INTERVAL '1 day'
),
(
  'كم عدد الصلوات المفروضة في اليوم؟',
  '["ثلاث", "أربع", "خمس", "ست"]',
  2,
  'الصلوات المفروضة خمس: الفجر، الظهر، العصر، المغرب، العشاء',
  'فرضت ليلة الإسراء والمعراج',
  CURRENT_DATE + INTERVAL '2 days'
);
