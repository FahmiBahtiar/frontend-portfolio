'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import useSWR from 'swr';
import { Plane, Plus, Trash2, Save, Clock, MapPin, X, Star, GripVertical, Loader2 } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

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
  createdAt?: string;
  updatedAt?: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch flights');
  const json = await res.json();
  if (!json.success) throw new Error('Failed to load flights');
  return json.data.sort((a: FlightEntry, b: FlightEntry) => (a.order || 0) - (b.order || 0));
};

export default function FlightLogbookPage() {
  const { data: flights = [], mutate, isLoading, error } = useSWR<FlightEntry[]>('/api/admin/experience/flights', fetcher);
  const [saving, setSaving] = useState(false);

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = flights.findIndex((item) => item.id === active.id);
      const newIndex = flights.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(flights, oldIndex, newIndex);
      
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        order: index,
      }));

      mutate(updatedItems, false);

      try {
        await Promise.all(
          updatedItems.map((item) =>
            fetch(`/api/admin/experience/flights/${item.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order: item.order }),
            })
          )
        );
      } catch (err) {
        console.error('Error updating flight order:', err);
        alert('Failed to update flight order');
        mutate();
      }
    }
  };

  const handleToggleActive = async (flight: FlightEntry) => {
    try {
      const response = await fetch(`/api/admin/experience/flights/${flight.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !flight.isActive }),
      });

      if (response.ok) {
        mutate(
          flights.map((f) => (f.id === flight.id ? { ...f, isActive: !f.isActive } : f)),
          false
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

  const totalProjects = flights.length;
  const developmentProjects = flights.filter(f => f.category === 'Development').length;
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
        const response = await fetch(`/api/admin/experience/flights/${deleteId}`, { method: 'DELETE' });
        if (response.ok) {
          mutate(flights.filter((f) => f.id !== deleteId), false);
        }
      } catch (err) {
        console.error('Error deleting flight:', err);
      }
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company.trim() || !formData.departure.highlightedRole.trim() || !formData.departure.code.trim() || !formData.departure.date || !formData.arrival.status.trim() || !formData.arrival.date || !formData.projectName.trim() || !formData.location.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    setSaving(true);
    try {
      const flightData = {
        ...formData,
        callsign: formData.callsign || `FLIGHT${Date.now()}`,
        order: formData.order || flights.length + 1,
      };

      if (editingId) {
        const response = await fetch(`/api/admin/experience/flights/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(flightData),
        });
        if (!response.ok) throw new Error('Failed to update flight');
      } else {
        const response = await fetch('/api/admin/experience/flights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(flightData),
        });
        if (!response.ok) throw new Error('Failed to create flight');
      }

      await mutate();
      resetForm();
    } catch (err) {
      console.error('Error saving flight:', err);
      alert('Failed to save flight entry');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      callsign: '',
      company: '',
      departure: { roles: [], highlightedRole: '', code: '', date: '' },
      arrival: { status: 'Landed', code: '', date: '' },
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
          highlightedRole: formData.departure.highlightedRole || role.trim(),
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading flight logbook...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-400">Failed to load flight entries.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Plane className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Work Logbook</h1>
            <p className="text-sm text-muted-foreground">Track your projects, experience & achievements</p>
          </div>
        </div>

        <Button onClick={() => setIsFormOpen(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Project
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: totalProjects, icon: Clock, color: 'text-cyan-400', border: 'border-cyan-500/20' },
          { label: 'Development', value: developmentProjects, icon: Plane, color: 'text-purple-400', border: 'border-purple-500/20' },
          { label: 'Freelance', value: freelanceProjects, icon: Plane, color: 'text-orange-400', border: 'border-orange-500/20' },
          { label: 'Open Source', value: openSourceProjects, icon: MapPin, color: 'text-green-400', border: 'border-green-500/20' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`bg-black/20 border-white/5 ${stat.border}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {flightTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
              filterType === type
                ? 'bg-cyan-600 text-white'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {isFormOpen && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-black/20 border-white/5">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg">{editingId ? 'Edit Project Entry' : 'Add New Project'}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Departure Date</Label>
                    <Input type="date" value={formData.departure.date} onChange={(e) => setFormData({ ...formData, departure: { ...formData.departure, date: e.target.value } })} className="bg-white/5 border-white/10" required />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" value={formData.arrival.date} onChange={(e) => setFormData({ ...formData, arrival: { ...formData.arrival, date: e.target.value } })} className="bg-white/5 border-white/10" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      value={formData.arrival.status}
                      onChange={(e) => setFormData({ ...formData, arrival: { ...formData.arrival, status: e.target.value } })}
                      className="w-full h-10 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      required
                    >
                      <option value="Landed" className="bg-slate-900">Complete</option>
                      <option value="In Progress" className="bg-slate-900">In Progress</option>
                      <option value="Cancelled" className="bg-slate-900">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project Name</Label>
                    <Input type="text" value={formData.projectName} onChange={(e) => setFormData({ ...formData, projectName: e.target.value })} className="bg-white/5 border-white/10" placeholder="E-Commerce Platform" required />
                  </div>

                  <div className="space-y-2">
                    <Label>Roles</Label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          id="role-input"
                          className="bg-white/5 border-white/10"
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
                        <Button type="button" onClick={() => {
                          const input = document.getElementById('role-input') as HTMLInputElement;
                          addRole(input.value);
                          input.value = '';
                        }} className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                        {formData.departure.roles.map((role, index) => (
                          <div key={index} className="flex items-center justify-between bg-white/5 rounded-md p-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="highlightedRole"
                                checked={formData.departure.highlightedRole === role}
                                onChange={() => setFormData({ ...formData, departure: { ...formData.departure, highlightedRole: role } })}
                                className="text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                              />
                              <span className="text-sm text-white/80">{role}</span>
                            </div>
                            <button type="button" onClick={() => removeRole(index)} className="text-red-400 hover:text-red-300">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {formData.departure.roles.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">No roles added yet</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="bg-white/5 border-white/10" placeholder="Tech Solutions Inc." required />
                  </div>
                  <div className="space-y-2">
                    <Label>Departure Code</Label>
                    <Input type="text" value={formData.departure.code} onChange={(e) => setFormData({ ...formData, departure: { ...formData.departure, code: e.target.value } })} className="bg-white/5 border-white/10" placeholder="FSD" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="bg-white/5 border-white/10" placeholder="Remote / Jakarta" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (months)</Label>
                    <Input type="number" step="1" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="bg-white/5 border-white/10" placeholder="6" required />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox 
                      id="isActive" 
                      checked={formData.isActive}
                      onCheckedChange={(c) => setFormData({ ...formData, isActive: !!c })}
                      className="border-white/20 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white flex items-center gap-2"
                    >
                      <Star className={`w-4 h-4 ${formData.isActive ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                      Currently Active
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Technologies (comma separated)</Label>
                  <Input type="text" value={formData.crew?.join(', ') || ''} onChange={(e) => setFormData({ ...formData, crew: e.target.value.split(',').map(t => t.trim()) })} className="bg-white/5 border-white/10" placeholder="Next.js, TypeScript, Tailwind CSS" />
                </div>

                <div className="space-y-2">
                  <Label>Key Responsibilities</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.responsibilities?.map((res, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs">
                        {res}
                        <button type="button" onClick={() => removeResponsibility(index)} className="text-red-400 hover:text-red-300"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="responsibility-input"
                      className="bg-white/5 border-white/10"
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
                    <Button type="button" onClick={() => {
                      const input = document.getElementById('responsibility-input') as HTMLInputElement;
                      addResponsibility(input.value);
                      input.value = '';
                    }} className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={resetForm} className="text-muted-foreground hover:text-white">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-black/20 border border-white/5 rounded-2xl p-6">
          <div className="mb-4">
            <p className="text-muted-foreground text-sm">Drag and drop to reorder • Click star to mark as currently active</p>
          </div>

          {filteredFlights.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No flight entries found. Add your first project!
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredFlights.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {filteredFlights.map((flight) => (
                    <SortableFlightItem key={flight.id} flight={flight} onEdit={handleEdit} onDelete={setDeleteId} onToggleActive={handleToggleActive} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </motion.div>

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

interface SortableFlightItemProps {
  flight: FlightEntry;
  onEdit: (flight: FlightEntry) => void;
  onDelete: (id: string) => void;
  onToggleActive: (flight: FlightEntry) => void;
}

function SortableFlightItem({ flight, onEdit, onDelete, onToggleActive }: SortableFlightItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: flight.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-white/40 hover:text-white/60 p-1">
            <GripVertical className="w-5 h-5" />
          </button>
          <button onClick={() => onToggleActive(flight)} className={`transition-all ${flight.isActive ? 'text-yellow-400 hover:text-yellow-300' : 'text-white/20 hover:text-white/40'}`} title={flight.isActive ? 'Currently active' : 'Mark as active'}>
            <Star className="w-5 h-5" fill={flight.isActive ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-white truncate">{flight.company}</span>
              {flight.isActive && (
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-yellow-400/10 border border-yellow-400/30 text-yellow-400">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{flight.projectName}</p>
          </div>
          
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground mb-1">Role</div>
            <p className="text-sm text-white/80 truncate">{flight.departure.highlightedRole}</p>
          </div>
          
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground mb-1">Duration</div>
            <p className="text-sm text-white/80">{flight.duration} mos</p>
          </div>
          
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground mb-1">Category</div>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${flight.category === 'Development' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : flight.category === 'Leadership' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : flight.category === 'Freelance' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
              {flight.category}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-4 sm:mt-0">
          <Button variant="ghost" size="sm" onClick={() => onEdit(flight)} className="text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300">
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(flight.id)} className="text-red-400 hover:bg-red-500/20 hover:text-red-300">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
