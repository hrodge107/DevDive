import Header from '../../../core/components/Header';
import { PlaygroundContainer } from '../components/PlaygroundContainer';

export default function PlaygroundPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-950">
      <Header showBackButton={true}>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
          Playground
        </span>
      </Header>

      {/* Playground Editor Container */}
      <PlaygroundContainer />
    </div>
  );
}
