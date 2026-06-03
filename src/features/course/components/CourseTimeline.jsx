import TimelineUnit from './TimelineUnit';

export default function CourseTimeline({ curriculum }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-4">
        {curriculum.map((unit, index) => (
          <TimelineUnit key={unit.unit_id} unit={unit} index={index} />
        ))}
        
        {/* End of timeline indicator */}
        <div className="flex justify-center pt-8 pb-24">
          <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-700 shadow-[0_0_15px_rgba(255,255,255,0.05)]" />
        </div>
      </div>
    </div>
  );
}
