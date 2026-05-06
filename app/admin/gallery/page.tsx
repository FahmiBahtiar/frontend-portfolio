'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Plus, X, Save, Loader2, MapPin, Camera, Calendar, Upload, Link, Image as ImageIcon } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { galleryApi, MissionPhoto } from '@/lib/services/gallery';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function GalleryPage() {
  const { data: photos = [], mutate, isLoading, error } = useSWR<MissionPhoto[]>('gallery', () => galleryApi.getAll());
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<MissionPhoto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MissionPhoto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState<'url' | 'upload'>('url');
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    image: '',
    location: '',
    coordinates: '',
    altitude: '',
    date: '',
    camera: '',
    heading: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || isUploading) return;

    if (!formData.image || !formData.location || !formData.coordinates || !formData.altitude || !formData.date || !formData.camera || !formData.heading) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      if (editingPhoto?.id) {
        await galleryApi.update(editingPhoto.id, formData);
      } else {
        await galleryApi.create(formData);
      }
      await mutate();
      closeForm();
    } catch (err) {
      console.error('Error saving photo:', err);
      alert('Failed to save photo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;

    try {
      await galleryApi.delete(deleteTarget.id);
      await mutate(photos.filter(p => p.id !== deleteTarget.id), false);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting photo:', err);
      alert('Failed to delete photo');
    }
  };

  const openForm = (photo?: MissionPhoto) => {
    if (photo) {
      setEditingPhoto(photo);
      setFormData({
        image: photo.image || '',
        location: photo.location || '',
        coordinates: photo.coordinates || '',
        altitude: photo.altitude || '',
        date: photo.date ? new Date(photo.date).toISOString().split('T')[0] : '',
        camera: photo.camera || '',
        heading: photo.heading || '',
      });
      setImageUploadMode('url');
    } else {
      setEditingPhoto(null);
      setFormData({
        image: '',
        location: '',
        coordinates: '',
        altitude: '',
        date: '',
        camera: '',
        heading: '',
      });
      setImageUploadMode('url');
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPhoto(null);
    setImageUploadMode('url');
    setFormData({
      image: '',
      location: '',
      coordinates: '',
      altitude: '',
      date: '',
      camera: '',
      heading: '',
    });
  };

  const columns = [
    {
      key: 'image' as keyof MissionPhoto,
      label: 'Image',
      render: (item: MissionPhoto) => (
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 relative border border-white/10">
          <Image
            src={item.image}
            alt="Mission photo"
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.srcset = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xNSAxMEwxMSAxNFYxMEgxNVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
            }}
          />
        </div>
      ),
    },
    {
      key: 'location' as keyof MissionPhoto,
      label: 'Location',
      render: (item: MissionPhoto) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span className="font-medium text-white">{item.location}</span>
        </div>
      ),
    },
    {
      key: 'coordinates' as keyof MissionPhoto,
      label: 'Coordinates',
      render: (item: MissionPhoto) => <span className="text-white/80">{item.coordinates}</span>,
    },
    {
      key: 'altitude' as keyof MissionPhoto,
      label: 'Altitude',
      render: (item: MissionPhoto) => <span className="text-white/80">{item.altitude}</span>,
    },
    {
      key: 'date' as keyof MissionPhoto,
      label: 'Date',
      render: (item: MissionPhoto) => (
        <div className="flex items-center gap-2 text-white/80">
          <Calendar className="w-4 h-4 text-orange-400" />
          <span>{new Date(item.date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'camera' as keyof MissionPhoto,
      label: 'Camera',
      render: (item: MissionPhoto) => (
        <div className="flex items-center gap-2 text-white/80">
          <Camera className="w-4 h-4 text-purple-400" />
          <span>{item.camera}</span>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading gallery...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-400">Failed to load gallery photos.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Gallery Management</h1>
            <p className="text-sm text-muted-foreground">Manage mission photos and metadata</p>
          </div>
        </div>

        <Button onClick={() => openForm()} className="bg-cyan-600 hover:bg-cyan-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Photo
        </Button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="bg-black/20 border-white/5">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg">{editingPhoto ? 'Edit Mission Photo' : 'Add New Mission Photo'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Image</Label>
                      <div className="flex gap-2 mb-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setImageUploadMode('url')}
                          className={`flex-1 ${imageUploadMode === 'url' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'}`}
                        >
                          <Link className="w-4 h-4 mr-2" /> URL
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setImageUploadMode('upload')}
                          className={`flex-1 ${imageUploadMode === 'upload' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'}`}
                        >
                          <Upload className="w-4 h-4 mr-2" /> Upload
                        </Button>
                      </div>

                      {imageUploadMode === 'url' ? (
                        <Input
                          type="url"
                          required
                          value={formData.image}
                          onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                          className="bg-white/5 border-white/10"
                          placeholder="https://example.com/image.jpg"
                        />
                      ) : (
                        <ImageUpload
                          key={`upload-${imageUploadMode}`}
                          value={formData.image}
                          onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                          onUploadStateChange={setIsUploading}
                          label=""
                          description="Upload mission photo"
                          aspectRatio="16/9"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="bg-white/5 border-white/10"
                        placeholder="Mt. Everest Summit"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Coordinates</Label>
                      <Input
                        type="text"
                        required
                        value={formData.coordinates}
                        onChange={(e) => setFormData(prev => ({ ...prev, coordinates: e.target.value }))}
                        className="bg-white/5 border-white/10"
                        placeholder="27°59'N 86°55'E"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Altitude</Label>
                      <Input
                        type="text"
                        required
                        value={formData.altitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, altitude: e.target.value }))}
                        className="bg-white/5 border-white/10"
                        placeholder="8848M MSL"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="bg-white/5 border-white/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Camera</Label>
                      <Input
                        type="text"
                        required
                        value={formData.camera}
                        onChange={(e) => setFormData(prev => ({ ...prev, camera: e.target.value }))}
                        className="bg-white/5 border-white/10"
                        placeholder="Sony A7III"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Heading</Label>
                      <Input
                        type="text"
                        required
                        value={formData.heading}
                        onChange={(e) => setFormData(prev => ({ ...prev, heading: e.target.value }))}
                        className="bg-white/5 border-white/10"
                        placeholder="045°"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={closeForm} className="text-muted-foreground hover:text-white">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting || isUploading} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                      {(submitting || isUploading) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      {editingPhoto ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-black/20 border border-white/5 rounded-2xl p-6">
          <DataTable
            data={photos}
            columns={columns}
            onEdit={openForm}
            onDelete={(item) => setDeleteTarget(item)}
            searchPlaceholder="Search mission photos..."
            emptyMessage="No mission photos found"
          />
        </div>
      </motion.div>

      <DeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Mission Photo"
        description="Are you sure you want to delete this photo? This action cannot be undone."
        itemName={deleteTarget?.location || ''}
      />
    </div>
  );
}