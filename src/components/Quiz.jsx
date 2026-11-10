import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  RefreshCw,
  ArrowLeft,
  Target,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Quiz = ({ quizData, category, onComplete, onGoBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // Extract questions from quizData or use empty array
  const questions = quizData?.questions || [];

  useEffect(() => {
    if (quizStarted && !showResult && !quizCompleted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult && quizStarted) {
      handleNextQuestion();
    }
  }, [timeLeft, quizStarted, showResult, quizCompleted]);

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setTimeLeft(30);
    setQuizCompleted(false);
    setStartTime(Date.now());
  };

  const selectOption = (optionIndex) => {
    if (showResult) return;
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = () => {
    const currentQ = questions[currentQuestion];
    const isCorrect = selectedOption === currentQ.correct;

    if (isCorrect) {
      setScore(score + 1);
    }

    const answerData = {
      questionId: currentQ.id,
      question: currentQ.question,
      selectedOption,
      selectedAnswer:
        selectedOption !== null
          ? currentQ.options[selectedOption]
          : "No answer",
      correct: currentQ.correct,
      correctAnswer: currentQ.options[currentQ.correct],
      isCorrect,
      timeUsed: 30 - timeLeft,
    };

    setAnswers((prevAnswers) => [...prevAnswers, answerData]);
    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
        setShowResult(false);
        setTimeLeft(30);
      } else {
        setQuizCompleted(true);
        const totalTime = Math.floor((Date.now() - startTime) / 1000);
        onComplete &&
          onComplete({
            score: isCorrect ? score + 1 : score,
            total: questions.length,
            answers: [...answers, answerData],
            category: category?.title || "Quiz",
            totalTime,
            percentage: Math.round(
              ((isCorrect ? score + 1 : score) / questions.length) * 100
            ),
          });
      }
    }, 2500);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setTimeLeft(30);
    setQuizStarted(false);
    setAnswers([]);
    setQuizCompleted(false);
    setStartTime(null);
  };

  const goBack = () => {
    if (onGoBack) {
      onGoBack();
    }
  };

  const getScoreColor = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90) return "Outstanding! You're a heritage expert! 🏆";
    if (percentage >= 80) return "Excellent knowledge of Indian heritage! 🌟";
    if (percentage >= 70) return "Great job! You know your culture well! 👏";
    if (percentage >= 60)
      return "Good effort! Keep learning about our heritage! 📚";
    return "Keep exploring and learning about Indian culture! 🚀";
  };

  const getBadgeForScore = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90)
      return { name: "Heritage Master", icon: "🏆", color: "text-yellow-600" };
    if (percentage >= 80)
      return { name: "Culture Expert", icon: "🌟", color: "text-blue-600" };
    if (percentage >= 70)
      return { name: "Knowledge Seeker", icon: "📚", color: "text-green-600" };
    if (percentage >= 60)
      return { name: "Explorer", icon: "🗺️", color: "text-purple-600" };
    return { name: "Beginner", icon: "🌱", color: "text-gray-600" };
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="text-red-600" size={40} />
        </div>
        <h2 className="text-3xl font-heritage font-bold text-red-600 mb-4">
          Quiz Not Available
        </h2>
        <p className="text-gray-600 mb-6">
          Sorry, this quiz is currently not available. Please try another
          category.
        </p>
        <button
          onClick={goBack}
          className="btn-heritage px-6 py-3 flex items-center space-x-2 mx-auto"
        >
          <ArrowLeft size={20} />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  if (!quizStarted) {
    const IconComponent = category?.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8"
      >
        {/* Header with category info */}
        <div className="mb-8">
          <button
            onClick={goBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Categories</span>
          </button>
        </div>

        <div
          className={`w-24 h-24 bg-gradient-to-r ${
            category?.color || "from-blue-500 to-purple-500"
          } rounded-full flex items-center justify-center mx-auto mb-6`}
        >
          {IconComponent ? (
            <IconComponent className="text-white" size={40} />
          ) : (
            <Trophy className="text-white" size={40} />
          )}
        </div>

        <h2 className="text-4xl font-heritage font-bold heritage-text-gradient mb-4">
          {category?.title || "Heritage Quiz"}
        </h2>

        <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
          {category?.description ||
            "Test your knowledge about Indian heritage, monuments, festivals, and culture."}
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 max-w-lg mx-auto border border-gray-100">
          <h3 className="font-bold mb-6 text-xl flex items-center justify-center space-x-2">
            <Target className="text-saffron-600" size={20} />
            <span>Quiz Details</span>
          </h3>
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {questions.length}
              </div>
              <div className="text-sm text-blue-800">Questions</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl">
              <div className="text-2xl font-bold text-orange-600 mb-1">30s</div>
              <div className="text-sm text-orange-800">Per Question</div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {category?.estimatedTime || "15 min"}
              </div>
              <div className="text-sm text-green-800">Duration</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {category?.difficulty || "Mixed"}
              </div>
              <div className="text-sm text-purple-800">Difficulty</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
          <h3 className="font-semibold mb-4">Instructions:</h3>
          <div className="space-y-2 text-sm text-gray-600 text-left">
            <p>⏱️ Each question has a 30-second time limit</p>
            <p>📝 Select your answer before time runs out</p>
            <p>🏆 Earn badges based on your performance</p>
            <p>📚 Learn from detailed explanations</p>
            <p>🎯 No negative marking for wrong answers</p>
          </div>
        </div>

        <button
          onClick={startQuiz}
          className="btn-heritage text-lg px-10 py-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          Start Quiz 🚀
        </button>
      </motion.div>
    );
  }

  if (quizCompleted) {
    const badge = getBadgeForScore();
    const percentage = Math.round((score / questions.length) * 100);
    const totalTime = Math.floor((Date.now() - startTime) / 1000);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8"
      >
        <div
          className={`w-32 h-32 bg-gradient-to-r ${
            category?.color || "from-blue-500 to-purple-500"
          } rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl`}
        >
          <Trophy className="text-white" size={50} />
        </div>

        <h2 className="text-4xl font-heritage font-bold mb-6">
          Quiz Complete! 🎉
        </h2>

        {/* Score Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg mx-auto mb-8 border border-gray-100">
          <div className={`text-7xl font-bold ${getScoreColor()} mb-4`}>
            {score}/{questions.length}
          </div>
          <div className="text-3xl font-semibold mb-6 text-gray-800">
            {percentage}%
          </div>

          {/* Badge */}
          <div className="mb-6">
            <div
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <span className={`font-bold ${badge.color}`}>{badge.name}</span>
            </div>
          </div>

          <p className="text-gray-600 mb-8 text-lg">{getScoreMessage()}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {score}
              </div>
              <div className="text-sm text-green-800">Correct</div>
            </div>
            <div className="bg-red-50 p-4 rounded-xl">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {questions.length - score}
              </div>
              <div className="text-sm text-red-800">Wrong</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Math.floor(totalTime / 60)}m {totalTime % 60}s
              </div>
              <div className="text-sm text-blue-800">Time Taken</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {percentage}%
              </div>
              <div className="text-sm text-purple-800">Accuracy</div>
            </div>
          </div>
        </div>

        {/* Review Answers */}
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <Award className="text-saffron-600" size={20} />
            <span>Review Your Answers</span>
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {answers.map((answer, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  answer.isCorrect
                    ? "bg-green-50 border-green-400"
                    : "bg-red-50 border-red-400"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800 mb-1">
                      Q{index + 1}: {answer.question}
                    </p>
                    <div className="text-xs text-gray-600">
                      <span
                        className={
                          answer.isCorrect ? "text-green-600" : "text-red-600"
                        }
                      >
                        Your answer: {answer.selectedAnswer}
                      </span>
                      {!answer.isCorrect && (
                        <span className="block text-green-600">
                          Correct: {answer.correctAnswer}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-2">
                    {answer.isCorrect ? (
                      <CheckCircle className="text-green-600" size={16} />
                    ) : (
                      <XCircle className="text-red-600" size={16} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={restartQuiz}
            className="btn-heritage px-8 py-4 flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
          >
            <RefreshCw size={20} />
            <span>Try Again</span>
          </button>

          <button
            onClick={goBack}
            className="btn-outline-heritage px-8 py-4 flex items-center space-x-2"
          >
            <ArrowLeft size={20} />
            <span>More Quizzes</span>
          </button>
        </div>
      </motion.div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={goBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{category?.title}</span>
        </div>
      </div>

      {/* Progress Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-lg font-semibold text-gray-800">
          Question {currentQuestion + 1} of {questions.length}
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Clock size={18} className="text-gray-500" />
            <span
              className={`font-mono text-lg font-bold ${
                timeLeft <= 10 ? "text-red-600 animate-pulse" : "text-gray-700"
              }`}
            >
              {timeLeft}s
            </span>
          </div>

          <div className="text-lg font-semibold text-gray-700">
            Score: {score}/{currentQuestion + (showResult ? 1 : 0)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-10">
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${((currentQuestion + 1) / questions.length) * 100}%`,
          }}
          className={`bg-gradient-to-r ${
            category?.color || "from-blue-500 to-purple-500"
          } h-3 rounded-full transition-all duration-500`}
        />
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="heritage-card p-8 mb-8 shadow-xl"
      >
        <h3 className="text-2xl md:text-3xl font-heritage font-bold text-gray-900 mb-8 leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-4">
          {currentQ.options.map((option, index) => {
            let buttonClass =
              "quiz-option text-left w-full transition-all duration-300 transform hover:scale-102";

            if (showResult) {
              if (index === currentQ.correct) {
                buttonClass += " correct shadow-lg";
              } else if (
                index === selectedOption &&
                index !== currentQ.correct
              ) {
                buttonClass += " incorrect";
              }
            } else if (selectedOption === index) {
              buttonClass += " selected shadow-md";
            }

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => selectOption(index)}
                className={buttonClass}
                disabled={showResult}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                    {showResult && index === currentQ.correct && (
                      <CheckCircle className="text-green-600" size={24} />
                    )}
                    {showResult &&
                      index === selectedOption &&
                      index !== currentQ.correct && (
                        <XCircle className="text-red-600" size={24} />
                      )}
                    {!showResult && selectedOption === index && (
                      <div className="w-4 h-4 bg-saffron-500 rounded-full" />
                    )}
                    {!showResult && selectedOption !== index && (
                      <span className="text-gray-500 font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-lg">{option}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl"
            >
              <h4 className="font-bold text-blue-800 mb-3 flex items-center space-x-2">
                <Award size={18} />
                <span>Explanation</span>
              </h4>
              <p className="text-blue-700 leading-relaxed">
                {currentQ.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Next Button */}
      <div className="text-center">
        <button
          onClick={handleNextQuestion}
          disabled={selectedOption === null && !showResult}
          className="btn-heritage px-10 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          {showResult
            ? currentQuestion + 1 === questions.length
              ? "View Results"
              : "Next Question"
            : "Submit Answer"}
        </button>
      </div>
    </div>
  );
};

export default Quiz;
