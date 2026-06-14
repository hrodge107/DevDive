import { supabase } from '../lib/supabaseClient';

export const fetchUserProgress = async (userId) => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('user_progress')
    .select('lesson_id, exercise_id')
    .eq('user_id', userId)
    .eq('is_completed', true);
    
  if (error) throw error;
  return data;
};

export const markLessonCompleted = async (userId, unitId, lessonId) => {
  if (!userId || !lessonId) return;
  
  const { data: existingProgress, error: selectError } = await supabase
    .from('user_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();
    
  if (selectError) throw selectError;
  
  if (!existingProgress) {
    const { error: insertError } = await supabase
      .from('user_progress')
      .insert([{
        user_id: userId,
        unit_id: unitId,
        lesson_id: lessonId,
        is_completed: true,
      }]);
    if (insertError) throw insertError;
  }
};
