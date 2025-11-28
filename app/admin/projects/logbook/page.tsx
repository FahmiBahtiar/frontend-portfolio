'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Plus, Trash2, Save, Calendar, Clock, MapPin, X, Star, GripVertical } from 'lucide-react';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FlightEntry {
  id: string;
  callsign: string;
  company: string;
  departure: {
    roles: string[];
    highlightedRole: string;
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
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SortableFlightItemProps {
  flight: FlightEntry;
  onEdit: (flight: FlightEntry) => void;
  onDelete: (id: string) => void;
  onToggleActive: (flight: FlightEntry) => void;
}

function SortableFlightItem({ flight, onEdit, onDelete, onToggleActive }: SortableFlightItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: flight.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-white/40 hover:text-white/60"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Active Star */}
        <button
          onClick={() => onToggleActive(flight)}
          className={`transition-all ${
            flight.isActive
              ? 'text-yellow-400 hover:text-yellow-300'
              : 'text-white/20 hover:text-white/40'
          }`}
          title={flight.isActive ? 'Currently active' : 'Mark as active'}
        >
          <Star
            className="w-5 h-5"
            fill={flight.isActive ? 'currentColor' : 'none'}
          />
        </button>

        {/* Flight Info */}
        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-white truncate">{flight.company}</span>
              {flight.isActive && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-400/10 border border-yellow-400/30 text-yellow-400">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-white/60 truncate">{flight.projectName}</p>
          </div>
          
          <div className="min-w-0">
            <div className="text-xs text-white/40 mb-1">Role</div>
            <p className="text-sm text-white/80 truncate">{flight.departure.highlightedRole}</p>
          </div>
          
          <div className="min-w-0">
            <div className="text-xs text-white/40 mb-1">Duration</div>
            <p className="text-sm text-white/80">{flight.duration}</p>
          </div>
          
          <div className="min-w-0">
            <div className="text-xs text-white/40 mb-1">Category</div>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
              flight.category === 'Development' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
              flight.category === 'Leadership' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
              flight.category === 'Freelance' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
              'bg-green-500/10 text-green-400 border border-green-500/20'
            }`}>
              {flight.category}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(flight)}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(flight.id)}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FlightLogbookPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Mock data
    const [flights, setFlights] = useState<FlightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<FlightEntry, 'id' | 'createdAt' | 'updatedAt'>>({
    callsign: '',
    company: '',
    departure: {
      roles: [],
      highlightedRole: '',
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
    order: 0,
    isActive: false,
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
        // Sort by order
        const sortedFlights = result.data.sort((a: FlightEntry, b: FlightEntry) => a.order - b.order);
        setFlights(sortedFlights);
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = flights.findIndex((item) => item.id === active.id);
      const newIndex = flights.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(flights, oldIndex, newIndex);
      
      // Update order property for all items
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        order: index,
      }));

      setFlights(updatedItems);

      // Save the new order to backend
      try {
        await Promise.all(
          updatedItems.map((item) =>
            fetch(`/api/admin/experience/flights/${item.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ order: item.order }),
            })
          )
        );
      } catch (error) {
        console.error('Error updating flight order:', error);
        alert('Failed to update flight order');
        // Revert on error
        fetchFlights();
      }
    }
  };

  const handleToggleActive = async (flight: FlightEntry) => {
    try {
      const response = await fetch(`/api/admin/experience/flights/${flight.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !flight.isActive }),
      });

      if (response.ok) {
        setFlights(
          flights.map((f) =>
            f.id === flight.id ? { ...f, isActive: !f.isActive } : f
          )
        );
      } else {
        alert('Failed to update flight status');
      }
    } catch (error) {
      console.error('Error toggling active status:', error);
      alert('Failed to update flight status');
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
      order: flight.order,
      isActive: flight.isActive || false,
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
    if (!formData.departure.highlightedRole.trim()) {
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
        isActive: formData.isActive,
      };

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
        roles: [],
        highlightedRole: '',
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
      order: 0,
      isActive: false,
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

  const addRole = (role: string) => {
    if (role.trim() && !formData.departure.roles.includes(role.trim())) {
      const newRoles = [...formData.departure.roles, role.trim()];
      setFormData({
        ...formData,
        departure: {
          ...formData.departure,
          roles: newRoles,
          highlightedRole: formData.departure.highlightedRole || role.trim(), // Auto-select first role as highlighted
        },
      });
    }
  };

  const removeRole = (index: number) => {
    const roleToRemove = formData.departure.roles[index];
    const newRoles = formData.departure.roles.filter((_, i) => i !== index);
    
    let newHighlightedRole = formData.departure.highlightedRole;
    if (roleToRemove === formData.departure.highlightedRole) {
      newHighlightedRole = newRoles.length > 0 ? newRoles[0] : '';
    }

    setFormData({
      ...formData,
      departure: {
        ...formData.departure,
        roles: newRoles,
        highlightedRole: newHighlightedRole,
      },
    });
  };

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
                      Roles
                    </label>
                    <div className="space-y-3">
                      {/* Add role input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="role-input"
                          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-all"
                          placeholder="Add a role..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              addRole(input.value);
                              input.value = '';
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('role-input') as HTMLInputElement;
                            addRole(input.value);
                            input.value = '';
                          }}
                          className="px-4 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-all"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Roles list */}
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {formData.departure.roles.map((role, index) => (
                          <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="highlightedRole"
                                checked={formData.departure.highlightedRole === role}
                                onChange={() => setFormData({
                                  ...formData,
                                  departure: { ...formData.departure, highlightedRole: role }
                                })}
                                className="text-cyan-500 focus:ring-cyan-500"
                              />
                              <span className="text-white/80 text-sm">{role}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeRole(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {formData.departure.roles.length === 0 && (
                        <p className="text-white/40 text-sm text-center py-4">No roles added yet</p>
                      )}
                    </div>
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

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <input
                      type="checkbox"
                      id="isActiveCheck"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 rounded bg-white/10 border-white/20 text-yellow-500 focus:ring-yellow-500/50"
                    />
                    <label htmlFor="isActiveCheck" className="flex items-center gap-2 text-white cursor-pointer flex-1">
                      <Star className={`w-5 h-5 ${formData.isActive ? 'text-yellow-400 fill-yellow-400' : 'text-white/40'}`} />
                      <div>
                        <div className="font-medium">Currently Active</div>
                        <div className="text-sm text-white/60">Mark this position as currently active</div>
                      </div>
                    </label>
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

          {/* Sortable List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="mb-4">
                <p className="text-white/60 text-sm">
                  Drag and drop to reorder • Click star to mark as currently active
                </p>
              </div>

              {filteredFlights.length === 0 ? (
                <div className="text-center py-12 text-white/40">
                  No flight entries found. Add your first project!
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredFlights.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {filteredFlights.map((flight) => (
                        <SortableFlightItem
                          key={flight.id}
                          flight={flight}
                          onEdit={handleEdit}
                          onDelete={setDeleteId}
                          onToggleActive={handleToggleActive}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
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
