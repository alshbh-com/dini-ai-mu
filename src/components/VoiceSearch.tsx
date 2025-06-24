
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface VoiceSearchProps {
  onTranscription: (text: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

const VoiceSearch: React.FC<VoiceSearchProps> = ({ 
  onTranscription, 
  isRecording, 
  setIsRecording 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      toast({
        title: "بدء التسجيل",
        description: "تحدث الآن... اضغط إيقاف عند الانتهاء"
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "خطأ في الميكروفون",
        description: "تأكد من السماح بالوصول للميكروفون",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Send to voice-to-text API
        const response = await fetch('/api/voice-to-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ audio: base64Audio })
        });

        if (!response.ok) {
          throw new Error('Failed to transcribe audio');
        }

        const { text } = await response.json();
        onTranscription(text);

        toast({
          title: "تم التعرف على الصوت",
          description: `النص: ${text.substring(0, 50)}...`
        });
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "خطأ في معالجة الصوت",
        description: "حاول مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-medium text-slate-800">البحث الصوتي</h3>
              <p className="text-sm text-slate-600">اضغط واسأل بصوتك</p>
            </div>
          </div>
          
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-purple-500 hover:bg-purple-600'
            } text-white`}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
            ) : isRecording ? (
              <MicOff className="w-4 h-4 ml-2" />
            ) : (
              <Mic className="w-4 h-4 ml-2" />
            )}
            {isProcessing ? 'جاري المعالجة...' : isRecording ? 'إيقاف التسجيل' : 'ابدأ التسجيل'}
          </Button>
        </div>
        
        {isRecording && (
          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700 text-sm text-center">
              🎤 جاري التسجيل... تحدث الآن
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceSearch;
