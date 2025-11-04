# 🚀 Admin Panel - Quick Reference

## Akses Cepat

```bash
# Development
bun run dev

# Admin Panel URL
http://localhost:3000/admin
```

## 📍 URL Routes

### Hero Section
- Dashboard: `/admin`
- Hero Profile: `/admin/hero/profile`
- Social Links: `/admin/hero/social`

### About/Portfolio
- Lanyard: `/admin/about/lanyard` (TBA)
- Passions: `/admin/about/passions` (TBA)
- Highlights: `/admin/about/highlights` (TBA)
- Skills: `/admin/about/skills` (TBA)

### Education
- Education Records: `/admin/education/records`
- Achievements: `/admin/education/achievements`

### Projects
- Flight Logbook: `/admin/projects/logbook` (TBA)
- Aircraft Hangar: `/admin/projects/hangar`

### Contact
- Contact Info: `/admin/contact`

### Settings
- Settings: `/admin/settings` (TBA)

## 🔧 Component Usage

### DataTable
```tsx
import { DataTable } from '@/components/admin/DataTable';

<DataTable
  data={items}
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
  ]}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onCreate={handleCreate}
  searchPlaceholder="Search..."
/>
```

### DeleteDialog
```tsx
import { DeleteDialog } from '@/components/admin/DeleteDialog';

<DeleteDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Delete Item"
  description="Are you sure?"
  itemName={item.name}
/>
```

### ImageUpload
```tsx
import { ImageUpload } from '@/components/admin/ImageUpload';

<ImageUpload
  value={imageUrl}
  onChange={setImageUrl}
  label="Photo"
  aspectRatio="1/1"
/>
```

## 📊 TypeScript Types

### Import Types
```typescript
import type {
  HeroProfile,
  SocialLink,
  Education,
  Achievement,
  HangarItem,
  FlightEntry,
  ContactFrequency,
} from '@/lib/types/admin';
```

### Example Usage
```typescript
const [items, setItems] = useState<HangarItem[]>([]);
const [formData, setFormData] = useState<Partial<HangarItem>>({});
```

## 🎨 Design Tokens

### Colors
```typescript
// Tailwind classes
'text-cyan-400'       // Primary text
'bg-cyan-500/20'      // Primary bg
'border-cyan-500/30'  // Primary border

'text-orange-400'     // Accent
'text-purple-400'     // Accent
'text-green-400'      // Success
'text-red-400'        // Danger

'bg-slate-900'        // Background
'bg-white/5'          // Subtle bg
'border-white/10'     // Subtle border
```

### Common Classes
```typescript
// Cards
'bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6'

// Buttons - Primary
'px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white'

// Buttons - Secondary
'px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white'

// Inputs
'px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50'

// Badges
'px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
```

## 📝 Common Patterns

### CRUD State Management
```typescript
const [items, setItems] = useState<T[]>([]);
const [isFormOpen, setIsFormOpen] = useState(false);
const [editingItem, setEditingItem] = useState<T | null>(null);
const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
const [formData, setFormData] = useState<Partial<T>>({});

// Create
const handleCreate = () => {
  setEditingItem(null);
  setFormData({});
  setIsFormOpen(true);
};

// Edit
const handleEdit = (item: T) => {
  setEditingItem(item);
  setFormData(item);
  setIsFormOpen(true);
};

// Submit
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (editingItem) {
    // Update
    setItems(items.map(item => 
      item.id === editingItem.id ? { ...item, ...formData } : item
    ));
  } else {
    // Create
    const newItem = { id: Date.now().toString(), ...formData };
    setItems([...items, newItem]);
  }
  setIsFormOpen(false);
};

// Delete
const handleDelete = (item: T) => {
  setDeleteTarget(item);
};

const confirmDelete = () => {
  if (deleteTarget) {
    setItems(items.filter(item => item.id !== deleteTarget.id));
    setDeleteTarget(null);
  }
};
```

### Form Modal Pattern
```tsx
<AnimatePresence>
  {isFormOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsFormOpen(false)}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full"
        >
          {/* Form content */}
        </motion.div>
      </div>
    </>
  )}
</AnimatePresence>
```

## 🔌 API Integration Template

### Fetch Data
```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/items');
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    }
  };
  fetchData();
}, []);
```

### Create/Update
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const url = editingItem 
      ? `/api/admin/items/${editingItem.id}`
      : '/api/admin/items';
    
    const res = await fetch(url, {
      method: editingItem ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    const data = await res.json();
    
    if (data.success) {
      // Refetch or update state
      setIsFormOpen(false);
    }
  } catch (error) {
    console.error('Failed to save:', error);
  }
};
```

### Delete
```typescript
const confirmDelete = async () => {
  if (!deleteTarget) return;
  
  try {
    const res = await fetch(`/api/admin/items/${deleteTarget.id}`, {
      method: 'DELETE',
    });
    
    const data = await res.json();
    
    if (data.success) {
      setItems(items.filter(item => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  } catch (error) {
    console.error('Failed to delete:', error);
  }
};
```

## 🎯 Checklist untuk Halaman Baru

1. [ ] Buat file page di `app/admin/[section]/page.tsx`
2. [ ] Import types dari `@/lib/types/admin`
3. [ ] Setup state management (items, form, modals)
4. [ ] Define columns untuk DataTable
5. [ ] Implement CRUD handlers
6. [ ] Create form modal
7. [ ] Add DeleteDialog
8. [ ] Add page to sidebar navigation di `AdminLayout.tsx`
9. [ ] Test all CRUD operations
10. [ ] Add to documentation

## 📚 File Locations

### Components
```
components/admin/
├── AdminLayout.tsx      # Main layout
├── DataTable.tsx        # Data table
├── DeleteDialog.tsx     # Delete modal
└── ImageUpload.tsx      # Image uploader
```

### Pages
```
app/admin/
├── layout.tsx           # Admin layout wrapper
├── page.tsx             # Dashboard
└── [section]/
    └── page.tsx         # Section pages
```

### Types
```
lib/types/
└── admin.ts            # All TypeScript types
```

### Docs
```
ADMIN_PANEL_DOCS.md      # Full documentation
BACKEND_INTEGRATION.md   # Backend guide
ADMIN_README.md          # Quick start
ADMIN_SUMMARY.md         # Summary
ADMIN_QUICK_REF.md       # This file
```

## 🐛 Debugging Tips

### State Issues
```typescript
// Add console.log untuk debug
console.log('Current items:', items);
console.log('Form data:', formData);
console.log('Editing item:', editingItem);
```

### Form Validation
```typescript
// Check form values before submit
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Submitting:', formData);
  // ... rest of code
};
```

### Modal Issues
```typescript
// Check modal state
console.log('Form open:', isFormOpen);
console.log('Delete target:', deleteTarget);
```

## 💡 Tips & Tricks

1. **Reuse Components**: Use DataTable, DeleteDialog, ImageUpload
2. **Consistent Naming**: Follow naming conventions (handle*, set*)
3. **Type Safety**: Always use TypeScript types
4. **Loading States**: Add loading indicators untuk UX
5. **Error Handling**: Always wrap API calls in try-catch
6. **Validation**: Validate form inputs
7. **Responsive**: Test on mobile devices
8. **Animations**: Use Framer Motion untuk smooth UX
9. **Accessibility**: Add aria labels & keyboard support
10. **Documentation**: Update docs saat add new features

## 🔗 Helpful Links

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Query](https://tanstack.com/query/latest)

## ⚡ Keyboard Shortcuts (Future)

```
Ctrl/Cmd + K     # Quick search
Ctrl/Cmd + N     # New item
Ctrl/Cmd + S     # Save
Escape           # Close modal
```

---

**Happy Coding! 🚀**
