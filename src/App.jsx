import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";
import GlobalMusicPlayer from "./components/GlobalMusicPlayer";
//changes
import FloatingMenu from "./components/FloatingMenu";

// Pages
import HomePage from "./pages/HomePage";
import StatesPage from "./pages/StatesPage";
import HeritagePage from "./pages/HeritagePage";
import HeritageDetailPage from "./pages/HeritageDetailPage";
import FestivalsPage from "./pages/FestivalsPage";
import ArtsPage from "./pages/ArtsPage";
import HiddenGemsPage from "./pages/HiddenGemsPage";
import QuizPage from "./pages/QuizPage";
import ChatPage from "./pages/ChatPage";
import MapPage from "./pages/MapPage";
import AccountPage from "./pages/AccountPage";
import UploadPage from "./pages/UploadPage";
import TourPage360 from "./pages/TourPage360";

import ItineraryPlanner from "./pages/ItineraryPlanner"; //changes by rahul

import RitualExplorerPage from "./pages/RitualExplorerPage";

// Hooks and Utils
import { useAuth } from "./hooks/useAuth";
import { useLocalStorage } from "./hooks/useLocalStorage";
import {
  heritageData,
  festivalsData,
  artsData,
  statesData,
  hiddenGemsData,
} from "./utils/data";

const dummyUser = {
  id: "550e8400-e29b-41c4-a716-446655440000",
  name: "Heritage Explorer",
  email: "explorer@bharatverse.com",
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000, // v5: renamed from cacheTime → gcTime
    },
  },
});

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { user, login, logout, isAuthenticated } = useAuth();

  const [bookmarks, setBookmarks] = useLocalStorage(
    "bharatverse_bookmarks",
    []
  );

  const [userProgress, setUserProgress] = useLocalStorage(
    "bharatverse_progress",
    {
      sitesVisited: [],
      quizzesTaken: [],
      badgesEarned: [],
      totalPoints: 0,
    }
  );

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await new Promise((res) => setTimeout(res, 2000));
        login(dummyUser);
      } catch (error) {
        console.error("App initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, [login]);

  const handlePageChange = (page, item = null) => {
    setCurrentPage(page);
    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addBookmark = (item) => {
    if (!bookmarks.find((b) => b.id === item.id && b.type === item.type)) {
      const newBookmarks = [
        ...bookmarks,
        { ...item, bookmarkedAt: new Date().toISOString() },
      ];
      setBookmarks(newBookmarks);
      return true;
    }
    return false;
  };

  const removeBookmark = (itemId, itemType) => {
    const filtered = bookmarks.filter(
      (b) => !(b.id === itemId && b.type === itemType)
    );
    setBookmarks(filtered);
  };

  const isBookmarked = (itemId, itemType) => {
    return bookmarks.some((b) => b.id === itemId && b.type === itemType);
  };

  const updateProgress = (type, data) => {
    setUserProgress((prev) => ({
      ...prev,
      [type]: Array.isArray(prev[type])
        ? [...prev[type], data]
        : typeof prev[type] === "number"
        ? prev[type] + data
        : data,
    }));
  };

  const renderCurrentPage = () => {
    const pageProps = {
      user,
      isAuthenticated,
      bookmarks,
      addBookmark,
      removeBookmark,
      isBookmarked,
      searchQuery,
      onSearchChange: setSearchQuery,
      onPageChange: handlePageChange,
      selectedItem,
      updateProgress,
      userProgress,
    };

    switch (currentPage) {
      case "home":
        return <HomePage {...pageProps} />;
      case "360tour":
        return <TourPage360 {...pageProps} onPageChange={handlePageChange} />;
      case "states":
        return <StatesPage {...pageProps} states={statesData} />;
      case "heritage":
        return selectedItem ? (
          <HeritageDetailPage {...pageProps} item={selectedItem} />
        ) : (
          <HeritagePage {...pageProps} />
        );
      case "festivals":
        return <FestivalsPage {...pageProps} />;
      case "arts":
        return <ArtsPage {...pageProps} />;
      case "gems":
        return <HiddenGemsPage {...pageProps} />;
      case "quiz":
        return <QuizPage {...pageProps} />;
      case "chat":
        return <ChatPage {...pageProps} />;
      case "map":
        return <MapPage {...pageProps} />;
      case "account":
        return <AccountPage {...pageProps} />;
      case "upload":
        return <UploadPage {...pageProps} />;
      case "itinerary": // ADD THIS CASE
        return <ItineraryPlanner {...pageProps} />;

      case "riti-riwaj":
        return <RitualExplorerPage {...pageProps} />;
      default:
        return <HomePage {...pageProps} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-white text-4xl">🕌</span>
            </div>
            <h1 className="text-4xl font-heritage font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500">
              BharatVerse
            </h1>
            <p className="text-gray-600 mt-2">Loading India's Heritage...</p>
          </div>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Global background music player */}
      <GlobalMusicPlayer />

      <Header
        currentPage={currentPage}
        onPageChange={handlePageChange}
        user={user}
        isAuthenticated={isAuthenticated}
        onLogin={login}
        onLogout={logout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <main className="min-h-screen pt-17">{renderCurrentPage()}</main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#374151",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            borderRadius: "12px",
            padding: "16px",
          },
          success: {
            style: { borderLeft: "4px solid #10b981" },
          },
          error: {
            style: { borderLeft: "4px solid #ef4444" },
          },
        }}
      />

  <div className="fixed bottom-6 left-6 z-50">
  <FloatingMenu onPageChange={handlePageChange} />
</div>
    </div>

  </QueryClientProvider>
  );
}

export default App;