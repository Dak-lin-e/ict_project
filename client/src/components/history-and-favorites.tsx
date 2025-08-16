import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { History, Heart, Eye, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UserFavorite, UserHistory } from "@shared/schema";

export default function HistoryAndFavorites() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: history = [] } = useQuery<any[]>({
    queryKey: ["/api/history"],
  });

  const { data: favorites = [] } = useQuery<any[]>({
    queryKey: ["/api/favorites"],
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

  const addToHistoryMutation = useMutation({
    mutationFn: (quoteId: string) => apiRequest("POST", "/api/history", { quoteId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
  });

  const handleViewQuote = (quoteId: string) => {
    addToHistoryMutation.mutate(quoteId);
    // In a real app, this might navigate to the quote or show it in a modal
    toast({
      title: "문구를 다시 보시려면 메인 화면을 확인하세요",
      duration: 2000,
    });
  };

  const handleRemoveFavorite = (quoteId: string) => {
    removeFavoriteMutation.mutate(quoteId);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      focus: "집중",
      motivation: "동기",
      exam: "시험",
      slump: "슬럼프",
      routine: "루틴",
      growth: "성장",
    };
    return labels[category] || category;
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Recent History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <History className="w-5 h-5 text-gray-500 inline mr-2" />
          최근 본 문구
        </h3>
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              아직 본 문구가 없습니다.
            </p>
          ) : (
            history.slice(0, 3).map((item: any) => (
              <div key={item.id} className="history-item">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  "{item.quote?.text || "문구를 찾을 수 없습니다"}"
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {getCategoryLabel(item.quote?.category || "")} • {" "}
                    {formatDistanceToNow(new Date(item.viewedAt), { 
                      addSuffix: true, 
                      locale: ko 
                    })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewQuote(item.quoteId)}
                    className="text-xs text-primary hover:text-primary/80 p-1"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    다시 보기
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Favorites */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <Heart className="w-5 h-5 text-red-500 inline mr-2" />
          즐겨찾기
        </h3>
        <div className="space-y-3">
          {favorites.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              아직 즐겨찾기한 문구가 없습니다.
            </p>
          ) : (
            favorites.slice(0, 3).map((item: any) => (
              <div key={item.id} className="favorite-item">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  "{item.quote?.text || "문구를 찾을 수 없습니다"}"
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {getCategoryLabel(item.quote?.category || "")}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewQuote(item.quoteId)}
                      className="text-xs text-primary hover:text-primary/80 p-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      보기
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFavorite(item.quoteId)}
                      className="text-xs text-red-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
