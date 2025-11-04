# 🎛️ Admin Panel - Portfolio CMS

## Quick Start

```bash
# Development
bun run dev

# Access Admin Panel
http://localhost:3000/admin
```

## 📚 Dokumentasi

- **[ADMIN_PANEL_DOCS.md](./ADMIN_PANEL_DOCS.md)** - Dokumentasi lengkap Admin Panel
- **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** - Panduan integrasi dengan backend

## 🎯 Fitur Admin Panel

### ✅ Yang Sudah Dibuat

1. **Dashboard** (`/admin`)
   - Overview statistik
   - Recent activities
   - Quick links

2. **Hero Section** (`/admin/hero`)
   - Profile Management - Edit nama, badge, titles, passions
   - Social Links - CRUD social media links

3. **About/Portfolio Section** (`/admin/about`)
   - Lanyard Card (To be implemented)
   - Passions (To be implemented)
   - Highlights (To be implemented)
   - Skills (To be implemented)

4. **Education** (`/admin/education`)
   - Education Records - CRUD education history
   - Achievements (To be implemented)

5. **Projects** (`/admin/projects`)
   - Flight Logbook (To be implemented)
   - Aircraft Hangar - CRUD projects/achievements

6. **Contact** (`/admin/contact`)
   - Contact Information - CRUD contact methods

7. **Settings** (`/admin/settings`)
   - (To be implemented)

### 🎨 Reusable Components

- **DataTable** - Table dengan search, sort, pagination
- **DeleteDialog** - Confirmation dialog
- **ImageUpload** - Upload image dengan drag & drop
- **AdminLayout** - Layout dengan sidebar navigation

## 📊 Data Structure

Semua TypeScript types sudah didefinisikan di `lib/types/admin.ts`:

### Hero Section
- `HeroProfile` - Profile utama hero section
- `SocialLink` - Social media links

### About/Portfolio
- `LanyardData` - ID card data
- `Passion` - Passions (Developer, Aviation, Mountaineer)
- `Highlight` - Highlights stats
- `SkillCategory` - Skills by category

### Education
- `Education` - Education records
- `Achievement` - Achievements/certifications

### Projects
- `FlightEntry` - Experience (flight logbook metaphor)
- `HangarItem` - Projects (aircraft hangar metaphor)

### Contact
- `ContactFrequency` - Contact info (aviation frequency theme)

## 🗺️ Mapping Frontend ↔ Admin Panel

| Frontend Section | Admin Panel Path | Data Type |
|-----------------|------------------|-----------|
| Page1Hero (Terminal) | `/admin/hero` | HeroProfile, SocialLink |
| Page2Portfolio (Lanyard) | `/admin/about` | LanyardData, Passion, Highlight, SkillCategory |
| Page3Education | `/admin/education` | Education, Achievement |
| Page4ExperienceProjects | `/admin/projects` | FlightEntry, HangarItem |
| Page5Contact | `/admin/contact` | ContactFrequency |

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **UI Components**: shadcn/ui

## 🚀 Next Steps untuk Production

1. **Backend Integration**
   - Setup database (PostgreSQL)
   - Implement Prisma ORM
   - Create API routes
   - Lihat [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)

2. **Authentication**
   - Implement NextAuth.js
   - Login page
   - Protected routes
   - Role-based access

3. **File Upload**
   - Setup Cloudinary/S3
   - Image optimization
   - CDN integration

4. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

5. **Deployment**
   - Environment variables
   - Database migration
   - CI/CD pipeline

## 📝 Development Notes

### Mock Data
Saat ini admin panel menggunakan mock data (state local). Semua operasi CRUD hanya tersimpan di memory. Untuk production, replace dengan API calls ke backend.

### API Integration Template

```typescript
// Before (Mock)
const [items, setItems] = useState<Item[]>([...mockData]);

const handleCreate = (newItem: Item) => {
  setItems([...items, newItem]);
};

// After (API Integration)
const handleCreate = async (newItem: Item) => {
  try {
    const response = await fetch('/api/admin/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    const data = await response.json();
    if (data.success) {
      // Update state or refetch
      mutate('/api/admin/items');
    }
  } catch (error) {
    console.error('Failed to create item:', error);
  }
};
```

### React Query Integration

```typescript
// Install
bun add @tanstack/react-query

// Setup provider
// app/providers.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Usage in components
import { useQuery, useMutation } from '@tanstack/react-query';

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => fetch('/api/items').then(res => res.json()),
  });
  
  const createMutation = useMutation({
    mutationFn: (newItem) => 
      fetch('/api/items', {
        method: 'POST',
        body: JSON.stringify(newItem),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
```

## 🎨 Design System

### Colors
```typescript
const colors = {
  primary: {
    cyan: '#22d3ee',
    blue: '#3b82f6',
  },
  accent: {
    orange: '#fb923c',
    purple: '#a855f7',
    pink: '#ec4899',
  },
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
}
```

### Spacing
- Small: `gap-2`, `p-2` (8px)
- Medium: `gap-4`, `p-4` (16px)
- Large: `gap-6`, `p-6` (24px)
- XLarge: `gap-8`, `p-8` (32px)

### Border Radius
- Small: `rounded-lg` (8px)
- Medium: `rounded-xl` (12px)
- Large: `rounded-2xl` (16px)

## 📞 Support

Untuk pertanyaan atau issue:
1. Baca dokumentasi lengkap di [ADMIN_PANEL_DOCS.md](./ADMIN_PANEL_DOCS.md)
2. Check [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) untuk backend integration
3. Create issue di repository

## 📄 License

MIT License - Feel free to use for your own projects!

---

**Built with ❤️ using Next.js 15 & TypeScript**
