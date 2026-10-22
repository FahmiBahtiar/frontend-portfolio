import { CinematicHero } from '@/components/features/CinematicHero';

interface Page1HeroProps {
  onNavigate: (page: number) => void;
  isReady?: boolean;
}

export function Page1Hero({ onNavigate, isReady = true }: Page1HeroProps) {
  return <CinematicHero onNavigate={onNavigate} isReady={isReady} />;
}
