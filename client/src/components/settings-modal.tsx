import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserPreferencesSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { z } from "zod";
import type { UserPreferences } from "@shared/schema";

const formSchema = insertUserPreferencesSchema.extend({
  darkModeToggle: z.boolean().optional(),
  largeTextToggle: z.boolean().optional(),
  notificationsEnabledToggle: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();

  const { data: preferences } = useQuery<UserPreferences>({
    queryKey: ["/api/preferences"],
  });

  const createPreferencesMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/preferences", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preferences"] });
      toast({
        title: "설정이 저장되었습니다",
        duration: 2000,
      });
      onClose();
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", "/api/preferences", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preferences"] });
      toast({
        title: "설정이 업데이트되었습니다",
        duration: 2000,
      });
      onClose();
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: preferences?.nickname || "",
      goal: preferences?.goal || "",
      targetDate: preferences?.targetDate || "",
      notificationTime: preferences?.notificationTime || "09:00",
      darkMode: theme === "dark" ? 1 : 0,
      largeText: preferences?.largeText || 0,
      notificationsEnabled: preferences?.notificationsEnabled ?? 1,
      streak: preferences?.streak || 0,
    },
  });

  const onSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      darkMode: theme === "dark" ? 1 : 0,
    };

    if (preferences) {
      updatePreferencesMutation.mutate(submitData);
    } else {
      createPreferencesMutation.mutate(submitData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>설정</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">개인 정보</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  {...form.register("nickname")}
                  placeholder="닉네임을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="goal">목표</Label>
                <Input
                  id="goal"
                  {...form.register("goal")}
                  placeholder="목표를 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="targetDate">목표 날짜</Label>
                <Input
                  id="targetDate"
                  type="date"
                  {...form.register("targetDate")}
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">환경 설정</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="darkMode">다크 모드</Label>
                <Switch
                  id="darkMode"
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                />
              </div>
              <div className="flex justify-between items-center">
                <Label htmlFor="largeText">큰 글씨 모드</Label>
                <Switch
                  id="largeText"
                  checked={form.watch("largeText") === 1}
                  onCheckedChange={(checked) => form.setValue("largeText", checked ? 1 : 0)}
                />
              </div>
              <div className="flex justify-between items-center">
                <Label htmlFor="notifications">알림 허용</Label>
                <Switch
                  id="notifications"
                  checked={form.watch("notificationsEnabled") === 1}
                  onCheckedChange={(checked) => form.setValue("notificationsEnabled", checked ? 1 : 0)}
                />
              </div>
              <div>
                <Label htmlFor="notificationTime">일일 알림 시간</Label>
                <Input
                  id="notificationTime"
                  type="time"
                  {...form.register("notificationTime")}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={createPreferencesMutation.isPending || updatePreferencesMutation.isPending}
            className="w-full bg-gradient-to-r from-primary to-primary/80 text-white font-semibold py-3 px-4 rounded-lg hover:from-primary/90 hover:to-primary/70 transition-all"
          >
            설정 저장
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
