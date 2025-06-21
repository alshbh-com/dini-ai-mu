
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { question, subscription = false } = await req.json();
    
    console.log('Received question:', question);
    console.log('OpenAI API Key exists:', !!Deno.env.get('OPENAI_API_KEY'));

    // إزالة معرف المستخدم من السؤال للمعالجة
    const cleanQuestion = question.replace(/\[معرف المستخدم:.*?\]/g, '').trim();

    const prompt = subscription 
      ? `أنت مساعد ديني متخصص في الفتاوى الإسلامية. أجب على السؤال التالي بإجابة مفصلة وشاملة مع ذكر المصادر والأدلة من القرآن والسنة:

${cleanQuestion}

يرجى تقديم:
1. إجابة مفصلة ومدعومة بالأدلة
2. المصادر من القرآن الكريم والأحاديث النبوية
3. آراء العلماء إن وجدت
4. أمثلة عملية إذا كان ذلك مناسباً

تذكر أن هذا المستخدم مساهم في التطبيق ويستحق إجابة شاملة ومفصلة.`
      : `أنت مساعد ديني متخصص في الفتاوى الإسلامية. أجب على السؤال التالي بإجابة واضحة ومفيدة:

${cleanQuestion}

يرجى تقديم إجابة شاملة مع الأدلة الأساسية من القرآن والسنة.`;

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found');
      return new Response(
        JSON.stringify({ 
          error: 'مفتاح OpenAI غير موجود',
          answer: 'عذراً، حدث خطأ في الإعدادات. يرجى المحاولة لاحقاً.'
        }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    console.log('Making request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'أنت مساعد ديني متخصص في الإجابة على الأسئلة الشرعية والفقهية باللغة العربية. تقدم إجابات دقيقة ومدعومة بالأدلة من القرآن والسنة.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: subscription ? 2000 : 1000,
        temperature: 0.3,
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const answer = data.choices?.[0]?.message?.content || 'عذراً، لم أتمكن من الحصول على إجابة. جرب مرة أخرى.';

    return new Response(
      JSON.stringify({ 
        answer,
        source: 'OpenAI GPT-4',
        subscription_features: subscription
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in ask-question function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'حدث خطأ في المعالجة. جرب مرة أخرى.',
        details: error.message,
        answer: 'عذراً، حدث خطأ تقني. يرجى إعادة المحاولة.'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
