import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../core/components/Header';
import { useAuth } from '../../../core/contexts/AuthContext';
import { fetchExercise, submitExercise } from '../../../services/groupService';
import { ExerciseContainer } from '../../ide/components/ExerciseContainer';

export default function GroupExercisePage() {
  const { groupId, exId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exercise, setExercise] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    const loadExercise = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchExercise(groupId, exId);
        setExercise(data);
      } catch (err) {
        setError('Exercise not found or access denied.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadExercise();
  }, [groupId, exId, user]);

  const handleGroupSubmit = async (codePayload) => {
    return await submitExercise(groupId, exId, codePayload);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B1326] text-white font-inter flex flex-col">
        <Header showBackButton />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Sign in required.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1326] text-white font-inter flex flex-col">
        <Header showBackButton />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#22D3EE] shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B1326] text-white font-inter flex flex-col">
        <Header showBackButton />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => navigate(`/groups/${groupId}`)}
            className="text-[#22D3EE] hover:underline text-sm"
          >
            ← Back to Group
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0B1326] text-white font-inter">
      <Header showBackButton />
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {exercise && (
          <ExerciseContainer
            groupExercise={exercise}
            onGroupSubmit={handleGroupSubmit}
          />
        )}
      </div>
    </div>
  );
}
