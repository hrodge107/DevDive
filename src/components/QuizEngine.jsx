import React, { useState, useEffect } from 'react';

export default function QuizEngine({ 
  questions, 
  onPassed, 
  onCancel, 
  passThreshold = 80 
}) {
  const [phase, setPhase] = useState('active');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (phase === 'evaluation') {
      const correctCount = questions.reduce((acc, q, idx) => {
        return acc + (userAnswers[idx] === q.correct_answer_index ? 1 : 0);
      }, 0);
      const calculatedScore = Math.round((correctCount / questions.length) * 100);
      setScore(calculatedScore);
      setPhase('results');
      if (calculatedScore >= passThreshold) {
        onPassed();
      }
    }
  }, [phase, questions, userAnswers, passThreshold, onPassed]);

  if (!questions || questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const hasSelection = userAnswers[currentIndex] !== undefined;
  const isFinalQuestion = currentIndex === questions.length - 1;

  const handleOptionClick = (index) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentIndex]: index
    }));
  };

  const handleNext = () => {
    if (hasSelection && !isFinalQuestion) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (hasSelection) {
      setPhase('evaluation');
    }
  };

  const handleRetry = () => {
    setUserAnswers({});
    setCurrentIndex(0);
    setPhase('active');
  };

  return (
    <div className="bg-[#181F31] rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
      {phase === 'active' && (
        <div className="p-8">
           <div className="mb-8">
             <div className="flex justify-between items-center mb-2">
               <span className="text-slate-400 text-sm font-medium">Question {currentIndex + 1} of {questions.length}</span>
             </div>
             <div className="w-full bg-[#0F172A] rounded-full h-2">
               <div 
                 className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                 style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
               />
             </div>
           </div>

           <h3 className="text-white text-xl font-medium mb-6 leading-relaxed">
             {currentQuestion.question}
           </h3>

           <div className="space-y-3 font-fira text-sm mb-8">
             {currentQuestion.options.map((option, index) => {
               const isSelected = userAnswers[currentIndex] === index;
               return (
                 <div
                   key={index}
                   onClick={() => handleOptionClick(index)}
                   className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                     isSelected 
                       ? 'border-cyan-500 bg-[#0F172A] text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                       : 'border-white/5 bg-[#0F172A] hover:border-white/10 text-slate-400'
                   }`}
                 >
                   <div className={`w-4 h-4 rounded-full border ${
                     isSelected ? 'border-4 border-cyan-500 bg-[#0F172A]' : 'border-slate-500 bg-transparent'
                   }`} />
                   <span>{option}</span>
                 </div>
               );
             })}
           </div>

           <div className="flex justify-between items-center pt-6 border-t border-white/5">
             <button 
               onClick={() => setIsExitModalOpen(true)}
               className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
             >
               Exit Quiz
             </button>
             
             <div className="flex gap-3">
               {currentIndex > 0 && (
                 <button 
                   onClick={handleBack}
                   className="px-6 py-2.5 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-all text-sm font-medium"
                 >
                   Back
                 </button>
               )}
               
               {!isFinalQuestion ? (
                 <button 
                   onClick={handleNext}
                   disabled={!hasSelection}
                   className={`px-6 py-2.5 rounded-lg transition-all text-sm font-medium ${
                     hasSelection 
                       ? 'bg-cyan-500 hover:bg-cyan-400 text-[#0B1326] shadow-lg shadow-cyan-500/20' 
                       : 'bg-white/5 text-slate-500 cursor-not-allowed'
                   }`}
                 >
                   Next
                 </button>
               ) : (
                 <button 
                   onClick={handleSubmit}
                   disabled={!hasSelection}
                   className={`px-6 py-2.5 rounded-lg transition-all text-sm font-medium ${
                     hasSelection 
                       ? 'bg-cyan-500 hover:bg-cyan-400 text-[#0B1326] shadow-lg shadow-cyan-500/20' 
                       : 'bg-white/5 text-slate-500 cursor-not-allowed'
                   }`}
                 >
                   Submit Quiz
                 </button>
               )}
             </div>
           </div>
        </div>
      )}

      {phase === 'results' && (
        <div className="p-8 text-center py-16">
          {score >= passThreshold ? (
            <>
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">You scored {score}%</h2>
              <p className="text-slate-400 mb-8">You have successfully passed the knowledge check.</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">You scored {score}%</h2>
              <p className="text-slate-400 mb-8">You need {passThreshold}% to pass. Don't worry, you can try again!</p>
              <button 
                onClick={handleRetry}
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-[#0B1326] rounded-xl transition-all shadow-lg shadow-cyan-500/20 font-semibold"
              >
                Retry Knowledge Check
              </button>
            </>
          )}
        </div>
      )}

      {isExitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="p-5 border-b border-gray-800 bg-gray-900/50">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Exit Knowledge Check?
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-gray-300 leading-relaxed text-sm">
                Your progress will be lost. Are you sure you want to exit?
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsExitModalOpen(false)} 
                  className="px-4 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
                >
                  Keep Going
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsExitModalOpen(false);
                    setUserAnswers({});
                    setCurrentIndex(0);
                    onCancel();
                  }} 
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all shadow-lg shadow-red-500/20 text-sm font-semibold"
                >
                  Exit Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
