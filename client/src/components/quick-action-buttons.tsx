import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

const quickPhrases = [
  "지금 10분",
  "펜을 잡아",
  "한 페이지 더",
  "타이머 스타트",
  "적고 외워",
  "복습부터"
];

export default function QuickActionButtons() {
  const handleQuickPhrase = (phrase: string) => {
    // Simple alert for now - could be enhanced to show in a modal or update the main quote
    alert(`💪 ${phrase}!`);
  };

  return (
    <Card className="p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
        <Zap className="w-5 h-5 text-accent inline mr-2" />
        한 번 클릭 동기부여
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {quickPhrases.map((phrase) => (
          <Button
            key={phrase}
            variant="outline"
            onClick={() => handleQuickPhrase(phrase)}
            className="quick-phrase-btn"
          >
            {phrase}
          </Button>
        ))}
      </div>
    </Card>
  );
}
