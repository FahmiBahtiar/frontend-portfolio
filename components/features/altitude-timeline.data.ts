import {
  GraduationCap,
  Award,
  Code2,
  Star,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

export interface TimelinePoint {
  id: string;
  year: string;
  month: number; // 1-12 for positioning
  altitude: number; // 0-100 (percentage)
  title: string;
  subtitle: string;
  institution: string;
  level: 'elementary' | 'junior' | 'senior' | 'bootcamp' | 'university';
  icon: LucideIcon;
  badge?: string;
  description?: string;
  gpa?: string;
}

/**
 * Fallback timeline shown only when the backend returns no education records.
 * Placeholder/sample content — the real data is CMS-owned. Kept out of the
 * component so the component isn't bloated with seed content (and so the
 * placeholder is easy to spot/replace).
 */
export const defaultTimelineData: TimelinePoint[] = [
  // Elementary School
  {
    id: '1',
    year: '2006-2012',
    month: 6,
    altitude: 0,
    title: 'Elementary School',
    subtitle: 'Foundation Building',
    institution: 'SD Negeri 1 Jakarta',
    level: 'elementary',
    icon: GraduationCap,
    badge: 'Base Camp',
    description: 'Building strong academic foundation and character development. Active in mathematics and science clubs.',
    gpa: 'Top 10 Student',
  },

  // Junior High School
  {
    id: '2',
    year: '2012-2015',
    month: 6,
    altitude: 25,
    title: 'Junior High School',
    subtitle: 'Academic Excellence',
    institution: 'SMP Negeri 5 Jakarta',
    level: 'junior',
    icon: Award,
    badge: 'Camp 1',
    description: 'National Science Olympiad participant. Started programming journey with basic algorithms.',
    gpa: '9.2 / 10',
  },

  // Senior High School
  {
    id: '3',
    year: '2015-2018',
    month: 6,
    altitude: 50,
    title: 'Intensive Bootcamp',
    subtitle: 'STEM Specialization',
    institution: 'SMA Negeri 8 Jakarta',
    level: 'bootcamp',
    icon: Trophy,
    badge: 'Camp 2',
    description: 'Science major focus on Mathematics & Physics. Won regional robotics competition. Developed first web applications.',
    gpa: '92 / 100',
  },

  // Scholarship/Bootcamp
  {
    id: '4',
    year: '2019-2020',
    month: 3,
    altitude: 75,
    title: 'Senior High School',
    subtitle: 'Full-Stack Development',
    institution: 'Tech Academy Scholarship',
    level: 'senior',
    icon: Code2,
    badge: 'Camp 3',
    description: 'Received full scholarship for intensive coding bootcamp. Mastered modern web technologies, agile development, and real-world projects.',
    gpa: 'Graduate with Distinction',
  },

  // University
  {
    id: '5',
    year: '2020-2024',
    month: 8,
    altitude: 100,
    title: 'Bachelor Degree',
    subtitle: 'Network Engineering',
    institution: 'University of Technology',
    level: 'university',
    icon: Star,
    badge: '🎓 SUMMIT',
    description: 'Specialized in Network Security, Cloud Computing, and Full-Stack Development. Final project: Smart Network Monitoring System using AI/ML.',
    gpa: '3.85 / 4.00',
  },
];

// Level-based colors for education stages
export const categoryColors = {
  elementary: { main: '#22d3ee', glow: 'rgba(34, 211, 238, 0.5)', bg: 'from-cyan-400/20 to-blue-400/20', text: 'text-cyan-300' },
  junior: { main: '#4ade80', glow: 'rgba(74, 222, 128, 0.5)', bg: 'from-green-400/20 to-emerald-400/20', text: 'text-green-300' },
  bootcamp: { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)', bg: 'from-amber-400/20 to-orange-400/20', text: 'text-amber-300' },
  senior: { main: '#fb923c', glow: 'rgba(251, 146, 60, 0.5)', bg: 'from-orange-400/20 to-pink-400/20', text: 'text-orange-300' },
  university: { main: '#a78bfa', glow: 'rgba(167, 139, 250, 0.5)', bg: 'from-purple-400/20 to-pink-400/20', text: 'text-purple-300' },
};
