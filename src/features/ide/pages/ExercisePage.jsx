import Header from '../../../core/components/Header';
import { ExerciseContainer } from '../components/ExerciseContainer';

export default function ExercisePage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-950">
      <Header showBackButton />
      <ExerciseContainer />
    </div>
  );
}
