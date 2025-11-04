# Aviation-Themed Portfolio Website

A modern, aviation-inspired portfolio website built with Next.js 15, featuring a comprehensive Admin CMS Panel for content management.

## 🚀 Features

### Frontend
- **Aviation Theme**: Unique cockpit-inspired design with HUD elements
- **Interactive Components**: 3D carousels, flight data cards, altitude timeline
- **Responsive Design**: Glassmorphism UI with smooth animations
- **Optimized Performance**: Next.js 15 App Router with lazy loading

### Admin CMS Panel ✨
- **Complete Content Management**: CRUD operations for all sections
- **Modern Dashboard**: Statistics, recent activities, quick actions
- **Type-Safe**: Full TypeScript implementation
- **Responsive UI**: Works on desktop, tablet, and mobile
- **Ready for Backend**: Pre-built API structure and database schemas

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## 📦 Installation

```bash
# Clone repository
git clone <your-repo-url>
cd fe-next

# Install dependencies
bun install

# Run development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) for the main site.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the Admin Panel.

## 📚 Documentation

### Admin Panel Documentation
Complete documentation for the Admin CMS Panel is available in the `/docs` folder:

- **[📖 DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Start here for navigation
- **[🎯 ADMIN_README.md](./ADMIN_README.md)** - Quick start guide
- **[📘 ADMIN_PANEL_DOCS.md](./ADMIN_PANEL_DOCS.md)** - Complete documentation
- **[🔌 BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** - Backend integration guide
- **[📋 ADMIN_SUMMARY.md](./ADMIN_SUMMARY.md)** - Project overview
- **[🗺️ ADMIN_ROADMAP.md](./ADMIN_ROADMAP.md)** - Changelog & roadmap
- **[⚡ ADMIN_QUICK_REF.md](./ADMIN_QUICK_REF.md)** - Quick reference

### Admin Panel Features

#### 🎨 7 Management Pages
1. **Dashboard** - Overview statistics and quick actions
2. **Hero Profile** - Personal information and rotating titles
3. **Social Links** - Social media management
4. **Education Records** - Academic history
5. **Achievements** - Certifications and awards
6. **Projects/Hangar** - Portfolio projects showcase
7. **Contact Info** - Contact channels management

#### 🧩 Reusable Components
- `DataTable` - Sortable, searchable data tables with pagination
- `DeleteDialog` - Confirmation dialogs with animations
- `ImageUpload` - Drag & drop image uploader
- `AdminLayout` - Responsive sidebar navigation

## 🏗️ Project Structure

```
fe-next/
├── app/
│   ├── admin/              # Admin Panel pages
│   │   ├── layout.tsx      # Admin layout wrapper
│   │   ├── page.tsx        # Dashboard
│   │   ├── hero/           # Hero section management
│   │   ├── education/      # Education management
│   │   ├── projects/       # Projects management
│   │   └── contact/        # Contact management
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── admin/              # Admin components
│   ├── features/           # Feature components
│   ├── sections/           # Page sections
│   └── ui/                 # UI components (shadcn)
├── lib/
│   ├── types/
│   │   └── admin.ts        # Admin type definitions
│   ├── utils.ts
│   └── animations.ts
└── public/
    └── assets/
```

## 🎯 Next Steps

### Backend Integration (Priority: HIGH)
Follow the [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) guide to:
1. Setup PostgreSQL database
2. Install and configure Prisma ORM
3. Create API routes
4. Implement authentication with NextAuth.js
5. Integrate file upload with Cloudinary

### Pending Features
- [ ] About section pages (Lanyard, Passions, Highlights, Skills)
- [ ] Flight Logbook management page
- [ ] Authentication system
- [ ] API integration
- [ ] File upload functionality
- [ ] Testing suite

See [ADMIN_ROADMAP.md](./ADMIN_ROADMAP.md) for complete roadmap.

## 🔧 Development

```bash
# Development server
bun dev

# Build for production
bun run build

# Start production server
bun start

# Lint code
bun run lint
```

## 📱 Admin Panel Access

Currently, the admin panel runs with **mock data** for demonstration purposes.

**URL**: `http://localhost:3000/admin`

Once backend is integrated, authentication will be required to access the admin panel.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

[Your License Here]

## 👨‍💻 Author

[Your Name]

---

**Note**: This project includes a fully-featured Admin CMS Panel ready for backend integration. Start with [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) to understand the complete system.
