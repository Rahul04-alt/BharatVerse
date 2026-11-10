import React, { useState, useEffect } from "react";
import {
  User,
  Heart,
  Trophy,
  MapPin,
  Calendar,
  Star,
  Settings,
  LogOut,
  Download,
  Share2,
  Edit3,
  Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const AccountPage = ({
  user,
  onLogout,
  bookmarks,
  removeBookmark,
  userProgress,
  updateProfile,
}) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: user?.location || "",
    interests: user?.interests || [],
    avatar: user?.avatar || null,
  });
  const [stats, setStats] = useState({
    sitesVisited: 0,
    quizzesTaken: 0,
    averageScore: 0,
    totalPoints: 0,
    badgesEarned: [],
    bookmarksCount: 0,
    level: 1,
    nextLevelPoints: 1000,
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "bookmarks", label: "Bookmarks", icon: Heart },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "history", label: "History", icon: Calendar },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const interestOptions = [
    "Ancient Monuments",
    "Classical Dance",
    "Folk Arts",
    "Festivals",
    "Temple Architecture",
    "Mughal Heritage",
    "Regional Cuisine",
    "Traditional Crafts",
    "Historical Sites",
    "Natural Heritage",
  ];

  const achievements = [
    {
      id: "first-steps",
      name: "First Steps",
      description: "Visited your first heritage site",
      icon: "🚀",
      unlocked: true,
      unlockedAt: "2024-01-15",
    },
    {
      id: "heritage-explorer",
      name: "Heritage Explorer",
      description: "Bookmarked 10 heritage sites",
      icon: "🗺️",
      unlocked: bookmarks.length >= 10,
      progress: Math.min(bookmarks.length, 10),
      total: 10,
    },
    {
      id: "quiz-master",
      name: "Quiz Master",
      description: "Scored 90%+ on heritage quiz",
      icon: "🧠",
      unlocked: userProgress?.bestScore >= 90,
      bestScore: userProgress?.bestScore || 0,
    },
    {
      id: "culture-enthusiast",
      name: "Culture Enthusiast",
      description: "Completed 5 different quiz categories",
      icon: "🎭",
      unlocked: false,
      progress: 2,
      total: 5,
    },
    {
      id: "storyteller",
      name: "Storyteller",
      description: "Shared 5 hidden gems",
      icon: "📖",
      unlocked: false,
      progress: 0,
      total: 5,
    },
    {
      id: "heritage-guardian",
      name: "Heritage Guardian",
      description: "Active member for 6 months",
      icon: "🏛️",
      unlocked: false,
      joinDate: "2024-01-15",
    },
  ];

  useEffect(() => {
    // Calculate user statistics
    const calculatedStats = {
      sitesVisited: userProgress?.sitesVisited?.length || 0,
      quizzesTaken: userProgress?.quizzesTaken?.length || 0,
      averageScore: userProgress?.averageScore || 0,
      totalPoints: userProgress?.totalPoints || 0,
      badgesEarned: userProgress?.badgesEarned || [],
      bookmarksCount: bookmarks.length,
      level: Math.floor((userProgress?.totalPoints || 0) / 1000) + 1,
      nextLevelPoints: 1000 - ((userProgress?.totalPoints || 0) % 1000),
    };
    setStats(calculatedStats);
  }, [userProgress, bookmarks]);

  const handleProfileUpdate = () => {
    updateProfile(profileData);
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleInterestToggle = (interest) => {
    const newInterests = profileData.interests.includes(interest)
      ? profileData.interests.filter((i) => i !== interest)
      : [...profileData.interests, interest];

    setProfileData({ ...profileData, interests: newInterests });
  };

  const exportUserData = () => {
    const userData = {
      profile: profileData,
      stats: stats,
      bookmarks: bookmarks,
      achievements: achievements.filter((a) => a.unlocked),
      progress: userProgress,
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `bharatverse-data-${user.name
      .replace(/\s+/g, "-")
      .toLowerCase()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("Data exported successfully!");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-3xl font-heritage font-bold text-gray-900 mb-4">
            Please Log In
          </h2>
          <p className="text-gray-600 mb-8">
            You need to be logged in to view your account.
          </p>
          <button className="btn-heritage px-8 py-4">Log In to Continue</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="heritage-card p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-heritage-gradient rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  profileData.name.charAt(0).toUpperCase()
                )}
              </div>

              {isEditing && (
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-saffron-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-saffron-600 transition-colors">
                  <Camera size={18} />
                </button>
              )}

              {/* Level Badge */}
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-gold-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                {stats.level}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="text-3xl font-heritage font-bold bg-transparent border-b-2 border-saffron-500 outline-none w-full"
                  />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    className="text-lg text-gray-600 bg-transparent border-b border-gray-300 outline-none w-full"
                  />
                  <textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    placeholder="Tell us about your heritage interests..."
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-saffron-500"
                    rows="2"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-heritage font-bold text-gray-900 mb-2">
                    {profileData.name}
                  </h1>
                  <p className="text-lg text-gray-600 mb-2">
                    {profileData.email}
                  </p>
                  {profileData.bio && (
                    <p className="text-gray-700 mb-4">{profileData.bio}</p>
                  )}
                  {profileData.location && (
                    <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600">
                      <MapPin size={16} />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleProfileUpdate}
                    className="btn-heritage px-6 py-3"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-heritage px-6 py-3 flex items-center space-x-2"
                  >
                    <Edit3 size={18} />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="px-6 py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors flex items-center space-x-2"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="heritage-card p-6 text-center">
            <div className="text-3xl font-bold text-saffron-600 mb-2">
              {stats.totalPoints}
            </div>
            <div className="text-gray-600">Total Points</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-heritage-gradient h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((1000 - stats.nextLevelPoints) / 1000) * 100}%`,
                }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.nextLevelPoints} points to level {stats.level + 1}
            </div>
          </div>

          <div className="heritage-card p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.bookmarksCount}
            </div>
            <div className="text-gray-600">Bookmarks</div>
          </div>

          <div className="heritage-card p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.quizzesTaken}
            </div>
            <div className="text-gray-600">Quizzes Taken</div>
          </div>

          <div className="heritage-card p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.badgesEarned.length}
            </div>
            <div className="text-gray-600">Badges Earned</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="heritage-card mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-saffron-500 text-saffron-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-8">
                {/* Progress Overview */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Your Heritage Journey
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                      <h4 className="font-semibold mb-3 text-blue-800">
                        Quiz Performance
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-blue-600">Average Score:</span>
                          <span className="font-semibold text-blue-800">
                            {stats.averageScore}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">
                            Quizzes Completed:
                          </span>
                          <span className="font-semibold text-blue-800">
                            {stats.quizzesTaken}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                      <h4 className="font-semibold mb-3 text-green-800">
                        Exploration Stats
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-green-600">
                            Sites Bookmarked:
                          </span>
                          <span className="font-semibold text-green-800">
                            {stats.bookmarksCount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600">
                            Heritage Level:
                          </span>
                          <span className="font-semibold text-green-800">
                            {stats.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Heritage Interests
                  </h3>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {interestOptions.map((interest) => (
                        <button
                          key={interest}
                          onClick={() => handleInterestToggle(interest)}
                          className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                            profileData.interests.includes(interest)
                              ? "bg-saffron-100 text-saffron-800 border-2 border-saffron-300"
                              : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {profileData.interests.length > 0 ? (
                        profileData.interests.map((interest) => (
                          <span
                            key={interest}
                            className="px-4 py-2 bg-saffron-100 text-saffron-800 rounded-full text-sm font-medium"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">
                          No interests selected. Click edit to add your
                          preferences!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bookmarks Tab */}
            {activeTab === "bookmarks" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">
                    Your Bookmarks ({bookmarks.length})
                  </h3>
                  <button className="text-saffron-600 hover:text-saffron-700 text-sm font-medium">
                    Export All
                  </button>
                </div>

                {bookmarks.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarks.map((bookmark) => (
                      <div
                        key={`${bookmark.id}-${bookmark.type}`}
                        className="heritage-card"
                      >
                        <img
                          src={
                            bookmark.images?.[0] ||
                            "https://via.placeholder.com/400x200"
                          }
                          alt={bookmark.title}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs bg-saffron-100 text-saffron-800 px-2 py-1 rounded-full">
                              {bookmark.type}
                            </span>
                            <button
                              onClick={() =>
                                removeBookmark(bookmark.id, bookmark.type)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <Heart size={16} className="fill-current" />
                            </button>
                          </div>
                          <h4 className="font-semibold mb-1">
                            {bookmark.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {bookmark.state}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {bookmark.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart size={48} className="text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      No Bookmarks Yet
                    </h4>
                    <p className="text-gray-600 mb-6">
                      Start exploring heritage sites and save your favorites!
                    </p>
                    <button className="btn-heritage px-6 py-3">
                      Explore Heritage Sites
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === "achievements" && (
              <div>
                <h3 className="text-xl font-semibold mb-6">
                  Achievements & Badges
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                        achievement.unlocked
                          ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`text-4xl ${
                            achievement.unlocked
                              ? "animate-bounce"
                              : "opacity-50"
                          }`}
                        >
                          {achievement.icon}
                        </div>

                        <div className="flex-1">
                          <h4
                            className={`font-semibold mb-2 ${
                              achievement.unlocked
                                ? "text-yellow-800"
                                : "text-gray-600"
                            }`}
                          >
                            {achievement.name}
                          </h4>

                          <p className="text-sm text-gray-600 mb-3">
                            {achievement.description}
                          </p>

                          {achievement.unlocked ? (
                            <div>
                              <span className="inline-flex items-center px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium">
                                ✅ Unlocked
                              </span>
                              {achievement.unlockedAt && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Earned on{" "}
                                  {new Date(
                                    achievement.unlockedAt
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div>
                              {achievement.progress !== undefined &&
                                achievement.total && (
                                  <div>
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                      <span>Progress</span>
                                      <span>
                                        {achievement.progress}/
                                        {achievement.total}
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-saffron-500 h-2 rounded-full transition-all duration-300"
                                        style={{
                                          width: `${
                                            (achievement.progress /
                                              achievement.total) *
                                            100
                                          }%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              <span className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium mt-2">
                                🔒 Locked
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div>
                <h3 className="text-xl font-semibold mb-6">Activity History</h3>

                <div className="space-y-6">
                  {/* Recent Quiz Results */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center space-x-2">
                      <Trophy className="text-blue-600" size={20} />
                      <span>Recent Quiz Results</span>
                    </h4>

                    {userProgress?.quizzesTaken
                      ?.slice(-5)
                      .map((quiz, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-3"
                        >
                          <div>
                            <h5 className="font-medium">
                              {quiz.quizId
                                .replace("-", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {new Date(quiz.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-lg font-bold ${
                                quiz.score / quiz.total >= 0.8
                                  ? "text-green-600"
                                  : quiz.score / quiz.total >= 0.6
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {Math.round((quiz.score / quiz.total) * 100)}%
                            </div>
                            <div className="text-sm text-gray-500">
                              {quiz.points} points
                            </div>
                          </div>
                        </div>
                      )) || (
                      <p className="text-gray-500 italic">
                        No quiz history yet. Take your first quiz!
                      </p>
                    )}
                  </div>

                  {/* Visited Sites */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center space-x-2">
                      <MapPin className="text-green-600" size={20} />
                      <span>Recently Viewed Sites</span>
                    </h4>
                    <p className="text-gray-500 italic">
                      Feature coming soon - track your heritage exploration
                      journey!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-8">
                <h3 className="text-xl font-semibold">Account Settings</h3>

                {/* Notification Preferences */}
                <div>
                  <h4 className="font-semibold mb-4">Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Email newsletters</span>
                      <input
                        type="checkbox"
                        className="rounded"
                        defaultChecked
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Quiz reminders</span>
                      <input
                        type="checkbox"
                        className="rounded"
                        defaultChecked
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>New heritage site alerts</span>
                      <input type="checkbox" className="rounded" />
                    </label>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <h4 className="font-semibold mb-4">Privacy</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Show profile in leaderboard</span>
                      <input
                        type="checkbox"
                        className="rounded"
                        defaultChecked
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Allow others to see my bookmarks</span>
                      <input type="checkbox" className="rounded" />
                    </label>
                  </div>
                </div>

                {/* Data Management */}
                <div>
                  <h4 className="font-semibold mb-4">Data Management</h4>
                  <div className="space-y-4">
                    <button
                      onClick={exportUserData}
                      className="flex items-center space-x-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Download size={18} />
                      <span>Export My Data</span>
                    </button>

                    <button className="flex items-center space-x-2 px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                      <Share2 size={18} />
                      <span>Share Profile</span>
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t border-red-200 pt-8">
                  <h4 className="font-semibold mb-4 text-red-800">
                    Danger Zone
                  </h4>
                  <div className="space-y-4">
                    <button className="px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                      Clear All Data
                    </button>
                    <button className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
