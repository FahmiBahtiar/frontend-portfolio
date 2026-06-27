'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import useSWR from 'swr';
import {
  Mail,
  Eye,
  EyeOff,
  Archive,
  Trash2,
  Reply,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  MessageSquare,
  User,
  Calendar,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import type { ContactMessage } from '@/lib/types/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommunicationStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
  archived: number;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch data');
  const json = await res.json();
  if (!json.success) throw new Error('Failed to load data');
  return json.data;
};

export default function CommunicationPage() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const queryParams = new URLSearchParams();
  if (filter !== 'all') {
    if (filter === 'archived') {
      queryParams.append('isArchived', 'true');
    } else {
      queryParams.append('status', filter);
    }
  }

  const { data: messages = [], mutate: mutateMessages, isLoading: messagesLoading } = useSWR<ContactMessage[]>(`/api/admin/communication/messages?${queryParams.toString()}`, fetcher);
  const { data: stats = { total: 0, unread: 0, read: 0, replied: 0, archived: 0 }, mutate: mutateStats } = useSWR<CommunicationStats>('/api/admin/communication/stats', fetcher);

  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replyingId, setReplyingId] = useState<string | null>(null);

  const refreshData = async () => {
    await Promise.all([mutateMessages(), mutateStats()]);
  };

  const handleMarkAsRead = async (message: ContactMessage) => {
    if (!message.id) return;
    try {
      const response = await fetch(`/api/admin/communication/messages/${message.id}/read`, { method: 'PUT' });
      if (response.ok) await refreshData();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleReply = async (message: ContactMessage) => {
    if (!replyMessage.trim() || !message.id) return;
    setReplyingId(message.id);
    try {
      const response = await fetch(`/api/admin/communication/messages/${message.id}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyMessage }),
      });
      if (response.ok) {
        setReplyMessage('');
        setIsReplying(false);
        setSelectedMessage(null);
        await refreshData();
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setReplyingId(null);
    }
  };

  const handleArchive = async (message: ContactMessage) => {
    if (!message.id) return;
    try {
      const response = await fetch(`/api/admin/communication/messages/${message.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: !message.isArchived }),
      });
      if (response.ok) await refreshData();
    } catch (error) {
      console.error('Failed to archive message:', error);
    }
  };

  const handleDelete = async (message: ContactMessage) => {
    if (!message.id) return;
    try {
      const response = await fetch(`/api/admin/communication/messages/${message.id}`, { method: 'DELETE' });
      if (response.ok) {
        setDeleteTarget(null);
        await refreshData();
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch =
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'read': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'replied': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'read': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'replied': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-white/5 text-muted-foreground border-white/10';
    }
  };

  if (messagesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Mail className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Communication Panel</h1>
              <p className="text-sm text-muted-foreground">Manage contact messages and communications</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-cyan-400">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Messages</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: Mail, label: 'Total', value: stats.total, color: 'text-cyan-400', border: 'border-cyan-500/20' },
          { icon: AlertCircle, label: 'Unread', value: stats.unread, color: 'text-orange-400', border: 'border-orange-500/20' },
          { icon: Eye, label: 'Read', value: stats.read, color: 'text-blue-400', border: 'border-blue-500/20' },
          { icon: CheckCircle, label: 'Replied', value: stats.replied, color: 'text-green-400', border: 'border-green-500/20' },
          { icon: Archive, label: 'Archived', value: stats.archived, color: 'text-purple-400', border: 'border-purple-500/20' },
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

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 w-full">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 w-full"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="h-10 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="all" className="bg-slate-900">All Messages</option>
            <option value="unread" className="bg-slate-900">Unread</option>
            <option value="read" className="bg-slate-900">Read</option>
            <option value="replied" className="bg-slate-900">Replied</option>
            <option value="archived" className="bg-slate-900">Archived</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12 bg-black/20 border border-white/5 rounded-2xl">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">No messages found</h3>
            <p className="text-muted-foreground">Messages will appear here when visitors contact you.</p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-black/20 rounded-xl border transition-all cursor-pointer ${
                selectedMessage?.id === message.id
                  ? 'border-cyan-500/50 bg-white/5'
                  : 'border-white/5 hover:border-white/10'
              } ${message.status === 'unread' ? 'ring-1 ring-orange-500/30' : ''}`}
              onClick={() => setSelectedMessage(selectedMessage?.id === message.id ? null : message)}
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-cyan-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{message.name}</h3>
                      <p className="text-sm text-muted-foreground">{message.email}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {getStatusIcon(message.status)}
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(message.status)}`}>
                          {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                        </span>
                        {message.isArchived && (
                          <span className="px-2 py-0.5 rounded-full text-xs border bg-purple-500/10 text-purple-400 border-purple-500/20">
                            Archived
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <div className="text-sm text-muted-foreground">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 mt-2 justify-start sm:justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(message); }}
                        className="h-8 w-8 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10"
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); handleArchive(message); }}
                        className="h-8 w-8 text-muted-foreground hover:text-purple-400 hover:bg-purple-500/10"
                        title={message.isArchived ? "Unarchive" : "Archive"}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(message); }}
                        className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <h4 className="text-white font-medium mb-1">{message.subject}</h4>
                  <p className="text-muted-foreground line-clamp-2 text-sm">{message.message}</p>
                </div>

                <AnimatePresence>
                  {selectedMessage?.id === message.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/5 pt-4 mt-4"
                    >
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-white mb-2">Full Message</h5>
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <p className="text-white/80 whitespace-pre-wrap text-sm">{message.message}</p>
                          </div>
                        </div>

                        {message.reply ? (
                          <div>
                            <h5 className="text-sm font-medium text-white mb-2">Your Reply</h5>
                            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                              <p className="text-green-400 whitespace-pre-wrap text-sm">{message.reply}</p>
                              {message.repliedAt && (
                                <div className="text-xs text-green-500/70 mt-2">
                                  Replied on {new Date(message.repliedAt).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              onClick={(e) => { e.stopPropagation(); setIsReplying(!isReplying); }}
                              className="bg-cyan-600 hover:bg-cyan-700 text-white"
                            >
                              <Reply className="w-4 h-4 mr-2" />
                              {isReplying ? 'Cancel Reply' : 'Reply'}
                            </Button>
                          </div>
                        )}

                        <AnimatePresence>
                          {isReplying && !message.reply && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-4"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Textarea
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Type your reply..."
                                className="w-full h-32 bg-white/5 border-white/10 text-white"
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleReply(message)}
                                  disabled={!replyMessage.trim() || replyingId === message.id}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {replyingId === message.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                  Send Reply
                                </Button>
                                <Button
                                  variant="ghost"
                                  onClick={() => { setIsReplying(false); setReplyMessage(''); }}
                                  className="text-muted-foreground hover:text-white"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <DeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete Message"
        description={`Are you sure you want to delete the message from ${deleteTarget?.name}? This action cannot be undone.`}
      />
    </div>
  );
}