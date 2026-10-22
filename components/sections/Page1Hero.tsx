import { CinematicHero } from '@/components/features/CinematicHero';

interface Page1HeroProps {
  onNavigate: (page: number) => void;
}

export function Page1Hero({ onNavigate }: Page1HeroProps) {
  return <CinematicHero onNavigate={onNavigate} />;
}
