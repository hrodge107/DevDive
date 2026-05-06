import { useState } from 'react';
import TimelineLesson from './TimelineLesson';

export default function TimelineUnit({ unit, index }) {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  // Parse unit number (e.g., 'u1' -> '01')
  const unitNum = unit.unit_id.replace('u', '').padStart(2, '0');
  const isFirstUnit = index === 0;

  return (
    <div className="relative max-w-3xl mx-auto mb-6">
      {/* Connecting line between units */}
      <div className={`absolute top-20 left-[2.25rem] w-px bg-[#26334D] ${isExpanded ? 'h-[calc(100%-5rem)]' : 'h-12 -bottom-12 top-auto z-0'}`} />

      {/* Unit Card */}
      <div className={`relative z-10 rounded-2xl bg-[#0F172A] border border-white/5 overflow-hidden transition-all ${isExpanded ? 'shadow-xl' : 'hover:border-white/10'}`}>
        
        {/* Header Section */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-5 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-fira text-sm
              ${isFirstUnit ? 'bg-[#003546] text-[#22D3EE]' : 'bg-[#1E293B] text-slate-500'}
            `}>
              {unitNum}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">{unit.title}</h2>
              <p className="text-slate-400 text-sm mt-1">{unit.description}</p>
            </div>
          </div>
          
          <div className="text-slate-500 mr-2">
            {isExpanded ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>

        {/* Lessons Section */}
        {isExpanded && (
          <div className="border-t border-white/5 bg-[#131A2B]">
            {unit.lessons.map((lesson, idx) => {
              let computedStatus = lesson.status;
              
              // Infer in-progress status
              if (computedStatus === 'locked') {
                if (idx === 0) {
                  computedStatus = 'in_progress';
                } else if (unit.lessons[idx - 1].status === 'completed') {
                  computedStatus = 'in_progress';
                }
              }

              return (
                <TimelineLesson 
                  key={lesson.lesson_id} 
                  lesson={{...lesson, status: computedStatus}} 
                  index={idx}
                  isLast={idx === unit.lessons.length - 1}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
