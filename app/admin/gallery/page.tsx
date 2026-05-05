'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Save, Loader2, Edit, Trash2, MapPin, Camera, Calendar, Upload, Link } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { galleryApi, MissionPhoto } from '@/lib/services/gallery';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function GalleryPage() {
  const [photos, setPhotos] = useState<MissionPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch photos on component mount
  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await galleryApi.getAll();
      setPhotos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch photos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || isUploading) return;

    try {
      setSubmitting(true);
      if (editingPhoto?.id) {
        await galleryApi.update(editingPhoto.id, formData);
      } else {
        await galleryApi.create(formData);
      }
      await fetchPhotos();
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save photo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;

    try {
      await galleryApi.delete(deleteTarget.id);
      await fetchPhotos();
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete photo');
    }
  };

  const openForm = (photo?: MissionPhoto) => {
    if (photo) {
      setEditingPhoto(photo);
      setFormData({
        image: photo.image,
        location: photo.location,
        coordinates: photo.coordinates,
        altitude: photo.altitude,
        date: photo.date,
        camera: photo.camera,
        heading: photo.heading,
      });
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
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 relative">
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
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{item.location}</span>
        </div>
      ),
    },
    {
      key: 'coordinates' as keyof MissionPhoto,
      label: 'Coordinates',
    },
    {
      key: 'altitude' as keyof MissionPhoto,
      label: 'Altitude',
    },
    {
      key: 'date' as keyof MissionPhoto,
      label: 'Date',
      render: (item: MissionPhoto) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(item.date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'camera' as keyof MissionPhoto,
      label: 'Camera',
      render: (item: MissionPhoto) => (
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-gray-400" />
          <span>{item.camera}</span>
        </div>
      ),
    },
    {
      key: 'heading' as keyof MissionPhoto,
      label: 'Heading',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600">Manage mission photos and their metadata</p>
        </div>
        <button
          onClick={() => openForm()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Photo
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={photos}
        columns={columns}
        onEdit={openForm}
        onDelete={(item) => setDeleteTarget(item)}
        onCreate={() => openForm()}
        searchPlaceholder="Search mission photos..."
        emptyMessage={loading ? "Loading photos..." : "No mission photos found"}
      />

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-orange-500/20 to-cyan-500/20 border-b border-orange-500/30 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {editingPhoto ? 'Edit Mission Photo' : 'Add Mission Photo'}
                      </h2>
                      <p className="text-white/60">
                        {editingPhoto ? 'Update photo information' : 'Add a new mission photo to your gallery'}
                      </p>
                    </div>
                    <button
                      onClick={closeForm}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-white mb-2">
                          Image
                        </label>
                        
                        {/* Toggle between URL and Upload */}
                        <div className="flex gap-2 mb-3">
                          <button
                            type="button"
                            onClick={() => setImageUploadMode('url')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              imageUploadMode === 'url'
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <Link className="w-4 h-4" />
                            URL
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageUploadMode('upload')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              imageUploadMode === 'upload'
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <Upload className="w-4 h-4" />
                            Upload
                          </button>
                        </div>

                        {/* URL Input */}
                        {imageUploadMode === 'url' && (
                          <input
                            type="url"
                            required
                            value={formData.image}
                            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                            placeholder="https://example.com/image.jpg"
                          />
                        )}

                        {/* Image Upload */}
                        {imageUploadMode === 'upload' && (
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

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                          placeholder="Mt. Everest Summit"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Coordinates
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.coordinates}
                          onChange={(e) => setFormData(prev => ({ ...prev, coordinates: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                          placeholder="27°59'N 86°55'E"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Altitude
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.altitude}
                          onChange={(e) => setFormData(prev => ({ ...prev, altitude: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                          placeholder="8848M MSL"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Camera
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.camera}
                          onChange={(e) => setFormData(prev => ({ ...prev, camera: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                          placeholder="Sony A7III"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Heading
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.heading}
                          onChange={(e) => setFormData(prev => ({ ...prev, heading: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                          placeholder="045°"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeForm}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || isUploading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {(submitting || isUploading) && <Loader2 className="w-5 h-5 animate-spin" />}
                        <Save className="w-5 h-5" />
                        {editingPhoto ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Mission Photo</h3>
                <p className="text-white/60 text-sm">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-white/80 mb-6">
              Are you sure you want to delete the photo from "{deleteTarget.location}"? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}