'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  MoreHorizontal
} from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import type { ContactMessage } from '@/lib/types/admin';

interface CommunicationStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
  archived: number;
}

export default function CommunicationPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<CommunicationStats>({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        if (filter === 'archived') {
          params.append('isArchived', 'true');
        } else {
          params.append('status', filter);
        }
      }

      const response = await fetch(`/api/admin/communication/messages?${params}`);
      const result = await response.json();

      if (result.success) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/communication/stats');
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMessages(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, [filter]);

  const handleMarkAsRead = async (message: ContactMessage) => {
    if (!message.id) {
      console.error('Message ID is missing:', message);
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/communication/messages/${message.id}/read`, {
        method: 'PUT',
      });

      if (response.ok) {
        await Promise.all([fetchMessages(), fetchStats()]);
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleReply = async (message: ContactMessage) => {
    if (!replyMessage.trim()) return;
    if (!message.id) {
      console.error('Message ID is missing:', message);
      return;
    }

    try {
      const response = await fetch(`/api/admin/communication/messages/${message.id}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reply: replyMessage }),
      });

      if (response.ok) {
        setReplyMessage('');
        setIsReplying(false);
        setSelectedMessage(null);
        await Promise.all([fetchMessages(), fetchStats()]);
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
  };

  const handleArchive = async (message: ContactMessage) => {
    if (!message.id) {
      console.error('Message ID is missing:', message);
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/communication/messages/${message.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isArchived: !message.isArchived }),
      });

      if (response.ok) {
        await Promise.all([fetchMessages(), fetchStats()]);
      }
    } catch (error) {
      console.error('Failed to archive message:', error);
    }
  };

  const handleDelete = async (message: ContactMessage) => {
    if (!message.id) {
      console.error('Message ID is missing:', message);
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/communication/messages/${message.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteTarget(null);
        await Promise.all([fetchMessages(), fetchStats()]);
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
      case 'unread':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'read':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'replied':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'read':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'replied':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Communication Panel</h1>
          <p className="text-gray-400">Manage contact messages and communications</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-cyan-400">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Messages</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center gap-3">
            <Mail className="w-8 h-8 text-cyan-500" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-gray-400">Total</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-orange-500" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.unread}</div>
              <div className="text-sm text-gray-400">Unread</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.read}</div>
              <div className="text-sm text-gray-400">Read</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.replied}</div>
              <div className="text-sm text-gray-400">Replied</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center gap-3">
            <Archive className="w-8 h-8 text-purple-500" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.archived}</div>
              <div className="text-sm text-gray-400">Archived</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No messages found</h3>
            <p className="text-gray-500">Messages will appear here when visitors contact you.</p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gray-800/50 rounded-lg border transition-all cursor-pointer ${
                selectedMessage?.id === message.id
                  ? 'border-cyan-500 bg-gray-800/70'
                  : 'border-gray-700 hover:border-gray-600'
              } ${message.status === 'unread' ? 'ring-1 ring-orange-500/30' : ''}`}
              onClick={() => setSelectedMessage(selectedMessage?.id === message.id ? null : message)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{message.name}</h3>
                      <p className="text-gray-400">{message.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(message.status)}
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(message.status)}`}>
                          {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                        </span>
                        {message.isArchived && (
                          <span className="px-2 py-1 rounded-full text-xs border bg-purple-500/20 text-purple-300 border-purple-500/30">
                            Archived
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(message);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(message);
                        }}
                        className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                        title={message.isArchived ? "Unarchive" : "Archive"}
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(message);
                        }}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">{message.subject}</h4>
                  <p className="text-gray-300 line-clamp-2">{message.message}</p>
                </div>

                <AnimatePresence>
                  {selectedMessage?.id === message.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-700 pt-4 mt-4"
                    >
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-white font-medium mb-2">Full Message</h5>
                          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                            <p className="text-gray-300 whitespace-pre-wrap">{message.message}</p>
                          </div>
                        </div>

                        {message.reply && (
                          <div>
                            <h5 className="text-white font-medium mb-2">Your Reply</h5>
                            <div className="bg-green-900/20 rounded-lg p-4 border border-green-600/30">
                              <p className="text-green-300 whitespace-pre-wrap">{message.reply}</p>
                              {message.repliedAt && (
                                <div className="text-xs text-green-400 mt-2">
                                  Replied on {new Date(message.repliedAt).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {!message.reply && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setIsReplying(!isReplying)}
                              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                            >
                              <Reply className="w-4 h-4" />
                              {isReplying ? 'Cancel Reply' : 'Reply'}
                            </button>
                          </div>
                        )}

                        <AnimatePresence>
                          {isReplying && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-4"
                            >
                              <textarea
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Type your reply..."
                                className="w-full h-32 px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 resize-none"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReply(message)}
                                  disabled={!replyMessage.trim()}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Send Reply
                                </button>
                                <button
                                  onClick={() => {
                                    setIsReplying(false);
                                    setReplyMessage('');
                                  }}
                                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
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

      {/* Delete Confirmation Dialog */}
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