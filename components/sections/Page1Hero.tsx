import { TerminalHero } from '@/components/features/TerminalHero';

interface Page1HeroProps {
  onNavigate: (page: number) => void;
}

export function Page1Hero({ onNavigate }: Page1HeroProps) {
  return <TerminalHero onNavigate={onNavigate} />;
}
