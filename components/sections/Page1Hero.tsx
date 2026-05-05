import dynamic from 'next/dynamic';

const CinematicHero = dynamic(() => import('@/components/features/CinematicHero').then(mod => ({ default: mod.CinematicHero })), {
  ssr: false,
});

interface Page1HeroProps {
  onNavigate: (page: number) => void;
}

export function Page1Hero({ onNavigate }: Page1HeroProps) {
  return <CinematicHero onNavigate={onNavigate} />;
}
