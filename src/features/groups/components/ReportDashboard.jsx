import { useEffect, useState } from 'react';
import { fetchReport } from '../../../services/groupService';
import StudentStatusModal from './StudentStatusModal';

export default function ReportDashboard({ groupId }) {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const loadReport = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchReport(groupId);
        setReport(data);
      } catch (e) {
        setError('Failed to load report.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadReport();
  }, [groupId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#22D3EE]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 text-center py-16">{error}</div>;
  }

  if (!report) return null;

  const segments = [
    {
      id: 'not_answered',
      title: 'Not Answered',
      subtitle: 'Missing submissions',
      data: report.not_answered,
      color: 'amber',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      textColor: 'text-amber-400',
      dotColor: 'bg-amber-400',
      badge: (student) => `${student.missing_count} missing`,
    },
    {
      id: 'low_score',
      title: 'Low Score',
      subtitle: 'Aggregate < 60%',
      data: report.low_score,
      color: 'red',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      textColor: 'text-red-400',
      dotColor: 'bg-red-400',
      badge: (student) => `${student.aggregate_percent}%`,
    },
    {
      id: 'doing_well',
      title: 'Doing Well',
      subtitle: 'Aggregate ≥ 60%',
      data: report.doing_well,
      color: 'emerald',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      textColor: 'text-emerald-400',
      dotColor: 'bg-emerald-400',
      badge: (student) => `${student.aggregate_percent}%`,
    },
  ];

  const totalStudents = (report.not_answered?.length || 0) + (report.low_score?.length || 0) + (report.doing_well?.length || 0);

  return (
    <div>
      {/* Summary */}
      <div className="mb-6 flex items-center gap-4 text-xs text-slate-500">
        <span>{totalStudents} students</span>
        <span>•</span>
        <span>{report.total_tasks} tasks</span>
      </div>

      {totalStudents === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">No data yet. Active members and tasks are needed to generate a report.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {segments.map(seg => (
            <div key={seg.id} className="space-y-3">
              {/* Segment Header */}
              <div className={`${seg.bgColor} ${seg.borderColor} border rounded-xl px-4 py-3`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`w-2 h-2 ${seg.dotColor} rounded-full`}></span>
                  <h3 className={`text-sm font-semibold ${seg.textColor}`}>{seg.title}</h3>
                  <span className={`text-xs ${seg.textColor} opacity-60 ml-auto`}>({seg.data.length})</span>
                </div>
                <p className="text-xs text-slate-500">{seg.subtitle}</p>
              </div>

              {/* Student Cards */}
              {seg.data.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No students</p>
              ) : (
                <div className="space-y-2">
                  {seg.data.map(student => (
                    <button
                      key={student.user_id}
                      onClick={() => setSelectedStudent(student)}
                      className="w-full flex items-center justify-between bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-3 hover:border-slate-700 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${seg.bgColor} rounded-full flex items-center justify-center ${seg.textColor} font-bold text-xs`}>
                          {(student.username || '?')[0].toUpperCase()}
                        </div>
                        <span className="text-white text-sm font-medium group-hover:text-[#22D3EE] transition-colors">
                          {student.username}
                        </span>
                      </div>
                      <span className={`text-xs font-mono ${seg.textColor} ${seg.bgColor} px-2 py-1 rounded-md`}>
                        {seg.badge(student)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Student Status Modal */}
      {selectedStudent && (
        <StudentStatusModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}
