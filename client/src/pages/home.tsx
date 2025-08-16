import Header from "@/components/header";
import PersonalizationBar from "@/components/personalization-bar";
import CategoryFilter from "@/components/category-filter";
import MainQuoteCard from "@/components/main-quote-card";
import QuoteControls from "@/components/quote-controls";
import QuickActionButtons from "@/components/quick-action-buttons";
import HistoryAndFavorites from "@/components/history-and-favorites";
import SettingsModal from "@/components/settings-modal";
import { useState } from "react";

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PersonalizationBar />
        <CategoryFilter 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />
        <MainQuoteCard category={activeCategory} />
        <QuoteControls category={activeCategory} />
        <QuickActionButtons />
        <HistoryAndFavorites />
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
