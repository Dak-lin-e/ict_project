import { Button } from "@/components/ui/button";
import { Target, Flame, GraduationCap, Heart, Clock, Sprout, Star } from "lucide-react";

const categories = [
  { id: "all", label: "전체", icon: Star },
  { id: "focus", label: "집중", icon: Target },
  { id: "motivation", label: "동기", icon: Flame },
  { id: "exam", label: "시험", icon: GraduationCap },
  { id: "slump", label: "슬럼프", icon: Heart },
  { id: "routine", label: "루틴", icon: Clock },
  { id: "growth", label: "성장", icon: Sprout },
];

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeCategory === id ? "default" : "outline"}
            onClick={() => onCategoryChange(id)}
            className={`category-btn ${activeCategory === id ? "active" : ""}`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
