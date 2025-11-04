# Backend Integration Guide

## 🎯 Overview

Panduan ini menjelaskan cara mengintegrasikan Admin Panel dengan backend untuk menyimpan dan mengelola data portfolio secara persisten.

## 🗄️ Database Schema Design

### 1. Hero Profile Table
```sql
CREATE TABLE hero_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  badge VARCHAR(255) NOT NULL,
  titles TEXT[] NOT NULL, -- Array of strings
  passions TEXT NOT NULL,
  login_message TEXT NOT NULL,
  cta_text VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Social Links Table
```sql
CREATE TABLE social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('github', 'linkedin', 'instagram', 'twitter')),
  url TEXT NOT NULL,
  username VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Lanyard Data Table
```sql
CREATE TABLE lanyard_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  photo TEXT, -- URL to photo
  role VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  id_number VARCHAR(100) NOT NULL,
  blood_type VARCHAR(10),
  nationality VARCHAR(100),
  location VARCHAR(255),
  qr_data TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Passions Table
```sql
CREATE TABLE passions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  color VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  stats_label VARCHAR(100),
  stats_value VARCHAR(100),
  gradient TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Highlights Table
```sql
CREATE TABLE highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon VARCHAR(50) NOT NULL,
  label VARCHAR(255) NOT NULL,
  value VARCHAR(255) NOT NULL,
  color VARCHAR(50),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. Skills Table
```sql
CREATE TABLE skill_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL CHECK (category IN ('developer', 'aviation', 'mountaineering')),
  skills TEXT[] NOT NULL, -- Array of skill names
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7. Education Table
```sql
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  degree VARCHAR(255) NOT NULL,
  institution VARCHAR(255) NOT NULL,
  period VARCHAR(100) NOT NULL,
  gpa VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 8. Achievements Table
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL CHECK (category IN ('developer', 'aviation', 'mountaineering')),
  title VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  date VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  certificate_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 9. Flight Logbook Table
```sql
CREATE TABLE flight_logbook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  callsign VARCHAR(100) NOT NULL,
  departure_airport VARCHAR(255) NOT NULL,
  departure_code VARCHAR(10) NOT NULL,
  departure_date VARCHAR(100) NOT NULL,
  arrival_airport VARCHAR(255) NOT NULL,
  arrival_code VARCHAR(10) NOT NULL,
  arrival_date VARCHAR(100) NOT NULL,
  aircraft VARCHAR(255) NOT NULL,
  flight_hours DECIMAL(10,2) NOT NULL,
  altitude VARCHAR(50),
  weather TEXT,
  crew TEXT[], -- Array of technologies
  remarks TEXT,
  achievements TEXT[], -- Array of achievements
  color VARCHAR(50) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 10. Hangar Items (Projects) Table
```sql
CREATE TABLE hangar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL CHECK (category IN ('github', 'flight', 'mountain')),
  name VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  classification VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  stats_stars INTEGER,
  stats_forks INTEGER,
  stats_watchers INTEGER,
  stats_altitude VARCHAR(50),
  stats_duration VARCHAR(50),
  stats_difficulty VARCHAR(50),
  spec_language VARCHAR(100),
  spec_engine VARCHAR(100),
  spec_max_speed VARCHAR(50),
  spec_range VARCHAR(50),
  spec_location VARCHAR(255),
  spec_date VARCHAR(100),
  spec_elevation VARCHAR(50),
  systems TEXT[], -- Array of technologies/systems
  url TEXT,
  icon VARCHAR(10),
  color VARCHAR(50) NOT NULL,
  achievements TEXT[], -- Array of achievements
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 11. Contact Frequencies Table
```sql
CREATE TABLE contact_frequencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  frequency VARCHAR(50) NOT NULL,
  label VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('primary', 'social')),
  color TEXT NOT NULL,
  link TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 12. Admin Users Table
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'editor')),
  avatar TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

## 🔧 Prisma Schema Example

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model HeroProfile {
  id           String   @id @default(uuid())
  name         String
  badge        String
  titles       String[]
  passions     String
  loginMessage String   @map("login_message")
  ctaText      String   @map("cta_text")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("hero_profiles")
}

model SocialLink {
  id         String   @id @default(uuid())
  platform   String
  url        String
  username   String
  orderIndex Int      @default(0) @map("order_index")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@map("social_links")
}

model Education {
  id          String   @id @default(uuid())
  degree      String
  institution String
  period      String
  gpa         String
  color       String
  description String?
  orderIndex  Int      @default(0) @map("order_index")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("education")
}

model Achievement {
  id             String   @id @default(uuid())
  category       String
  title          String
  issuer         String
  date           String
  icon           String?
  description    String?
  certificateUrl String?  @map("certificate_url")
  orderIndex     Int      @default(0) @map("order_index")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@map("achievements")
}

model HangarItem {
  id               String   @id @default(uuid())
  category         String
  name             String
  model            String
  classification   String
  description      String
  statsStars       Int?     @map("stats_stars")
  statsForks       Int?     @map("stats_forks")
  statsWatchers    Int?     @map("stats_watchers")
  statsAltitude    String?  @map("stats_altitude")
  statsDuration    String?  @map("stats_duration")
  statsDifficulty  String?  @map("stats_difficulty")
  specLanguage     String?  @map("spec_language")
  specEngine       String?  @map("spec_engine")
  specMaxSpeed     String?  @map("spec_max_speed")
  specRange        String?  @map("spec_range")
  specLocation     String?  @map("spec_location")
  specDate         String?  @map("spec_date")
  specElevation    String?  @map("spec_elevation")
  systems          String[]
  url              String?
  icon             String
  color            String
  achievements     String[]
  orderIndex       Int      @default(0) @map("order_index")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  @@map("hangar_items")
}

// ... tambahkan model lainnya
```

## 📡 API Routes Implementation

### Next.js App Router API Routes

#### 1. Hero Profile API
```typescript
// app/api/admin/hero/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const heroProfileSchema = z.object({
  name: z.string().min(1),
  badge: z.string().min(1),
  titles: z.array(z.string()),
  passions: z.string().min(1),
  loginMessage: z.string().min(1),
  ctaText: z.string().min(1),
});

// GET - Fetch hero profile
export async function GET() {
  try {
    const profile = await prisma.heroProfile.findFirst();
    
    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch profile',
    }, { status: 500 });
  }
}

// PUT - Update hero profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = heroProfileSchema.parse(body);
    
    // Assuming only one profile exists
    const profile = await prisma.heroProfile.upsert({
      where: { id: body.id || 'default' },
      update: validatedData,
      create: { ...validatedData, id: 'default' },
    });
    
    return NextResponse.json({
      success: true,
      data: profile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        message: error.errors,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update profile',
    }, { status: 500 });
  }
}
```

#### 2. Social Links API
```typescript
// app/api/admin/hero/social/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const socialLinkSchema = z.object({
  platform: z.enum(['github', 'linkedin', 'instagram', 'twitter']),
  url: z.string().url(),
  username: z.string().min(1),
  orderIndex: z.number().optional(),
});

// GET - Fetch all social links
export async function GET() {
  try {
    const links = await prisma.socialLink.findMany({
      orderBy: { orderIndex: 'asc' },
    });
    
    return NextResponse.json({
      success: true,
      data: links,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch social links',
    }, { status: 500 });
  }
}

// POST - Create new social link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = socialLinkSchema.parse(body);
    
    const link = await prisma.socialLink.create({
      data: validatedData,
    });
    
    return NextResponse.json({
      success: true,
      data: link,
      message: 'Social link created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        message: error.errors,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create social link',
    }, { status: 500 });
  }
}

// app/api/admin/hero/social/[id]/route.ts
// PUT - Update social link
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = socialLinkSchema.parse(body);
    
    const link = await prisma.socialLink.update({
      where: { id: params.id },
      data: validatedData,
    });
    
    return NextResponse.json({
      success: true,
      data: link,
      message: 'Social link updated successfully',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to update social link',
    }, { status: 500 });
  }
}

// DELETE - Delete social link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.socialLink.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Social link deleted successfully',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to delete social link',
    }, { status: 500 });
  }
}
```

#### 3. Education API
```typescript
// app/api/admin/education/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const educationSchema = z.object({
  degree: z.string().min(1),
  institution: z.string().min(1),
  period: z.string().min(1),
  gpa: z.string().min(1),
  color: z.string().min(1),
  description: z.string().optional(),
  orderIndex: z.number().optional(),
});

// GET - Fetch all education records (with pagination)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const where = search ? {
      OR: [
        { degree: { contains: search, mode: 'insensitive' } },
        { institution: { contains: search, mode: 'insensitive' } },
      ],
    } : {};
    
    const [total, data] = await Promise.all([
      prisma.education.count({ where }),
      prisma.education.findMany({
        where,
        orderBy: { orderIndex: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch education records',
    }, { status: 500 });
  }
}

// POST - Create new education record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = educationSchema.parse(body);
    
    const education = await prisma.education.create({
      data: validatedData,
    });
    
    return NextResponse.json({
      success: true,
      data: education,
      message: 'Education record created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        message: error.errors,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create education record',
    }, { status: 500 });
  }
}
```

## 🔐 Authentication Implementation

### Using NextAuth.js

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.adminUser.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        // Update last login
        await prisma.adminUser.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
};

// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### Protected API Route Middleware

```typescript
// lib/middleware/auth.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function withAuth(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    return handler(req);
  };
}

// Usage in API route
export const PUT = withAuth(async (request: NextRequest) => {
  // Your protected route logic
});
```

## 📤 File Upload Implementation

### Using Cloudinary

```typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'portfolio',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(buffer);
  });
}

// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided',
      }, { status: 400 });
    }

    const result = await uploadImage(file);

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to upload image',
    }, { status: 500 });
  }
}
```

## 🔄 Frontend Integration with React Query

```typescript
// lib/api/hero.ts
import { HeroProfile, SocialLink } from '@/lib/types/admin';

export const heroApi = {
  getProfile: async (): Promise<HeroProfile> => {
    const res = await fetch('/api/admin/hero/profile');
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  updateProfile: async (profile: Partial<HeroProfile>): Promise<HeroProfile> => {
    const res = await fetch('/api/admin/hero/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  getSocialLinks: async (): Promise<SocialLink[]> => {
    const res = await fetch('/api/admin/hero/social');
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  createSocialLink: async (link: Omit<SocialLink, 'id'>): Promise<SocialLink> => {
    const res = await fetch('/api/admin/hero/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(link),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  updateSocialLink: async (id: string, link: Partial<SocialLink>): Promise<SocialLink> => {
    const res = await fetch(`/api/admin/hero/social/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(link),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
  },

  deleteSocialLink: async (id: string): Promise<void> => {
    const res = await fetch(`/api/admin/hero/social/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
  },
};

// hooks/useHero.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { heroApi } from '@/lib/api/hero';

export function useHeroProfile() {
  return useQuery({
    queryKey: ['hero', 'profile'],
    queryFn: heroApi.getProfile,
  });
}

export function useUpdateHeroProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: heroApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero', 'profile'] });
    },
  });
}

export function useSocialLinks() {
  return useQuery({
    queryKey: ['hero', 'social'],
    queryFn: heroApi.getSocialLinks,
  });
}

// Usage in component
function HeroProfilePage() {
  const { data: profile, isLoading } = useHeroProfile();
  const updateProfile = useUpdateHeroProfile();

  const handleSubmit = async (formData: any) => {
    try {
      await updateProfile.mutateAsync(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  // ... rest of component
}
```

## 🚀 Deployment Checklist

1. **Environment Variables**
   ```env
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="your-secret"
   NEXTAUTH_URL="https://yourdomain.com"
   CLOUDINARY_CLOUD_NAME="..."
   CLOUDINARY_API_KEY="..."
   CLOUDINARY_API_SECRET="..."
   ```

2. **Database Migration**
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed Initial Admin User**
   ```typescript
   // prisma/seed.ts
   import { PrismaClient } from '@prisma/client';
   import bcrypt from 'bcryptjs';

   const prisma = new PrismaClient();

   async function main() {
     const passwordHash = await bcrypt.hash('admin123', 10);

     await prisma.adminUser.upsert({
       where: { email: 'admin@example.com' },
       update: {},
       create: {
         email: 'admin@example.com',
         passwordHash,
         name: 'Admin',
         role: 'admin',
       },
     });
   }

   main();
   ```

4. **Build & Deploy**
   ```bash
   bun run build
   ```

## 📝 Notes

- Pastikan semua endpoint API dilindungi dengan authentication
- Implement rate limiting untuk security
- Setup CORS jika frontend dan backend terpisah
- Gunakan environment variables untuk sensitive data
- Implement proper error handling dan logging
- Setup monitoring dan alerting

## 🎯 Next Steps

1. Setup database (PostgreSQL recommended)
2. Install Prisma: `bun add prisma @prisma/client`
3. Initialize Prisma: `npx prisma init`
4. Create schema and migrate: `npx prisma migrate dev`
5. Implement API routes satu per satu
6. Test CRUD operations
7. Implement authentication
8. Deploy to production
