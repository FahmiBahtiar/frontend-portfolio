'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import useSWR from 'swr';
import {
  BookOpen,
  Plus,
  Save,
  Loader2,
  Trash2,
  ExternalLink,
  FileText,
  Sparkles,
  Users,
  Star,
  X,
} from 'lucide-react';
import { EducationService } from '@/lib/services/education';
import type { Publication } from '@/lib/types/admin';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface PublicationFormData {
  title: string;
  authors: string;
  journal: string;
  volumeIssue: string;
  pages: string;
  year: number;
  publishedDate: string;
  doi: string;
  url: string;
  pdfUrl: string;
  publisher: string;
  accreditation: string;
  abstract: string;
  accuracy: string;
  inferenceTime: string;
  datasetSamples: string;
  featuresAnalyzed: string;
  tags: string;
  isFeatured: boolean;
  order: number;
}

const INITIAL_FORM: PublicationFormData = {
  title: '',
  authors: 'Fahmi Bahtiar Adi Nugroho',
  journal: '',
  volumeIssue: '',
  pages: '',
  year: new Date().getFullYear(),
  publishedDate: '',
  doi: '',
  url: '',
  pdfUrl: '',
  publisher: '',
  accreditation: 'SINTA 2 Accredited',
  abstract: '',
  accuracy: '97.29%',
  inferenceTime: '0.029s',
  datasetSamples: '11,055 URLs',
  featuresAnalyzed: '29 Features',
  tags: 'Cybersecurity, Machine Learning, Random Forest, Phishing Detection',
  isFeatured: true,
  order: 0,
};

export default function PublicationsAdminPage() {
  const {
    data: publications = [],
    mutate,
    isLoading,
  } = useSWR<Publication[]>('adminPublications', () =>
    EducationService.getPublications()
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PublicationFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Publication | null>(null);

  const handleEdit = (pub: Publication) => {
    setEditingId(pub.id);
    setFormData({
      title: pub.title || '',
      authors: Array.isArray(pub.authors) ? pub.authors.join(', ') : '',
      journal: pub.journal || '',
      volumeIssue: pub.volumeIssue || '',
      pages: pub.pages || '',
      year: pub.year || new Date().getFullYear(),
      publishedDate: pub.publishedDate || '',
      doi: pub.doi || '',
      url: pub.url || '',
      pdfUrl: pub.pdfUrl || '',
      publisher: pub.publisher || '',
      accreditation: pub.accreditation || '',
      abstract: pub.abstract || '',
      accuracy: pub.metrics?.accuracy || '',
      inferenceTime: pub.metrics?.inference_time || pub.metrics?.inferenceTime || '',
      datasetSamples:
        pub.metrics?.dataset_samples || pub.metrics?.datasetSamples || '',
      featuresAnalyzed:
        pub.metrics?.features_analyzed || pub.metrics?.featuresAnalyzed || '',
      tags: Array.isArray(pub.tags) ? pub.tags.join(', ') : '',
      isFeatured: pub.isFeatured ?? true,
      order: pub.order ?? 0,
    });
    setIsFormOpen(true);
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.journal.trim()) {
      alert('Judul paper dan nama jurnal wajib diisi!');
      return;
    }

    setSaving(true);
    try {
      const authorList = formData.authors
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const tagList = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const metrics: Record<string, string> = {};
      if (formData.accuracy.trim()) metrics.accuracy = formData.accuracy.trim();
      if (formData.inferenceTime.trim())
        metrics.inference_time = formData.inferenceTime.trim();
      if (formData.datasetSamples.trim())
        metrics.dataset_samples = formData.datasetSamples.trim();
      if (formData.featuresAnalyzed.trim())
        metrics.features_analyzed = formData.featuresAnalyzed.trim();

      const payload = {
        title: formData.title.trim(),
        authors:
          authorList.length > 0 ? authorList : ['Fahmi Bahtiar Adi Nugroho'],
        journal: formData.journal.trim(),
        volumeIssue: formData.volumeIssue.trim() || undefined,
        pages: formData.pages.trim() || undefined,
        year: Number(formData.year) || new Date().getFullYear(),
        publishedDate: formData.publishedDate.trim() || undefined,
        doi: formData.doi.trim() || undefined,
        url: formData.url.trim() || undefined,
        pdfUrl: formData.pdfUrl.trim() || undefined,
        publisher: formData.publisher.trim() || undefined,
        accreditation: formData.accreditation.trim() || undefined,
        abstract: formData.abstract.trim() || undefined,
        metrics,
        tags: tagList,
        isFeatured: formData.isFeatured,
        order: Number(formData.order) || 0,
      };

      if (editingId) {
        const optimisticPub: Publication = {
          id: editingId,
          title: payload.title,
          authors: payload.authors,
          journal: payload.journal,
          volumeIssue: payload.volumeIssue,
          pages: payload.pages,
          year: payload.year,
          publishedDate: payload.publishedDate,
          doi: payload.doi,
          url: payload.url,
          pdfUrl: payload.pdfUrl,
          publisher: payload.publisher,
          accreditation: payload.accreditation,
          abstract: payload.abstract,
          metrics: payload.metrics,
          tags: payload.tags,
          isFeatured: payload.isFeatured,
          order: payload.order,
          updatedAt: new Date().toISOString(),
        };
        const updatedList = publications.map((p: Publication) =>
          p.id === editingId ? optimisticPub : p
        );
        mutate(updatedList, false);
        handleReset();

        await EducationService.updatePublication(editingId, payload);
      } else {
        const newPub = await EducationService.createPublication(payload);
        mutate([...publications, newPub], false);
        handleReset();
      }

      // Signal public page to revalidate via storage event
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('publications_updated', Date.now().toString());
      }

      mutate();
    } catch (err: unknown) {
      console.error('Error saving publication:', err);
      alert('Gagal menyimpan data publikasi. Silakan periksa kembali.');
      mutate();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const idToDelete = deleteTarget.id;
    setDeleteTarget(null);
    mutate(publications.filter((p: Publication) => p.id !== idToDelete), false);

    try {
      await EducationService.deletePublication(idToDelete);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('publications_updated', Date.now().toString());
      }
      mutate();
    } catch (err) {
      console.error('Error deleting publication:', err);
      alert('Gagal menghapus publikasi.');
      mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#0891b2]" />
        <p className="text-sm text-[#527d85] font-medium animate-pulse">
          Memuat daftar publikasi ilmiah...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#B9E7E6] flex items-center justify-center text-[#0891b2] shadow-sm">
            <BookOpen className="w-6 h-6 text-[#0891b2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0c282d] tracking-tight">
              Publications & Research
            </h1>
            <p className="text-sm text-[#527d85]">
              Kelola jurnal ilmiah, artikel penelitian, dan konferensi akademik
            </p>
          </div>
        </div>

        <Button
          onClick={() => {
            if (isFormOpen) {
              handleReset();
            } else {
              setEditingId(null);
              setFormData(INITIAL_FORM);
              setIsFormOpen(true);
            }
          }}
          className="bg-[#6FD4E1] hover:bg-[#B9E7E6] text-[#0c282d] font-bold shadow-sm"
        >
          {isFormOpen ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Tutup Form
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Publikasi
            </>
          )}
        </Button>
      </div>

      {/* Form Drawer / Panel */}
      {isFormOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white border border-[#B9E7E6] shadow-sm text-[#0c282d]">
            <CardHeader className="border-b border-[#B9E7E6] pb-4">
              <CardTitle className="text-lg text-[#0c282d] font-bold">
                {editingId ? 'Edit Scientific Publication' : 'Tambah Publikasi Ilmiah Baru'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label className="text-[#0c282d] font-bold">Judul Paper / Publikasi</Label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="A Comparative Analysis of P-Value and Mutual Information..."
                    className="bg-white border border-[#B9E7E6] text-[#0c282d] font-medium"
                    required
                  />
                </div>

                {/* Authors & Journal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#0c282d] font-bold">
                      Penulis (Pisahkan dengan koma)
                    </Label>
                    <Input
                      type="text"
                      value={formData.authors}
                      onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                      placeholder="Fahmi Bahtiar Adi Nugroho, Co-Author 1, Co-Author 2"
                      className="bg-white border border-[#B9E7E6] text-[#0c282d] font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#0c282d] font-bold">Nama Jurnal / Konferensi</Label>
                    <Input
                      type="text"
                      value={formData.journal}
                      onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                      placeholder="Jurnal Nasional Teknologi dan Sistem Informasi (TEKNOSI)"
                      className="bg-white border border-[#B9E7E6] text-[#0c282d] font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Volume, Pages, Year, Accreditation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#0c282d] font-bold">Volume / Issue</Label>
                    <Input
                      type="text"
                      value={formData.volumeIssue}
                      onChange={(e) => setFormData({ ...formData, volumeIssue: e.target.value })}
                      placeholder="Vol. 11 No. 03 (2025)"
                      className="bg-white border border-[#B9E7E6] text-[#0c282d] font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#0c282d] font-bold">Halaman (Pages)</Label>
                    <Input
                      type="text"
                      value={formData.pages}
                      onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                      placeholder="377–386"
                      className="bg-white border border-[#B9E7E6] text-[#0c282d] font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#0c282d] font-bold">Tahun Terbit</Label>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      placeholder="2025"
                      className="bg-white border border-[#B9E7E6] text-[#0c282d] font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#0c282d] font-bold">Akreditasi / Index</Label>
                    <Input
                      type="text"
                      value={formData.accreditation}
                      onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                      placeholder="SINTA 2 Accredited / Scopus"
                      className="bg-white border border-[#B9E7E6] text-[#0c282d] font-medium"
                    />
                  </div>
                </div>

                {/* DOI, Link Web, Link PDF */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#0c282d] font-bold">DOI</Label>
                    <Input
                      type="text"
                      value={formData.doi}
                      onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                      placeholder="10.25077/TEKNOSI.v11i3.2025.377-386"
                      className="bg-white border border-[#B9E7E6] text-[#0c282d] font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#0c282d] font-bold">Link Landing Page / URL</Label>
                    <Input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://teknosi.fti.unand.ac.id/..."
                      className="bg-white border border-[#B9E7E6] text-[#0c282d] font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#0c282d] font-bold">Link Unduh PDF Langsung</Label>
                    <Input
                      type="url"
                      value={formData.pdfUrl}
                      onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                      placeholder="https://.../article/download/..."
                      className="bg-white border border-[#B9E7E6] text-[#0c282d] font-medium"
                    />
                  </div>
                </div>

                {/* Research Performance Metrics */}
                <div className="p-4 rounded-xl bg-[#E2F4F3]/40 border border-[#B9E7E6] space-y-3">
                  <Label className="text-[#0c282d] font-bold block">
                    Statistik Performa Riset (Key Metrics HUD)
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <span className="text-xs text-[#527d85] font-semibold">Akurasi</span>
                      <Input
                        type="text"
                        value={formData.accuracy}
                        onChange={(e) => setFormData({ ...formData, accuracy: e.target.value })}
                        placeholder="97.29%"
                        className="bg-white border border-[#B9E7E6] text-[#0c282d] font-medium h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-[#527d85] font-semibold">Inferensi Waktu</span>
                      <Input
                        type="text"
                        value={formData.inferenceTime}
                        onChange={(e) => setFormData({ ...formData, inferenceTime: e.target.value })}
                        placeholder="0.029s"
                        className="bg-white border border-[#B9E7E6] text-[#0c282d] font-medium h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-[#527d85] font-semibold">Ukuran Dataset</span>
                      <Input
                        type="text"
                        value={formData.datasetSamples}
                        onChange={(e) => setFormData({ ...formData, datasetSamples: e.target.value })}
                        placeholder="11,055 URLs"
                        className="bg-white border border-[#B9E7E6] text-[#0c282d] font-medium h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-[#527d85] font-semibold">Fitur Terbaik</span>
                      <Input
                        type="text"
                        value={formData.featuresAnalyzed}
                        onChange={(e) => setFormData({ ...formData, featuresAnalyzed: e.target.value })}
                        placeholder="29 Features"
                        className="bg-white border border-[#B9E7E6] text-[#0c282d] font-medium h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Abstract */}
                <div className="space-y-2">
                  <Label className="text-[#0c282d] font-bold">Abstrak / Ringkasan Paper</Label>
                  <Textarea
                    value={formData.abstract}
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                    rows={4}
                    placeholder="Ringkasan singkat temuan riset dan metodologi..."
                    className="bg-white border border-[#B9E7E6] text-[#0c282d] font-medium"
                  />
                </div>

                {/* Tags & Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#0c282d] font-bold">
                      Tags / Topik (Pisahkan koma)
                    </Label>
                    <Input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="Cybersecurity, Random Forest, Machine Learning"
                      className="bg-white border border-[#B9E7E6] text-[#0c282d] font-medium"
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-6">
                    <Checkbox
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(c) => setFormData({ ...formData, isFeatured: !!c })}
                      className="border-[#B9E7E6] data-[state=checked]:bg-[#6FD4E1] data-[state=checked]:text-[#0c282d]"
                    />
                    <label
                      htmlFor="isFeatured"
                      className="text-sm font-bold text-[#0c282d] flex items-center gap-2 cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          formData.isFeatured
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-[#527d85]'
                        }`}
                      />
                      Sorot Publikasi Ini (Featured / Pinned)
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleReset}
                    className="text-[#527d85] hover:text-[#0c282d] hover:bg-[#E2F4F3] font-bold"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-[#6FD4E1] hover:bg-[#B9E7E6] text-[#0c282d] font-bold shadow-sm"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {editingId ? 'Simpan Perubahan' : 'Terbitkan Publikasi'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Publications List */}
      <div className="space-y-4">
        {publications.map((pub) => (
          <Card
            key={pub.id}
            className="border border-[#B9E7E6] bg-white shadow-sm hover:border-[#6FD4E1] transition-all rounded-2xl overflow-hidden"
          >
            <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-[#E2F4F3] border border-[#6FD4E1] text-[#0891b2]">
                    Peer-Reviewed Journal
                  </span>
                  {pub.accreditation && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-50 border border-emerald-200 text-emerald-800">
                      {pub.accreditation}
                    </span>
                  )}
                  {pub.isFeatured && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-amber-50 border border-amber-300 text-amber-800 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      Featured
                    </span>
                  )}
                  <span className="text-xs font-mono font-bold text-[#527d85]">
                    {pub.year}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#0c282d] mb-1.5 leading-snug">
                  {pub.title}
                </h3>

                <p className="text-xs text-[#527d85] mb-3">
                  <span className="font-semibold text-[#0c282d]">Penulis:</span>{' '}
                  {pub.authors?.join(', ')} •{' '}
                  <span className="italic font-medium text-[#0c282d]">{pub.journal}</span>
                  {pub.volumeIssue ? ` (${pub.volumeIssue})` : ''}
                </p>

                {pub.metrics && Object.keys(pub.metrics).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Object.entries(pub.metrics).map(([k, v], idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#E2F4F3] border border-[#B9E7E6] text-[11px] font-mono font-bold text-[#0891b2]"
                      >
                        {k.replace(/_/g, ' ')}: {v}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs">
                  {pub.doi && (
                    <a
                      href={pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0891b2] hover:underline flex items-center gap-1 font-semibold"
                    >
                      DOI: {pub.doi} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {pub.pdfUrl && (
                    <a
                      href={pub.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0891b2] hover:underline flex items-center gap-1 font-semibold"
                    >
                      Download PDF <FileText className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end self-end md:self-center shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(pub)}
                  className="text-[#0891b2] hover:bg-[#E2F4F3] hover:text-[#0c282d] font-bold"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(pub)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {publications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#B9E7E6]">
            <BookOpen className="w-12 h-12 text-[#B9E7E6] mx-auto mb-3" />
            <p className="text-sm text-[#527d85] font-medium">
              Belum ada publikasi ilmiah yang terdaftar.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Publikasi Ilmiah"
        description={`Apakah Anda yakin ingin menghapus paper "${deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
