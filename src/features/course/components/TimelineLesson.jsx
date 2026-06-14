import { Link } from 'react-router-dom';

const CompletedIcon = () => (
  <svg className="w-5 h-5 text-[#22D3EE]" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const InProgressIcon = () => (
  <svg className="w-5 h-5 text-[#F59E0B]" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM2.5 10a7.5 7.5 0 0115 0h-15z" />
  </svg>
);

const NotStartedIcon = () => (
  <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="9" strokeWidth="2" />
  </svg>
);

const PadlockIcon = () => (
  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function TimelineLesson({ lesson, index, isLast }) {
  let Icon = NotStartedIcon;
  let statusText = 'START';
  let statusColor = 'text-slate-500';
  
  if (lesson.status === 'completed') {
    Icon = CompletedIcon;
    statusText = 'COMPLETED';
    statusColor = 'text-[#22D3EE]';
  } else if (lesson.status === 'auth_locked') {
    Icon = PadlockIcon;
    statusText = 'LOCKED';
    statusColor = 'text-red-400';
  }

  const content = (
    <div className={`flex items-center justify-between p-4 px-6 hover:bg-white/5 transition-colors cursor-pointer ${!isLast ? 'border-b border-white/5' : ''}`}>
      <div className="flex items-center gap-4">
        <Icon />
        <span className={`text-sm md:text-base font-medium ${lesson.status === 'auth_locked' ? 'text-slate-500' : 'text-slate-200'}`}>
          {index + 1}. {lesson.title}
        </span>
      </div>
      <div className={`text-[10px] font-bold tracking-widest uppercase ${statusColor}`}>
        {statusText}
      </div>
    </div>
  );

  const exerciseId = Array.isArray(lesson.exercises) ? lesson.exercises[0]?.id : lesson.exercises?.id;
  const linkTarget = lesson.status === 'auth_locked'
    ? `/login?redirect=/exercise/${exerciseId}`
    : (exerciseId ? `/exercise/${exerciseId}` : `/lesson/${lesson.id}`);

  return (
    <Link to={linkTarget} className="block">
      {content}
    </Link>
  );
}
