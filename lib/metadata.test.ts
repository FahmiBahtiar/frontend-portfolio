import { describe, it, expect, vi } from 'vitest';
import { generateStructuredData, generateDynamicMetadata } from './metadata';

vi.mock('./services/server-data', () => ({
  getAllDataForSEO: vi.fn().mockResolvedValue({
    hero: {
      name: 'Fahmi Bahtiar Adi Nugroho',
      badge: 'Blimbing',
      titles: ['Backend Developer'],
      description: 'Backend developer passionate about aviation.',
      techStack: [{ label: 'NestJS' }, { label: 'TypeScript' }],
      photo: 'https://example.com/photo.jpg',
    },
    social: [{ url: 'https://github.com/FahmiBahtiar' }],
    passions: [{ title: 'Aviation' }],
    education: [{ institution: 'Universitas Dian Nuswantoro' }],
    projects: [
      {
        title: 'Portfolio Website',
        description: 'Next.js portfolio',
        demoUrl: 'https://blimbing.me',
        date: '2026',
        tags: ['nextjs', 'typescript'],
      },
    ],
    skills: [],
    achievements: [
      {
        id: 'cert-1',
        category: 'developer',
        title: 'Skema Sertifikasi Pengembang Web',
        issuer: 'Badan Nasional Sertifikasi Profesi',
        date: '2026',
        certificateUrl: 'https://res.cloudinary.com/.../cert.pdf',
        credentialUrl: 'https://bnsp.go.id/verify/123',
        description: 'BNSP certified web developer',
      },
      {
        id: 'cert-2',
        category: 'aviation',
        title: 'MotoGP World Tour',
        issuer: 'IVAO',
        date: '2024',
        certificateUrl: 'https://ivao.aero/award.gif',
      },
    ],
    flights: [
      {
        company: 'Pura Group',
        departure: { roles: ['Software Engineer'] },
      },
    ],
  }),
}));

describe('Metadata & Structured Data SEO Generator', () => {
  it('generates hasCredential and worksFor dynamically inside Person schema', async () => {
    const structuredData = await generateStructuredData();
    expect(structuredData).not.toBeNull();
    const person = structuredData?.personSchema;

    expect(person?.name).toBe('Fahmi Bahtiar Adi Nugroho');
    expect(person?.worksFor).toEqual([
      { '@type': 'Organization', name: 'Pura Group' },
    ]);

    expect(person?.hasCredential).toHaveLength(2);
    expect(person?.hasCredential?.[0]).toMatchObject({
      '@type': 'EducationalOccupationalCredential',
      name: 'Skema Sertifikasi Pengembang Web',
      credentialCategory: 'Certificate',
      recognizedBy: {
        '@type': 'Organization',
        name: 'Badan Nasional Sertifikasi Profesi',
      },
      url: 'https://bnsp.go.id/verify/123',
      description: 'BNSP certified web developer',
      dateCreated: '2026',
    });

    expect(person?.hasCredential?.[1]).toMatchObject({
      '@type': 'EducationalOccupationalCredential',
      name: 'MotoGP World Tour',
      credentialCategory: 'Aviation Credential',
      recognizedBy: {
        '@type': 'Organization',
        name: 'IVAO',
      },
      url: 'https://ivao.aero/award.gif',
    });
  });

  it('generates credentialsSchema as ItemList for rich indexing', async () => {
    const structuredData = await generateStructuredData();
    const credentialsList = structuredData?.credentialsSchema;

    expect(credentialsList).not.toBeNull();
    expect(credentialsList?.numberOfItems).toBe(2);
    expect(credentialsList?.itemListElement[0].item.name).toBe('Skema Sertifikasi Pengembang Web');
  });

  it('includes dynamic certificate and company keywords in meta keywords', async () => {
    const metadata = await generateDynamicMetadata();
    const keywords = (metadata.keywords as string[]) || [];

    expect(keywords).toContain('skema sertifikasi pengembang web');
    expect(keywords).toContain('badan nasional sertifikasi profesi');
    expect(keywords).toContain('pura group');
    expect(keywords).toContain('nestjs');
  });
});
