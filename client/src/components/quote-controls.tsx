import { Button } from "@/components/ui/button";
import { RefreshCw, Shuffle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface QuoteControlsProps {
  category: string;
}

export default function QuoteControls({ category }: QuoteControlsProps) {
  const queryClient = useQueryClient();

  const getRandomQuoteMutation = useMutation({
    mutationFn: () => {
      const url = category === "all" 
        ? "/api/quotes/random" 
        : `/api/quotes/random?category=${category}`;
      return apiRequest("GET", url);
    },
    onSuccess: async (response) => {
      const quote = await response.json();
      // Add to history
      await apiRequest("POST", "/api/history", { quoteId: quote.id });
      // Invalidate queries to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
  });

  const handleNewQuote = () => {
    getRandomQuoteMutation.mutate();
  };

  const handleRandomQuote = () => {
    getRandomQuoteMutation.mutate();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <Button
        onClick={handleNewQuote}
        disabled={getRandomQuoteMutation.isPending}
        className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
      >
        <RefreshCw className="w-5 h-5 mr-2" />
        새로운 문구
      </Button>
      
      <Button
        onClick={handleRandomQuote}
        disabled={getRandomQuoteMutation.isPending}
        className="flex-1 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
      >
        <Shuffle className="w-5 h-5 mr-2" />
        랜덤 문구
      </Button>
    </div>
  );
}
