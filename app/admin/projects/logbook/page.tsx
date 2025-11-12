'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plane, Plus, Trash2, Save, Calendar, Clock, MapPin, X } from 'lucide-react';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';

interface FlightEntry {
  id: string;
  callsign: string;
  company: string;
  departure: {
    role: string;
    code: string;
    date: string;
  };
  arrival: {
    status: string;
    code: string;
    date: string;
  };
  projectName: string;
  duration: string;
  crew: string[];
  responsibilities: string[];
  color: string;
  location: string;
  category: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function FlightLogbookPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');

  // Mock data
    const [flights, setFlights] = useState<FlightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<FlightEntry, 'id' | 'createdAt' | 'updatedAt'>>({
    callsign: '',
    company: '',
    departure: {
      role: '',
      code: '',
      date: '',
    },
    arrival: {
      status: 'Landed',
      code: '',
      date: '',
    },
    projectName: '',
    duration: '',
    crew: [],
    responsibilities: [],
    color: 'blue',
    location: '',
    category: 'Development',
    order: 0
  });

  const flightTypes = ['All', 'Development', 'Leadership', 'Freelance', 'Open Source'];

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const response = await fetch('/api/admin/experience/flights');
      if (!response.ok) {
        throw new Error('Failed to fetch flights');
      }
      const result = await response.json();
      if (result.success) {
        setFlights(result.data);
      } else {
        setError('Failed to load flights');
      }
    } catch (err) {
      setError('Failed to load flights');
      console.error('Error fetching flights:', err);
    } finally {
      setLoading(false);
    }
  };

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
    setFormData({
      callsign: flight.callsign,
      company: flight.company,
      departure: flight.departure,
      arrival: flight.arrival,
      projectName: flight.projectName,
      duration: flight.duration,
      crew: flight.crew,
      responsibilities: flight.responsibilities,
      color: flight.color,
      location: flight.location,
      category: flight.category,
      order: flight.order
    });
    setEditingId(flight.id);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        const response = await fetch(`/api/admin/experience/flights/${deleteId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          await fetchFlights();
        }
      } catch (error) {
        console.error('Error deleting flight:', error);
      }
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.company.trim()) {
      alert('Company is required');
      return;
    }
    if (!formData.departure.role.trim()) {
      alert('Role is required');
      return;
    }
    if (!formData.departure.code.trim()) {
      alert('Departure code is required');
      return;
    }
    if (!formData.departure.date) {
      alert('Departure date is required');
      return;
    }
    if (!formData.arrival.status.trim()) {
      alert('Arrival status is required');
      return;
    }
    if (!formData.arrival.code.trim()) {
      alert('Arrival code is required');
      return;
    }
    if (!formData.arrival.date) {
      alert('Arrival date is required');
      return;
    }
    if (!formData.projectName.trim()) {
      alert('Project name is required');
      return;
    }
    if (!formData.location.trim()) {
      alert('Location is required');
      return;
    }
    
    try {
      const flightData = {
        callsign: formData.callsign || `FLIGHT${Date.now()}`,
        company: formData.company,
        departure: formData.departure,
        arrival: formData.arrival,
        projectName: formData.projectName,
        duration: formData.duration,
        crew: formData.crew,
        responsibilities: formData.responsibilities,
        color: formData.color,
        location: formData.location,
        category: formData.category,
        order: formData.order || flights.length + 1,
      };

      console.log('Sending flight data:', flightData);

      if (editingId) {
        const response = await fetch(`/api/admin/experience/flights/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(flightData),
        });
        if (response.ok) {
          await fetchFlights();
        } else {
          const errorData = await response.json();
          console.error('Backend error:', errorData);
          alert(`Error: ${errorData.message || 'Failed to update flight'}`);
        }
      } else {
        const response = await fetch('/api/admin/experience/flights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(flightData),
        });
        if (response.ok) {
          await fetchFlights();
        } else {
          const errorData = await response.json();
          console.error('Backend error:', errorData);
          alert(`Error: ${errorData.message || 'Failed to save flight'}`);
        }
      }

      resetForm();
    } catch (error) {
      console.error('Error saving flight:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      callsign: '',
      company: '',
      departure: {
        role: '',
        code: '',
        date: '',
      },
      arrival: {
        status: 'Landed',
        code: '',
        date: '',
      },
      projectName: '',
      duration: '',
      crew: [],
      responsibilities: [],
      color: 'blue',
      location: '',
      category: 'Development',
      order: 0
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const addResponsibility = (responsibility: string) => {
    if (responsibility.trim()) {
      setFormData({
        ...formData,
        responsibilities: [...(formData.responsibilities || []), responsibility.trim()],
      });
    }
  };

  const removeResponsibility = (index: number) => {
    if (formData.responsibilities) {
      setFormData({
        ...formData,
        responsibilities: formData.responsibilities.filter((_, i) => i !== index),
      });
    }
  };

  const columns: Column<FlightEntry>[] = [
    {
      key: 'date',
      label: 'Date',
      render: (flight: FlightEntry) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-medium">
            {new Date(flight.departure.date).toLocaleDateString('en-US', { 
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
          <p className="text-white/60 text-xs">{flight.departure.role}</p>
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
      key: 'endDate',
      label: 'End Date',
      render: (flight: FlightEntry) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-400" />
          <span className="text-white font-medium">
            {flight.arrival.date ? new Date(flight.arrival.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }) : 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (flight: FlightEntry) => {
        const statusColors: { [key: string]: string } = {
          Landed: 'bg-green-500/20 text-green-400 border-green-500/30',
          'In Progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          Cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return (
          <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${statusColors[flight.arrival.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
            {flight.arrival.status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-white/60">Loading flight logbook...</div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-red-400">{error}</div>
        </div>
      )}

      {!loading && !error && (
        <>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      value={formData.departure.date}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        departure: { ...formData.departure, date: e.target.value } 
                      })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.arrival.date}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        arrival: { ...formData.arrival, date: e.target.value } 
                      })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.arrival.status}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        arrival: { ...formData.arrival, status: e.target.value } 
                      })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                      required
                    >
                      <option value="Landed">Complete</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Cancelled">Cancelled</option>
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
                      value={formData.departure.role}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        departure: { ...formData.departure, role: e.target.value } 
                      })}
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
                      Departure Code
                    </label>
                    <input
                      type="text"
                      value={formData.departure.code}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        departure: { ...formData.departure, code: e.target.value } 
                      })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all"
                      placeholder="FSD"
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
                    value={formData.crew?.join(', ') || ''}
                    onChange={(e) => setFormData({ ...formData, crew: e.target.value.split(',').map(t => t.trim()) })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all"
                    placeholder="Next.js, TypeScript, Tailwind CSS"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Key Responsibilities (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.responsibilities?.map((responsibility, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm"
                      >
                        {responsibility}
                        <button
                          type="button"
                          onClick={() => removeResponsibility(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="responsibility-input"
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                      placeholder="Add responsibility..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          addResponsibility(input.value);
                          input.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('responsibility-input') as HTMLInputElement;
                        addResponsibility(input.value);
                        input.value = '';
                      }}
                      className="px-4 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
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
        </>
      )}
    </div>
  );
}
