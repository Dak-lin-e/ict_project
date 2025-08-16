import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import type { UserPreferences } from "@shared/schema";

export default function PersonalizationBar() {
  const { data: preferences } = useQuery<UserPreferences>({
    queryKey: ["/api/preferences"],
  });

  const getDaysLeft = (targetDate: string | null) => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0) : "?";
  };

  const daysLeft = preferences?.targetDate ? getDaysLeft(preferences.targetDate) : null;

  return (
    <Card className="p-4 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {getInitial(preferences?.nickname || "")}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              안녕하세요, <span className="font-semibold text-gray-900 dark:text-white">
                {preferences?.nickname || "학습자"}
              </span>님!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              목표: {preferences?.goal || "목표를 설정해주세요"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {daysLeft !== null && (
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">D-{daysLeft}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">남은 일수</p>
            </div>
          )}
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary">{preferences?.streak || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">연속 일수</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
