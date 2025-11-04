import dynamic from 'next/dynamic';

const TerminalHero = dynamic(() => import('@/components/features/TerminalHero').then(mod => ({ default: mod.TerminalHero })), {
  ssr: false,
});

interface Page1HeroProps {
  onNavigate: (page: number) => void;
}

export function Page1Hero({ onNavigate }: Page1HeroProps) {
  return <TerminalHero onNavigate={onNavigate} />;
}
