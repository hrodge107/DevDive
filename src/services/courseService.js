import { supabase } from '../lib/supabaseClient';

export const fetchCurriculum = async () => {
  const { data, error } = await supabase
    .from('units')
    .select(`
      id, unit_number, title,
      lessons (
        id, lesson_number, title,
        quizzes (id),
        exercises (id)
      )
    `)
    .order('unit_number', { ascending: true })
    .order('lesson_number', { referencedTable: 'lessons', ascending: true });
    
  if (error) throw error;
  return data;
};

export const fetchLesson = async (lessonId) => {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      units (title),
      quizzes (*)
    `)
    .eq('id', parseInt(lessonId))
    .single();

  if (error) throw error;
  return data;
};

export const fetchExerciseConfig = async (exerciseId) => {
  const { data, error } = await supabase
    .from('exercises')
    .select('id, lesson_id, task_description, starter_files, lessons(title, unit_id)')
    .eq('id', exerciseId)
    .single();
    
  if (error) throw error;
  return data;
};
