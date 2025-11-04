'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Plane, Plus, Trash2, Save, Calendar, Clock, MapPin } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';

interface FlightEntry {
  id: string;
  date: string;
  projectName: string;        // Nama project/company
  role: string;               // Role/position
  company: string;            // Company/organization
  location: string;           // Location (remote/onsite)
  duration: string;           // Duration in months
  category: 'Development' | 'Leadership' | 'Freelance' | 'Open Source';
  technologies?: string[];    // Tech stack
  achievements?: string;      // Key achievements
  order: number;
}

export default function FlightLogbookPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');

  // Mock data
    const [flights, setFlights] = useState<FlightEntry[]>([
    {
      id: '1',
      date: '2024-01-15',
      projectName: 'Next.js E-Commerce Platform',
      role: 'Full Stack Developer',
      company: 'Tech Solutions Inc.',
      location: 'Remote',
      duration: '6',
      category: 'Development',
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Prisma', 'PostgreSQL'],
      achievements: 'Built scalable e-commerce platform serving 10k+ users',
      order: 1
    },
    {
      id: '2',
      date: '2023-11-20',
      projectName: 'Banking API Integration',
      role: 'Backend Engineer',
      company: 'FinTech Solutions',
      location: 'Jakarta',
      duration: '4',
      category: 'Development',
      technologies: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker'],
      achievements: 'Integrated 5 major bank APIs with 99.9% uptime',
      order: 2
    },
    {
      id: '3',
      date: '2023-09-10',
      projectName: 'Real-time Analytics Dashboard',
      role: 'Frontend Lead',
      company: 'Data Insights Corp',
      location: 'Remote',
      duration: '5',
      category: 'Leadership',
      technologies: ['React', 'D3.js', 'WebSocket', 'Material-UI'],
      achievements: 'Led team of 4 developers, reduced render time by 60%',
      order: 3
    },
    {
      id: '4',
      date: '2023-07-15',
      projectName: 'Mobile Healthcare App',
      role: 'React Native Developer',
      company: 'MedTech Solutions',
      location: 'Bandung',
      duration: '8',
      category: 'Development',
      technologies: ['React Native', 'Firebase', 'Redux', 'TypeScript'],
      achievements: 'Launched app with 50k+ downloads in first month',
      order: 4
    },
    {
      id: '5',
      date: '2023-05-01',
      projectName: 'AI Chatbot Integration',
      role: 'ML Engineer',
      company: 'AI Innovations Lab',
      location: 'Remote',
      duration: '3',
      category: 'Development',
      technologies: ['Python', 'TensorFlow', 'FastAPI', 'OpenAI API'],
      achievements: 'Improved customer response rate by 40%',
      order: 5
    },
    {
      id: '6',
      date: '2023-03-20',
      projectName: 'DevOps Pipeline Setup',
      role: 'DevOps Engineer',
      company: 'Cloud Services Ltd',
      location: 'Singapore',
      duration: '2',
      category: 'Development',
      technologies: ['AWS', 'Terraform', 'GitHub Actions', 'Kubernetes'],
      achievements: 'Reduced deployment time from 2 hours to 15 minutes',
      order: 6
    },
    {
      id: '7',
      date: '2023-02-10',
      projectName: 'Open Source UI Library',
      role: 'Core Contributor',
      company: 'Open Source Community',
      location: 'Remote',
      duration: '12',
      category: 'Open Source',
      technologies: ['React', 'TypeScript', 'Storybook', 'Rollup'],
      achievements: '2k+ GitHub stars, 500+ contributors',
      order: 7
    },
    {
      id: '8',
      date: '2022-12-05',
      projectName: 'CRM System Redesign',
      role: 'UI/UX Developer',
      company: 'Enterprise Solutions',
      location: 'Jakarta',
      duration: '6',
      category: 'Development',
      technologies: ['Vue.js', 'Vuex', 'SASS', 'Figma'],
      achievements: 'Increased user satisfaction score from 3.2 to 4.7',
      order: 8
    },
    {
      id: '9',
      date: '2022-10-15',
      projectName: 'Microservices Architecture',
      role: 'System Architect',
      company: 'Tech Innovators',
      location: 'Remote',
      duration: '9',
      category: 'Leadership',
      technologies: ['Microservices', 'gRPC', 'RabbitMQ', 'Consul'],
      achievements: 'Migrated monolith to microservices, 3x performance',
      order: 9
    },
    {
      id: '10',
      date: '2022-08-01',
      projectName: 'E-Learning Platform',
      role: 'Full Stack Developer',
      company: 'EduTech Startup',
      location: 'Surabaya',
      duration: '10',
      category: 'Development',
      technologies: ['Django', 'React', 'PostgreSQL', 'AWS S3'],
      achievements: 'Built platform serving 100k+ students',
      order: 10
    },
    {
      id: '11',
      date: '2022-06-10',
      projectName: 'Blockchain Wallet App',
      role: 'Blockchain Developer',
      company: 'Crypto Solutions',
      location: 'Remote',
      duration: '5',
      category: 'Development',
      technologies: ['Solidity', 'Web3.js', 'React', 'MetaMask'],
      achievements: 'Secured $2M+ in digital assets',
      order: 11
    },
    {
      id: '12',
      date: '2022-04-20',
      projectName: 'Restaurant Management System',
      role: 'Freelance Developer',
      company: 'Local Restaurant Chain',
      location: 'Jakarta',
      duration: '3',
      category: 'Freelance',
      technologies: ['Laravel', 'MySQL', 'Bootstrap', 'jQuery'],
      achievements: 'Streamlined operations for 15 restaurant branches',
      order: 12
    },
    {
      id: '13',
      date: '2022-02-15',
      projectName: 'IoT Smart Home Dashboard',
      role: 'IoT Developer',
      company: 'Smart Home Solutions',
      location: 'Bandung',
      duration: '4',
      category: 'Development',
      technologies: ['Node.js', 'MQTT', 'InfluxDB', 'Grafana'],
      achievements: 'Connected 1000+ smart devices',
      order: 13
    },
    {
      id: '14',
      date: '2022-01-01',
      projectName: 'Social Media Analytics Tool',
      role: 'Data Engineer',
      company: 'Marketing Analytics Co',
      location: 'Remote',
      duration: '7',
      category: 'Development',
      technologies: ['Python', 'Pandas', 'Airflow', 'BigQuery'],
      achievements: 'Processed 10M+ social media posts daily',
      order: 14
    },
    {
      id: '15',
      date: '2021-11-10',
      projectName: 'Video Streaming Platform',
      role: 'Backend Developer',
      company: 'Media Streaming Inc',
      location: 'Singapore',
      duration: '8',
      category: 'Development',
      technologies: ['Go', 'FFmpeg', 'Redis', 'CDN'],
      achievements: 'Handled 50k concurrent streams',
      order: 15
    },
    {
      id: '16',
      date: '2021-09-05',
      projectName: 'Project Management Tool',
      role: 'Product Engineer',
      company: 'Productivity Apps',
      location: 'Remote',
      duration: '6',
      category: 'Development',
      technologies: ['Svelte', 'SvelteKit', 'Supabase', 'TailwindCSS'],
      achievements: 'Gained 5k+ active users in beta',
      order: 16
    },
    {
      id: '17',
      date: '2021-07-20',
      projectName: 'Inventory Management System',
      role: 'Full Stack Developer',
      company: 'Retail Solutions',
      location: 'Jakarta',
      duration: '5',
      category: 'Freelance',
      technologies: ['PHP', 'CodeIgniter', 'MySQL', 'Bootstrap'],
      achievements: 'Reduced inventory errors by 75%',
      order: 17
    },
    {
      id: '18',
      date: '2021-05-15',
      projectName: 'Open Source Testing Framework',
      role: 'Maintainer',
      company: 'Open Source Community',
      location: 'Remote',
      duration: '18',
      category: 'Open Source',
      technologies: ['TypeScript', 'Jest', 'Playwright', 'GitHub Actions'],
      achievements: '5k+ stars, used by Fortune 500 companies',
      order: 18
    },
    {
      id: '19',
      date: '2021-03-10',
      projectName: 'Hotel Booking Platform',
      role: 'Senior Developer',
      company: 'Travel Tech Solutions',
      location: 'Bali',
      duration: '9',
      category: 'Leadership',
      technologies: ['Next.js', 'GraphQL', 'Prisma', 'Stripe'],
      achievements: 'Processed $5M+ in bookings',
      order: 19
    },
    {
      id: '20',
      date: '2021-01-05',
      projectName: 'HR Management Dashboard',
      role: 'Frontend Developer',
      company: 'HR Tech Startup',
      location: 'Remote',
      duration: '4',
      category: 'Development',
      technologies: ['Angular', 'RxJS', 'NgRx', 'Material Design'],
      achievements: 'Managed 10k+ employee records',
      order: 20
    }
  ]);

    const [formData, setFormData] = useState<Omit<FlightEntry, 'id'>>({
    date: '',
    projectName: '',
    role: '',
    company: '',
    location: '',
    duration: '',
    category: 'Development',
    technologies: [],
    achievements: '',
    order: flights.length + 1
  });

  const flightTypes = ['All', 'Development', 'Leadership', 'Freelance', 'Open Source'];

  const filteredFlights = filterType === 'All' 
    ? flights 
    : flights.filter(f => f.category === filterType);

  // Calculate statistics
  const totalProjects = flights.length;
  const developmentProjects = flights.filter(f => f.category === 'Development').length;
  const leadershipProjects = flights.filter(f => f.category === 'Leadership').length;
  const freelanceProjects = flights.filter(f => f.category === 'Freelance').length;
  const openSourceProjects = flights.filter(f => f.category === 'Open Source').length;

  const handleEdit = (flight: FlightEntry) => {
    setEditingId(flight.id);
    setFormData({
      date: flight.date,
      projectName: flight.projectName,
      role: flight.role,
      company: flight.company,
      location: flight.location,
      duration: flight.duration,
      category: flight.category,
      technologies: flight.technologies || [],
      achievements: flight.achievements || '',
      order: flight.order
    });
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      setFlights(flights.filter(f => f.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setFlights(flights.map(f =>
        f.id === editingId ? { ...formData, id: editingId } : f
      ));
    } else {
      const newFlight = {
        ...formData,
        id: Date.now().toString(),
      };
      setFlights([...flights, newFlight]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      projectName: '',
      role: '',
      company: '',
      location: '',
      duration: '',
      category: 'Development',
      technologies: [],
      achievements: '',
      order: flights.length + 1,
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const columns: Column<FlightEntry>[] = [
    {
      key: 'date',
      label: 'Date',
      render: (flight: FlightEntry) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-medium">
            {new Date(flight.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </span>
        </div>
      ),
    },
    {
      key: 'projectName',
      label: 'Project / Role',
      render: (flight: FlightEntry) => (
        <div>
          <p className="text-white font-medium">{flight.projectName}</p>
          <p className="text-white/60 text-xs">{flight.role}</p>
        </div>
      ),
    },
    {
      key: 'company',
      label: 'Company',
      render: (flight: FlightEntry) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-400" />
          <div>
            <p className="text-white/80 text-sm">{flight.company}</p>
            <p className="text-white/50 text-xs">{flight.location}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (flight: FlightEntry) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <span className="text-white font-semibold">{flight.duration} mo</span>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (flight: FlightEntry) => {
        const colors = {
          Development: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
          Leadership: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          Freelance: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
          'Open Source': 'bg-green-500/20 text-green-400 border-green-500/30',
        };
        return (
          <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${colors[flight.category]}`}>
            {flight.category}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/50">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Work Logbook</h1>
              <p className="text-white/60 text-sm mt-1">Track your projects, experience & achievements</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <p className="text-white/60 text-sm">Total Projects</p>
          </div>
          <p className="text-3xl font-bold text-white">{totalProjects}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Plane className="w-5 h-5 text-purple-400" />
            <p className="text-white/60 text-sm">Development</p>
          </div>
          <p className="text-3xl font-bold text-white">{developmentProjects}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-orange-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Plane className="w-5 h-5 text-orange-400" />
            <p className="text-white/60 text-sm">Freelance</p>
          </div>
          <p className="text-3xl font-bold text-white">{freelanceProjects}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-green-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-green-400" />
            <p className="text-white/60 text-sm">Open Source</p>
          </div>
          <p className="text-3xl font-bold text-white">{openSourceProjects}</p>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {flightTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filterType === type
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Form */}
      {isFormOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">
            {editingId ? 'Edit Project Entry' : 'Add New Project'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as FlightEntry['category'] })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  required
                >
                  <option value="Development">Development</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Open Source">Open Source</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all"
                  placeholder="E-Commerce Platform"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all"
                  placeholder="Full Stack Developer"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all"
                  placeholder="Tech Solutions Inc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all"
                  placeholder="Remote / Jakarta"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Duration (months)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all"
                  placeholder="6"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Technologies (comma separated)
              </label>
              <input
                type="text"
                value={formData.technologies?.join(', ') || ''}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value.split(',').map(t => t.trim()) })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all"
                placeholder="Next.js, TypeScript, Tailwind CSS"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Key Achievements (Optional)
              </label>
              <textarea
                value={formData.achievements}
                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                placeholder="Built scalable platform serving 10k+ users"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DataTable
          data={filteredFlights}
          columns={columns}
          onEdit={handleEdit}
          onDelete={(flight) => setDeleteId(flight.id)}
        />
      </motion.div>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Flight Entry"
        description="Are you sure you want to delete this flight entry? This action cannot be undone."
        itemName={flights.find(f => f.id === deleteId)?.projectName || ''}
      />
    </div>
  );
}
