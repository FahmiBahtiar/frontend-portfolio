'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import useSWR from 'swr';
import { CreditCard, Save, Edit3, Globe, Loader2, X } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface LanyardData {
  id: string;
  serviceName: string;
  serviceType: string;
  passportLabel: string;
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
  avatarUrl?: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  createdAt: string;
  updatedAt: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch data');
  const json = await res.json();
  return json.data;
};

export default function LanyardCardPage() {
  const { data: rawData, mutate, isLoading, error } = useSWR('/api/admin/about/lanyard', fetcher);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<LanyardData | null>(null);
  const [originalData, setOriginalData] = useState<LanyardData | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>('');

  useEffect(() => {
    if (rawData) {
      const raw = Array.isArray(rawData) ? rawData[0] : rawData;
      if (raw) {
        const mappedData = {
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
        };
        setFormData(mappedData);
        setOriginalData(mappedData);
        setCurrentAvatarUrl(mappedData.avatarUrl || '');
      }
    } else if (!isLoading && !error) {
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
  }, [rawData, isLoading, error]);

  const saveLanyard = async (data: Omit<LanyardData, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsSaving(true);
      const method = originalData?.id ? 'PUT' : 'POST';
      const url = originalData?.id 
        ? `/api/admin/about/lanyard?id=${originalData.id}`
        : '/api/admin/about/lanyard';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save lanyard data');
      
      await mutate();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save lanyard data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const dataToSave = {
      serviceName: formData.serviceName,
      serviceType: formData.serviceType,
      passportLabel: formData.passportLabel,
      type: formData.type,
      countryCode: formData.countryCode,
      passportNo: formData.passportNo,
      surname: formData.surname,
      givenNames: formData.givenNames,
      nationality: formData.nationality,
      placeOfBirth: formData.placeOfBirth,
      sex: formData.sex,
      dateOfBirth: formData.dateOfBirth,
      dateOfIssue: formData.dateOfIssue,
      dateOfExpiry: formData.dateOfExpiry,
      avatarUrl: currentAvatarUrl,
      backgroundColor: formData.backgroundColor,
      textColor: formData.textColor,
      accentColor: formData.accentColor,
    };

    await saveLanyard(dataToSave);
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
    setCurrentAvatarUrl(originalData?.avatarUrl || '');
    setIsEditing(false);
  };

  const handleUploadStateChange = (uploading: boolean) => {
    setIsUploading(uploading);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading passport data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-400">Failed to load passport data.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-lg shadow-purple-500/10">
            <CreditCard className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Passport Card</h1>
            <p className="text-sm text-muted-foreground">Manage your digital portfolio passport</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Card
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="text-muted-foreground hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving || isUploading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="bg-black/20 border-white/5">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg">Header Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Service Name</Label>
                <Input
                  type="text"
                  value={formData?.serviceName ?? ''}
                  onChange={(e) => handleChange('serviceName', e.target.value)}
                  disabled={!isEditing}
                  className="bg-white/5 border-white/10 disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Input
                  type="text"
                  value={formData?.serviceType ?? ''}
                  onChange={(e) => handleChange('serviceType', e.target.value)}
                  disabled={!isEditing}
                  className="bg-white/5 border-white/10 disabled:opacity-50"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-white/5">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input
                    type="text"
                    value={formData?.type ?? ''}
                    onChange={(e) => handleChange('type', e.target.value)}
                    disabled={!isEditing}
                    className="bg-white/5 border-white/10 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country Code</Label>
                  <Input
                    type="text"
                    value={formData?.countryCode ?? ''}
                    onChange={(e) => handleChange('countryCode', e.target.value.toUpperCase())}
                    disabled={!isEditing}
                    maxLength={3}
                    className="bg-white/5 border-white/10 disabled:opacity-50 uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Passport No.</Label>
                <Input
                  type="text"
                  value={formData?.passportNo ?? ''}
                  onChange={(e) => handleChange('passportNo', e.target.value.toUpperCase())}
                  disabled={!isEditing}
                  className="bg-white/5 border-white/10 disabled:opacity-50 uppercase font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label>Surname / Nama Keluarga</Label>
                <Input
                  type="text"
                  value={formData?.surname ?? ''}
                  onChange={(e) => handleChange('surname', e.target.value.toUpperCase())}
                  disabled={!isEditing}
                  className="bg-white/5 border-white/10 disabled:opacity-50 uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label>Given Names / Nama Depan</Label>
                <Input
                  type="text"
                  value={formData?.givenNames ?? ''}
                  onChange={(e) => handleChange('givenNames', e.target.value.toUpperCase())}
                  disabled={!isEditing}
                  className="bg-white/5 border-white/10 disabled:opacity-50 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Input
                    type="text"
                    value={formData?.nationality ?? ''}
                    onChange={(e) => handleChange('nationality', e.target.value)}
                    disabled={!isEditing}
                    className="bg-white/5 border-white/10 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sex</Label>
                  <select
                    value={formData?.sex ?? 'M'}
                    onChange={(e) => handleChange('sex', e.target.value)}
                    disabled={!isEditing}
                    className="w-full h-10 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
                  >
                    <option value="M" className="bg-slate-900">M / L (Male)</option>
                    <option value="F" className="bg-slate-900">F / P (Female)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Place of Birth</Label>
                <Input
                  type="text"
                  value={formData?.placeOfBirth ?? ''}
                  onChange={(e) => handleChange('placeOfBirth', e.target.value)}
                  disabled={!isEditing}
                  className="bg-white/5 border-white/10 disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="text"
                    value={formData?.dateOfBirth ?? ''}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    disabled={!isEditing}
                    placeholder="01 JAN 1990"
                    className="bg-white/5 border-white/10 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Issue</Label>
                  <Input
                    type="text"
                    value={formData?.dateOfIssue ?? ''}
                    onChange={(e) => handleChange('dateOfIssue', e.target.value)}
                    disabled={!isEditing}
                    placeholder="01 OCT 2023"
                    className="bg-white/5 border-white/10 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Expiry</Label>
                  <Input
                    type="text"
                    value={formData?.dateOfExpiry ?? ''}
                    onChange={(e) => handleChange('dateOfExpiry', e.target.value)}
                    disabled={!isEditing}
                    placeholder="01 OCT 2033"
                    className="bg-white/5 border-white/10 disabled:opacity-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-white/5">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg">Card Design</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Background</Label>
                  <Input
                    type="color"
                    value={formData?.backgroundColor ?? '#f5e6d3'}
                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                    disabled={!isEditing}
                    className="h-12 px-2 cursor-pointer bg-white/5 border-white/10 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Text</Label>
                  <Input
                    type="color"
                    value={formData?.textColor ?? '#1e3a8a'}
                    onChange={(e) => handleChange('textColor', e.target.value)}
                    disabled={!isEditing}
                    className="h-12 px-2 cursor-pointer bg-white/5 border-white/10 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Accent</Label>
                  <Input
                    type="color"
                    value={formData?.accentColor ?? '#3b82f6'}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    disabled={!isEditing}
                    className="h-12 px-2 cursor-pointer bg-white/5 border-white/10 disabled:opacity-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-black/20 border-white/5">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg">Photo</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Avatar URL</Label>
                  <Input
                    type="text"
                    value={currentAvatarUrl}
                    onChange={(e) => handleChange('avatarUrl', e.target.value)}
                    disabled={!isEditing}
                    placeholder="https://example.com/avatar.jpg"
                    className="bg-white/5 border-white/10 disabled:opacity-50"
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
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-black/20 border-white/5">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div 
                  className="aspect-[1.6/1] rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                  style={{ backgroundColor: formData?.backgroundColor || '#f5e6d3', color: formData?.textColor || '#1e3a8a' }}
                >
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-3 mb-1">
                      <Globe className="w-6 h-6" style={{ color: formData?.accentColor }} />
                      <p className="text-xs font-bold tracking-wider">{formData?.serviceName}</p>
                      <Globe className="w-6 h-6" style={{ color: formData?.accentColor }} />
                    </div>
                    <p className="text-[10px] font-semibold tracking-wide">{formData?.serviceType}</p>
                    <p className="text-[9px] opacity-70">{formData?.passportLabel}</p>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-24 h-28 bg-white/20 rounded border-2 relative" style={{ borderColor: formData?.accentColor }}>
                      {currentAvatarUrl && (
                        <Image src={currentAvatarUrl} alt="Avatar" fill className="object-cover rounded" />
                      )}
                    </div>

                    <div className="flex-1 text-[9px] space-y-1">
                      <div>
                        <p className="opacity-60">TYPE / TIPE</p>
                        <p className="font-semibold" style={{ color: formData?.accentColor }}>{formData?.type}</p>
                      </div>
                      <div>
                        <p className="opacity-60">COUNTRY CODE</p>
                        <p className="font-bold">{formData?.countryCode}</p>
                      </div>
                      <div>
                        <p className="opacity-60">PASSPORT NO.</p>
                        <p className="font-bold font-mono">{formData?.passportNo}</p>
                      </div>
                      <div>
                        <p className="opacity-60">SURNAME / NAMA KELUARGA</p>
                        <p className="font-bold">{formData?.surname}</p>
                      </div>
                      <div>
                        <p className="opacity-60">GIVEN NAMES / NAMA DEPAN</p>
                        <p className="font-bold">{formData?.givenNames}</p>
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-700 flex items-center justify-center">
                      <div className="grid grid-cols-3 grid-rows-3 gap-[2px]">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className="w-1 h-1 bg-yellow-900 rounded-sm" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-[8px]">
                    <div>
                      <p className="opacity-60">NATIONALITY</p>
                      <p className="font-semibold">{formData?.nationality}</p>
                    </div>
                    <div>
                      <p className="opacity-60">DATE OF BIRTH</p>
                      <p className="font-semibold">📅 {formData?.dateOfBirth}</p>
                    </div>
                    <div>
                      <p className="opacity-60">SEX / JENIS KELAMIN</p>
                      <p className="font-semibold">
                        {formData?.sex} / {formData?.sex === 'M' ? 'L' : 'P'} 
                        <span className="ml-1">{formData?.sex === 'M' ? '♂' : '♀'}</span>
                      </p>
                    </div>
                    <div>
                      <p className="opacity-60">PLACE OF BIRTH</p>
                      <p className="font-semibold truncate">{formData?.placeOfBirth}</p>
                    </div>
                    <div>
                      <p className="opacity-60">DATE OF ISSUE</p>
                      <p className="font-semibold">{formData?.dateOfIssue}</p>
                    </div>
                    <div>
                      <p className="opacity-60">DATE OF EXPIRY</p>
                      <p className="font-semibold">{formData?.dateOfExpiry}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
