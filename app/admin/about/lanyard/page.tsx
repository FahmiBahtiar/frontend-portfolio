'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Save, Edit3, Globe, Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface LanyardData {
  id: string;
  // Header
  serviceName: string;
  serviceType: string;
  passportLabel: string;
  
  // Personal Info
  type: string;
  countryCode: string;
  passportNo: string;
  surname: string;
  givenNames: string;
  nationality: string;
  placeOfBirth: string;
  sex: 'M' | 'F';
  dateOfBirth: string;
  dateOfIssue: string;
  dateOfExpiry: string;
  
  // Images
  avatarUrl?: string;
  
  // Colors
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export default function LanyardCardPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<LanyardData | null>(null);
  const [originalData, setOriginalData] = useState<LanyardData | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>('');

  // API functions
  const fetchLanyard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/admin/about/lanyard');
      if (!response.ok) {
        throw new Error('Failed to fetch lanyard data');
      }
      const result = await response.json();
      if (result.success && result.data) {
        // Jika array, ambil item pertama dan mapping snake_case ke camelCase
        let raw = Array.isArray(result.data) ? result.data[0] : result.data;
        if (raw) {
          setFormData({
            id: raw.id,
            serviceName: raw.service_name || '',
            serviceType: raw.service_type || '',
            passportLabel: raw.passport_label || '',
            type: raw.type || '',
            countryCode: raw.country_code || '',
            passportNo: raw.passport_no || '',
            surname: raw.surname || '',
            givenNames: raw.given_names || '',
            nationality: raw.nationality || '',
            placeOfBirth: raw.place_of_birth || '',
            sex: raw.sex || 'M',
            dateOfBirth: raw.date_of_birth || '',
            dateOfIssue: raw.date_of_issue || '',
            dateOfExpiry: raw.date_of_expiry || '',
            avatarUrl: raw.avatar_url,
            backgroundColor: raw.background_color || '#f5e6d3',
            textColor: raw.text_color || '#1e3a8a',
            accentColor: raw.accent_color || '#3b82f6',
            createdAt: raw.created_at || '',
            updatedAt: raw.updated_at || '',
          });
          setOriginalData({
            id: raw.id,
            serviceName: raw.service_name || '',
            serviceType: raw.service_type || '',
            passportLabel: raw.passport_label || '',
            type: raw.type || '',
            countryCode: raw.country_code || '',
            passportNo: raw.passport_no || '',
            surname: raw.surname || '',
            givenNames: raw.given_names || '',
            nationality: raw.nationality || '',
            placeOfBirth: raw.place_of_birth || '',
            sex: raw.sex || 'M',
            dateOfBirth: raw.date_of_birth || '',
            dateOfIssue: raw.date_of_issue || '',
            dateOfExpiry: raw.date_of_expiry || '',
            avatarUrl: raw.avatar_url,
            backgroundColor: raw.background_color || '#f5e6d3',
            textColor: raw.text_color || '#1e3a8a',
            accentColor: raw.accent_color || '#3b82f6',
            createdAt: raw.created_at || '',
            updatedAt: raw.updated_at || '',
          });
          setCurrentAvatarUrl(raw.avatar_url || '');
        } else {
          setFormData(null);
          setOriginalData(null);
          setCurrentAvatarUrl('');
        }
      } else {
        // No lanyard exists yet, use default data
        const defaultData: Omit<LanyardData, 'id' | 'createdAt' | 'updatedAt'> = {
          serviceName: 'PORTFOLIO REPUBLIC',
          serviceType: 'SERVICE PASSPORT',
          passportLabel: 'PRIVATE PASSPORT',
          type: 'P (Service)',
          countryCode: 'PRT',
          passportNo: 'PF2025001',
          surname: 'KELUARGA',
          givenNames: 'YOUR GIVEN NAME',
          nationality: '🌐 Portfolio Republic',
          placeOfBirth: 'Jakarta, Indonesia',
          sex: 'M',
          dateOfBirth: '01 JAN 1990',
          dateOfIssue: '01 OCT 2023',
          dateOfExpiry: '01 OCT 2033',
          avatarUrl: '',
          backgroundColor: '#f5e6d3',
          textColor: '#1e3a8a',
          accentColor: '#3b82f6',
        };
        setFormData(defaultData as LanyardData);
        setOriginalData(defaultData as LanyardData);
        setCurrentAvatarUrl('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lanyard data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveLanyard = async (data: Omit<LanyardData, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsSaving(true);
      setError(null);

      const method = originalData?.id ? 'PUT' : 'POST';
      const url = originalData?.id 
        ? `/api/admin/about/lanyard?id=${originalData.id}`
        : '/api/admin/about/lanyard';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Failed to save lanyard data');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setIsEditing(false);
        // Fetch updated data to ensure the UI reflects the changes
        fetchLanyard();
        return result; // Return the result
      } else {
        throw new Error('Failed to save lanyard data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save lanyard data');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchLanyard();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const dataToSave = {
      serviceName: formData!.serviceName,
      serviceType: formData!.serviceType,
      passportLabel: formData!.passportLabel,
      type: formData!.type,
      countryCode: formData!.countryCode,
      passportNo: formData!.passportNo,
      surname: formData!.surname,
      givenNames: formData!.givenNames,
      nationality: formData!.nationality,
      placeOfBirth: formData!.placeOfBirth,
      sex: formData!.sex,
      dateOfBirth: formData!.dateOfBirth,
      dateOfIssue: formData!.dateOfIssue,
      dateOfExpiry: formData!.dateOfExpiry,
      avatarUrl: currentAvatarUrl,
      backgroundColor: formData!.backgroundColor,
      textColor: formData!.textColor,
      accentColor: formData!.accentColor,
    };

    const result = await saveLanyard(dataToSave);
    
    if (result.success) {
      setFormData(result.data);
      setOriginalData(result.data);
      setCurrentAvatarUrl(result.data.avatarUrl || '');
    }
  };

  const handleChange = (field: keyof LanyardData, value: string) => {
    if (field === 'avatarUrl') {
      setCurrentAvatarUrl(value);
      setFormData(prev => ({ ...prev!, avatarUrl: value }));
    } else {
      setFormData(prev => ({ ...prev!, [field]: value }));
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setError(null);
  };

  const handleUploadStateChange = (uploading: boolean) => {
    setIsUploading(uploading);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading lanyard data...</span>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-white/60 mb-4">Failed to load lanyard data</p>
          <button
            onClick={fetchLanyard}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Passport Card</h1>
              <p className="text-white/60 text-sm mt-1">Manage your digital portfolio passport</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Card
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving || isUploading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isUploading 
                  ? 'Wait for upload...' 
                  : isSaving 
                    ? 'Saving...' 
                    : 'Save Changes'
                }
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {isUploading && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
            <p className="text-yellow-400 text-sm">Uploading image to Cloudinary... Please wait before saving.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header Info */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Header Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Service Name</label>
                <input
                  type="text"
                  value={formData?.serviceName ?? ''}
                  onChange={(e) => handleChange('serviceName', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Service Type</label>
                <input
                  type="text"
                  value={formData?.serviceType ?? ''}
                  onChange={(e) => handleChange('serviceType', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Type</label>
                  <input
                    type="text"
                    value={formData?.type ?? ''}
                    onChange={(e) => handleChange('type', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Country Code</label>
                  <input
                    type="text"
                    value={formData?.countryCode ?? ''}
                    onChange={(e) => handleChange('countryCode', e.target.value.toUpperCase())}
                    disabled={!isEditing}
                    maxLength={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-cyan-500/50 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Passport No.</label>
                <input
                  type="text"
                  value={formData?.passportNo ?? ''}
                  onChange={(e) => handleChange('passportNo', e.target.value.toUpperCase())}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-cyan-500/50 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Surname / Nama Keluarga</label>
                <input
                  type="text"
                  value={formData?.surname ?? ''}
                  onChange={(e) => handleChange('surname', e.target.value.toUpperCase())}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-cyan-500/50 uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Given Names / Nama Depan</label>
                <input
                  type="text"
                  value={formData?.givenNames ?? ''}
                  onChange={(e) => handleChange('givenNames', e.target.value.toUpperCase())}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-cyan-500/50 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Nationality</label>
                  <input
                    type="text"
                    value={formData?.nationality ?? ''}
                    onChange={(e) => handleChange('nationality', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Sex</label>
                  <select
                    value={formData?.sex ?? 'M'}
                    onChange={(e) => handleChange('sex', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="M">M / L (Male)</option>
                    <option value="F">F / P (Female)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Place of Birth</label>
                <input
                  type="text"
                  value={formData?.placeOfBirth ?? ''}
                  onChange={(e) => handleChange('placeOfBirth', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Date of Birth</label>
                  <input
                    type="text"
                    value={formData?.dateOfBirth ?? ''}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    disabled={!isEditing}
                    placeholder="01 JAN 1990"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Date of Issue</label>
                  <input
                    type="text"
                    value={formData?.dateOfIssue ?? ''}
                    onChange={(e) => handleChange('dateOfIssue', e.target.value)}
                    disabled={!isEditing}
                    placeholder="01 OCT 2023"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Date of Expiry</label>
                  <input
                    type="text"
                    value={formData?.dateOfExpiry ?? ''}
                    onChange={(e) => handleChange('dateOfExpiry', e.target.value)}
                    disabled={!isEditing}
                    placeholder="01 OCT 2033"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Card Design</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Background</label>
                <input
                  type="color"
                  value={formData?.backgroundColor ?? '#f5e6d3'}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  disabled={!isEditing}
                  className="w-full h-12 rounded-xl cursor-pointer disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Text</label>
                <input
                  type="color"
                  value={formData?.textColor ?? '#1e3a8a'}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  disabled={!isEditing}
                  className="w-full h-12 rounded-xl cursor-pointer disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Accent</label>
                <input
                  type="color"
                  value={formData?.accentColor ?? '#3b82f6'}
                  onChange={(e) => handleChange('accentColor', e.target.value)}
                  disabled={!isEditing}
                  className="w-full h-12 rounded-xl cursor-pointer disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preview Section */}
        <div className="space-y-6">
          {/* Avatar Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Photo</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Avatar URL</label>
                <input
                  type="text"
                  value={currentAvatarUrl}
                  onChange={(e) => handleChange('avatarUrl', e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-50 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <ImageUpload
                value={currentAvatarUrl}
                onChange={(url: string) => handleChange('avatarUrl', url)}
                label="Upload Photo"
                aspectRatio="3/4"
                disabled={!isEditing}
                onUploadStateChange={handleUploadStateChange}
              />
            </div>
          </motion.div>

          {/* Live Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Preview</h2>
            
            {/* Passport Card */}
            <div 
              className="aspect-[1.6/1] rounded-2xl p-6 shadow-2xl relative overflow-hidden"
              style={{ backgroundColor: formData!.backgroundColor, color: formData!.textColor }}
            >
              {/* Header */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <Globe className="w-6 h-6" style={{ color: formData!.accentColor }} />
                  <p className="text-xs font-bold tracking-wider">{formData!.serviceName}</p>
                  <Globe className="w-6 h-6" style={{ color: formData!.accentColor }} />
                </div>
                <p className="text-[10px] font-semibold tracking-wide">{formData!.serviceType}</p>
                <p className="text-[9px] opacity-70">{formData!.passportLabel}</p>
              </div>

              {/* Main Content */}
              <div className="flex gap-4">
                {/* Photo */}
                <div className="w-24 h-28 bg-white/20 rounded border-2" style={{ borderColor: formData!.accentColor }}>
                  {currentAvatarUrl && (
                    <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover rounded" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-[9px] space-y-1">
                  <div>
                    <p className="opacity-60">TYPE / TIPE</p>
                    <p className="font-semibold" style={{ color: formData!.accentColor }}>{formData!.type}</p>
                  </div>
                  <div>
                    <p className="opacity-60">COUNTRY CODE</p>
                    <p className="font-bold">{formData!.countryCode}</p>
                  </div>
                  <div>
                    <p className="opacity-60">PASSPORT NO.</p>
                    <p className="font-bold font-mono">{formData!.passportNo}</p>
                  </div>
                  <div>
                    <p className="opacity-60">SURNAME / NAMA KELUARGA</p>
                    <p className="font-bold">{formData!.surname}</p>
                  </div>
                  <div>
                    <p className="opacity-60">GIVEN NAMES / NAMA DEPAN</p>
                    <p className="font-bold">{formData!.givenNames}</p>
                  </div>
                </div>

                {/* Chip Icon */}
                <div className="w-10 h-10 rounded bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-700 flex items-center justify-center">
                  <div className="grid grid-cols-3 grid-rows-3 gap-[2px]">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-yellow-900 rounded-sm" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-[8px]">
                <div>
                  <p className="opacity-60">NATIONALITY</p>
                  <p className="font-semibold">{formData!.nationality}</p>
                </div>
                <div>
                  <p className="opacity-60">DATE OF BIRTH</p>
                  <p className="font-semibold">📅 {formData!.dateOfBirth}</p>
                </div>
                <div>
                  <p className="opacity-60">SEX / JENIS KELAMIN</p>
                  <p className="font-semibold">
                    {formData!.sex} / {formData!.sex === 'M' ? 'L' : 'P'} 
                    <span className="ml-1">{formData!.sex === 'M' ? '♂' : '♀'}</span>
                  </p>
                </div>
                <div>
                  <p className="opacity-60">PLACE OF BIRTH</p>
                  <p className="font-semibold truncate">{formData!.placeOfBirth}</p>
                </div>
                <div>
                  <p className="opacity-60">DATE OF ISSUE</p>
                  <p className="font-semibold">{formData!.dateOfIssue}</p>
                </div>
                <div>
                  <p className="opacity-60">DATE OF EXPIRY</p>
                  <p className="font-semibold">{formData!.dateOfExpiry}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
