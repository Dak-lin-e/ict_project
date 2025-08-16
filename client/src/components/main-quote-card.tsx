import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Share2, Volume2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSpeech } from "@/hooks/use-speech";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import type { Quote, UserPreferences, UserFavorite } from "@shared/schema";

interface MainQuoteCardProps {
  category: string;
}

export default function MainQuoteCard({ category }: MainQuoteCardProps) {
  const { toast } = useToast();
  const { speak } = useSpeech();
  const queryClient = useQueryClient();
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

  const { data: preferences } = useQuery<UserPreferences>({
    queryKey: ["/api/preferences"],
  });

  const { data: favorites = [] } = useQuery<UserFavorite[]>({
    queryKey: ["/api/favorites"],
  });

  const { data: quotes = [] } = useQuery<Quote[]>({
    queryKey: category === "all" ? ["/api/quotes"] : ["/api/quotes?category=" + category],
  });

  const addToHistoryMutation = useMutation({
    mutationFn: (quoteId: string) => apiRequest("POST", "/api/history", { quoteId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
  });

  const addFavoriteMutation = useMutation({
    mutationFn: (quoteId: string) => apiRequest("POST", "/api/favorites", { quoteId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "즐겨찾기에 추가되었습니다",
        duration: 2000,
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (quoteId: string) => apiRequest("DELETE", `/api/favorites/${quoteId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "즐겨찾기에서 제거되었습니다",
        duration: 2000,
      });
    },
  });

  useEffect(() => {
    if (quotes.length > 0) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setCurrentQuote(randomQuote);
      if (!currentQuote || currentQuote.id !== randomQuote.id) {
        addToHistoryMutation.mutate(randomQuote.id);
      }
    }
  }, [quotes]);

  useEffect(() => {
    setCurrentQuote(null);
  }, [category]);

  const personalizeQuote = (text: string) => {
    if (!preferences) return text;
    
    let personalizedText = text;
    if (preferences.nickname) {
      personalizedText = personalizedText.replace(/{name}/g, preferences.nickname);
    }
    if (preferences.goal) {
      personalizedText = personalizedText.replace(/{goal}/g, preferences.goal);
    }
    if (preferences.targetDate) {
      const daysLeft = Math.ceil((new Date(preferences.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      personalizedText = personalizedText.replace(/{days_left}/g, daysLeft.toString());
    }
    
    return personalizedText;
  };

  const isFavorited = currentQuote ? favorites.some(fav => fav.quoteId === currentQuote.id) : false;

  const handleFavoriteToggle = () => {
    if (!currentQuote) return;
    
    if (isFavorited) {
      removeFavoriteMutation.mutate(currentQuote.id);
    } else {
      addFavoriteMutation.mutate(currentQuote.id);
    }
  };

  const handleShare = async () => {
    if (!currentQuote) return;
    
    const text = personalizeQuote(currentQuote.text);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "동기부여 문구",
          text: text,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast({
        title: "클립보드에 복사되었습니다",
        duration: 2000,
      });
    }
  };

  const handleSpeak = () => {
    if (!currentQuote) return;
    const text = personalizeQuote(currentQuote.text);
    speak(text);
  };

  const handleCopy = async () => {
    if (!currentQuote) return;
    const text = personalizeQuote(currentQuote.text);
    await navigator.clipboard.writeText(text);
    toast({
      title: "클립보드에 복사되었습니다",
      duration: 2000,
    });
  };

  if (!currentQuote) {
    return (
      <Card className="p-8 mb-8 min-h-[300px] flex flex-col justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">문구를 불러오는 중...</p>
        </div>
      </Card>
    );
  }

  const displayText = personalizeQuote(currentQuote.text);

  return (
    <Card className="p-8 mb-8 min-h-[300px] flex flex-col justify-center">
      <div className="text-center">
        <div className="mb-6">
          <span className="text-3xl text-primary opacity-50 mb-4">"</span>
        </div>
        
        <blockquote className="text-2xl sm:text-3xl font-medium text-gray-900 dark:text-white leading-relaxed mb-6">
          {displayText}
        </blockquote>
        
        <div className="flex justify-center mb-6">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {currentQuote.category === "focus" && "집중"}
            {currentQuote.category === "motivation" && "동기"}
            {currentQuote.category === "exam" && "시험"}
            {currentQuote.category === "slump" && "슬럼프"}
            {currentQuote.category === "routine" && "루틴"}
            {currentQuote.category === "growth" && "성장"}
          </Badge>
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteToggle}
            className="action-btn"
            title="즐겨찾기"
          >
            <Heart className={`w-5 h-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="action-btn"
            title="공유하기"
          >
            <Share2 className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSpeak}
            className="action-btn"
            title="읽어주기"
          >
            <Volume2 className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="action-btn"
            title="복사하기"
          >
            <Copy className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
