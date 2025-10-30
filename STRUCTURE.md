# Struktur Proyek Next.js

Proyek ini telah direstrukturisasi mengikuti best practices Next.js App Router.

## 📁 Struktur Folder

```
fe-next/
├── app/                          # App Router - Pages & Routing
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage (/)
│   ├── globals.css              # Global styles
│   └── favicon.ico              # Favicon
│
├── components/                   # Reusable Components
│   ├── ui/                      # shadcn/ui components
│   │   ├── accordion.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   ├── features/                # Feature-specific components
│   │   ├── AircraftHangar.tsx
│   │   ├── AltitudeTimeline.tsx
│   │   ├── AviationHUD.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── TerminalHero.tsx
│   │   └── ...
│   │
│   ├── sections/                # Page sections (formerly app/pages)
│   │   ├── Page1Hero.tsx
│   │   ├── Page2Portfolio.tsx
│   │   ├── Page3Education.tsx
│   │   ├── Page4ExperienceProjects.tsx
│   │   ├── Page4Gallery.tsx
│   │   └── Page5Contact.tsx
│   │
│   ├── layout/                  # Layout components (future use)
│   │
│   └── figma/                   # Figma-related components
│       └── ImageWithFallback.tsx
│
├── lib/                         # Utility functions & helpers
│   ├── utils.ts                 # General utilities
│   ├── animations.ts            # Animation configurations
│   └── performance.ts           # Performance optimizations
│
├── public/                      # Static assets
│   └── assets/
│
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── package.json                 # Dependencies
```

## 🎯 Konvensi Import

### Absolute Imports (Recommended)
Gunakan path alias `@/` untuk import dari root:

```tsx
// ✅ Good - Absolute imports
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/features/LoadingScreen';
import { Page1Hero } from '@/components/sections/Page1Hero';
import { cn } from '@/lib/utils';
```

### Relative Imports
Hanya digunakan untuk file dalam folder yang sama:

```tsx
// ✅ OK - Untuk sesama file di folder ui/
import { cn } from './utils';
import { Button } from './button';
```

## 📋 Perubahan dari Struktur Lama

### Sebelum (❌ Tidak Standar)
```
app/
├── components/         # ❌ Salah - components di dalam app/
│   ├── ui/
│   └── *.tsx
├── pages/             # ❌ Salah - mixing Pages Router dengan App Router
│   └── Page*.tsx
├── layout.tsx
└── page.tsx
```

### Sesudah (✅ Standar Next.js)
```
app/                   # ✅ Hanya routing & pages
├── layout.tsx
├── page.tsx
└── globals.css

components/            # ✅ Shared components di root
├── ui/               # shadcn/ui
├── features/         # Feature components
├── sections/         # Page sections
└── layout/           # Layout components
```

## 🚀 Routing di App Router

Next.js 13+ App Router menggunakan file-system based routing:

- `app/page.tsx` → `/` (homepage)
- `app/about/page.tsx` → `/about`
- `app/blog/page.tsx` → `/blog`
- `app/blog/[slug]/page.tsx` → `/blog/:slug`

### Untuk membuat route baru:
```bash
# Buat folder baru di app/
mkdir app/portfolio
# Buat page.tsx di dalamnya
touch app/portfolio/page.tsx
```

## 📦 Component Organization

### UI Components (`components/ui/`)
- Komponen reusable dari shadcn/ui
- Design system components
- Hanya UI logic, tidak ada business logic

### Feature Components (`components/features/`)
- Komponen yang menghandle feature spesifik
- Bisa mengandung business logic
- Contoh: LoadingScreen, AviationHUD, TerminalHero

### Section Components (`components/sections/`)
- Komponen untuk section halaman
- Biasanya full-screen atau large sections
- Digunakan di homepage untuk different sections

### Layout Components (`components/layout/`)
- Header, Footer, Sidebar
- Wrapper components
- Navigation components

## 🔧 Development

```bash
# Development
bun run dev

# Build
bun run build

# Start production server
bun run start

# Lint
bun run lint
```

## ✨ Best Practices

1. **Gunakan Server Components** secara default
2. Tambahkan `'use client'` hanya jika perlu client-side interactivity
3. **Lazy load** komponen berat dengan `dynamic()`
4. Gunakan **absolute imports** dengan `@/`
5. Organisir komponen berdasarkan fungsi (ui/features/sections/layout)
6. Keep components focused dan single-responsibility

## 📚 Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Project Structure](https://nextjs.org/docs/getting-started/project-structure)
- [shadcn/ui Components](https://ui.shadcn.com/)
