# Admin Panel Documentation

## 🎯 Overview

Admin Panel Portfolio adalah Content Management System (CMS) yang dirancang khusus untuk mengelola semua konten di website portfolio Anda. Panel ini menyediakan interface yang intuitif dan modern untuk melakukan operasi CRUD (Create, Read, Update, Delete) pada semua section di frontend.

## 📁 Struktur Folder

```
app/admin/
├── layout.tsx                    # Layout utama admin panel
├── page.tsx                      # Dashboard home
├── hero/
│   ├── profile/
│   │   └── page.tsx             # Manage hero profile
│   └── social/
│       └── page.tsx             # Manage social links
├── about/
│   ├── lanyard/
│   │   └── page.tsx             # Manage lanyard card
│   ├── passions/
│   │   └── page.tsx             # Manage passions
│   ├── highlights/
│   │   └── page.tsx             # Manage highlights
│   └── skills/
│       └── page.tsx             # Manage skills
├── education/
│   ├── records/
│   │   └── page.tsx             # Manage education
│   └── achievements/
│       └── page.tsx             # Manage achievements
├── projects/
│   ├── logbook/
│   │   └── page.tsx             # Manage flight logbook
│   └── hangar/
│       └── page.tsx             # Manage projects (hangar)
├── contact/
│   └── page.tsx                 # Manage contact info
└── settings/
    └── page.tsx                 # Admin settings

components/admin/
├── AdminLayout.tsx              # Layout dengan sidebar & header
├── DataTable.tsx                # Reusable data table dengan sort, search, pagination
├── DeleteDialog.tsx             # Confirmation dialog untuk delete
└── ImageUpload.tsx              # Upload image dengan preview

lib/types/
└── admin.ts                     # TypeScript types untuk admin
```

## 🚀 Cara Mengakses Admin Panel

1. Jalankan development server:
```bash
bun run dev
```

2. Akses admin panel di browser:
```
http://localhost:3000/admin
```

## 📊 Fitur Admin Panel

### 1. Dashboard (/)
- Overview statistik portfolio
- Total projects, education, achievements
- Recent activities
- Quick links ke halaman penting

### 2. Hero Section (/admin/hero)

#### Profile Management (/admin/hero/profile)
**Data yang bisa dikelola:**
- Full Name
- Badge/Role (e.g., "Backend Developer")
- Rotating Titles (array of strings yang akan rotate di hero)
- Passions (e.g., "Coding • Aviation • Mountaineering")
- Welcome Message
- Call-to-Action Text

**Fitur:**
- Form validation
- Live preview
- Add/remove rotating titles dynamically

#### Social Links (/admin/hero/social)
**Data yang bisa dikelola:**
- Platform (GitHub, LinkedIn, Instagram, Twitter)
- Username
- URL
- Order

**Fitur:**
- DataTable dengan search, sort, pagination
- Add/Edit/Delete social links
- Validation untuk URL

### 3. About/Portfolio Section (/admin/about)

#### Lanyard Card (/admin/about/lanyard)
**Data yang bisa dikelola:**
- Name
- Photo
- Role
- Organization
- ID Number
- Blood Type
- Nationality
- Location
- QR Data

#### Passions (/admin/about/passions)
**Data yang bisa dikelola:**
- Icon name (lucide-react)
- Title
- Color theme
- Description
- Stats (label + value)
- Gradient
- Order

#### Highlights (/admin/about/highlights)
**Data yang bisa dikelola:**
- Icon
- Label
- Value
- Color
- Order

#### Skills (/admin/about/skills)
**Data yang bisa dikelola:**
- Category (developer, aviation, mountaineering)
- Skills array

### 4. Education Section (/admin/education)

#### Education Records (/admin/education/records)
**Data yang bisa dikelola:**
- Degree/Certification name
- Institution
- Period (e.g., "2020 - 2024")
- GPA/Grade
- Color theme
- Description (optional)
- Order

**Fitur:**
- Color picker untuk theme
- DataTable dengan filter
- Bulk actions

#### Achievements (/admin/education/achievements)
**Data yang bisa dikelola:**
- Category (developer, aviation, mountaineering)
- Title
- Issuer
- Date
- Icon
- Description
- Certificate URL
- Order

### 5. Experience & Projects (/admin/projects)

#### Flight Logbook (/admin/projects/logbook)
**Data yang bisa dikelola:**
- Callsign (e.g., "DEV-001")
- Departure (airport, code, date)
- Arrival (airport, code, date)
- Aircraft type
- Flight hours
- Altitude
- Weather conditions
- Crew/Technologies used (array)
- Remarks
- Achievements (array)
- Color theme
- Order

**Mapping ke Experience:**
- Callsign → Job title transition
- Departure → Start position
- Arrival → End position
- Crew → Technologies used
- Achievements → Key accomplishments

#### Aircraft Hangar (/admin/projects/hangar)
**Data yang bisa dikelola:**
- Category (github, flight, mountain)
- Name
- Model/Aircraft
- Classification
- Description
- Stats (stars, forks, watchers, altitude, duration, difficulty)
- Specifications (language, engine, location, date, etc.)
- Systems/Technologies (array)
- URL
- Icon
- Color theme
- Achievements (array)
- Order

**Fitur:**
- Multi-category support (GitHub projects, flight awards, mountain achievements)
- Dynamic stats based on category
- Technology tags management

### 6. Contact Information (/admin/contact)

**Data yang bisa dikelola:**
- Frequency (aviation-themed identifier)
- Label (EMAIL, PHONE, LINKEDIN, etc.)
- Value (actual contact value)
- Icon
- Type (primary, social)
- Color gradient
- Link (optional)
- Order

**Fitur:**
- Aviation-themed frequency assignment
- Color gradient picker
- Primary vs Social categorization

### 7. Settings (/admin/settings)
- General site settings
- SEO configuration
- Theme customization
- Backup & restore

## 🔧 Reusable Components

### DataTable
Komponen table dengan fitur lengkap:
```tsx
<DataTable
  data={items}
  columns={columns}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onCreate={handleCreate}
  searchPlaceholder="Search..."
  emptyMessage="No data found"
/>
```

**Features:**
- Search/filter
- Sortable columns
- Pagination
- Custom column renderers
- Actions (view, edit, delete)

### DeleteDialog
Konfirmasi dialog untuk delete action:
```tsx
<DeleteDialog
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={onConfirm}
  title="Delete Item"
  description="Are you sure?"
  itemName={item.name}
/>
```

### ImageUpload
Upload image dengan drag & drop:
```tsx
<ImageUpload
  value={imageUrl}
  onChange={setImageUrl}
  label="Upload Image"
  description="Click to upload or drag and drop"
  aspectRatio="16/9"
/>
```

**Features:**
- Drag & drop
- Preview
- File validation (type, size)
- Aspect ratio control

## 🎨 Design System

### Colors
- Primary: Cyan (400-500)
- Secondary: Blue (400-500)
- Accent: Orange (400-500), Purple (400-500)
- Success: Green (400)
- Danger: Red (400-500)
- Background: Slate (900-950)

### Components Style
- Rounded corners: `rounded-xl` (12px), `rounded-2xl` (16px)
- Backdrop blur: `backdrop-blur-xl`
- Borders: `border-white/10`
- Hover states: `hover:bg-white/10`

## 🔌 Integration dengan Backend

### API Endpoints (To Be Implemented)

#### Hero Section
```
GET    /api/admin/hero/profile
PUT    /api/admin/hero/profile
GET    /api/admin/hero/social
POST   /api/admin/hero/social
PUT    /api/admin/hero/social/:id
DELETE /api/admin/hero/social/:id
```

#### Education
```
GET    /api/admin/education
POST   /api/admin/education
PUT    /api/admin/education/:id
DELETE /api/admin/education/:id
GET    /api/admin/achievements
POST   /api/admin/achievements
PUT    /api/admin/achievements/:id
DELETE /api/admin/achievements/:id
```

#### Projects
```
GET    /api/admin/projects/logbook
POST   /api/admin/projects/logbook
PUT    /api/admin/projects/logbook/:id
DELETE /api/admin/projects/logbook/:id
GET    /api/admin/projects/hangar
POST   /api/admin/projects/hangar
PUT    /api/admin/projects/hangar/:id
DELETE /api/admin/projects/hangar/:id
```

#### Contact
```
GET    /api/admin/contact
POST   /api/admin/contact
PUT    /api/admin/contact/:id
DELETE /api/admin/contact/:id
```

### Response Format
```typescript
// Success Response
{
  success: true,
  data: {...},
  message: "Operation successful"
}

// Error Response
{
  success: false,
  error: "Error message",
  message: "User-friendly message"
}

// Paginated Response
{
  success: true,
  data: [...],
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10
  }
}
```

## 🔐 Authentication (To Be Implemented)

1. **Login Page** (`/admin/login`)
   - Email & password authentication
   - JWT token based

2. **Protected Routes**
   - Middleware untuk check authentication
   - Redirect ke login jika belum authenticated

3. **User Roles**
   - Admin: Full access
   - Editor: Limited access (no delete)

## 📝 TypeScript Types

Semua types sudah didefinisikan di `lib/types/admin.ts`:

- `HeroProfile`
- `SocialLink`
- `LanyardData`
- `Passion`
- `Highlight`
- `SkillCategory`
- `Education`
- `Achievement`
- `FlightEntry`
- `HangarItem`
- `ContactFrequency`
- `AdminUser`
- `PaginationParams`
- `ApiResponse<T>`

## 🚧 Next Steps untuk Integration Backend

1. **Setup API Routes**
   - Buat folder `app/api/admin/`
   - Implementasi semua endpoints

2. **Database Schema**
   - Design database schema berdasarkan types
   - Setup Prisma/Drizzle ORM
   - Migration files

3. **Authentication**
   - Implement NextAuth.js atau Auth.js
   - Protected API routes
   - Session management

4. **File Upload**
   - Setup storage (AWS S3, Cloudinary, atau local)
   - Image optimization
   - CDN integration

5. **Validation**
   - Zod schema untuk validation
   - Server-side validation
   - Error handling

6. **State Management**
   - React Query atau SWR untuk data fetching
   - Optimistic updates
   - Cache management

## 🎯 Mapping Frontend ke Admin Panel

### Page1Hero → /admin/hero
- Terminal commands output → Profile rotating titles
- Social links → Social links management

### Page2Portfolio → /admin/about
- Lanyard card data → Lanyard management
- Passions (Developer, Aviation, Mountaineer) → Passions management
- Highlights → Highlights management
- Skills → Skills management

### Page3Education → /admin/education
- Education records → Education records management
- Achievements (developer, aviation, mountaineering) → Achievements management

### Page4ExperienceProjects → /admin/projects
- Flight Logbook (experience) → Logbook management
- Aircraft Hangar (projects) → Hangar management

### Page5Contact → /admin/contact
- Contact frequencies → Contact management
- Social media links → Contact management (social type)

## 🛠️ Development Tips

1. **Testing Data**
   - Gunakan mock data yang sudah ada
   - Test CRUD operations
   - Test validation

2. **Error Handling**
   - Implement try-catch di semua API calls
   - User-friendly error messages
   - Loading states

3. **Performance**
   - Lazy load images
   - Debounce search
   - Optimize re-renders

4. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - Focus management

## 📞 Support

Untuk pertanyaan atau issue, silakan hubungi developer atau buat issue di repository.
