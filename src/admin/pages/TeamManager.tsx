/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Team Manager - Admin Page
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Manage team members and company values:
 * - Add/edit/remove team members
 * - Reorder display order
 * - Manage company values
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  ArrowLeft,
  Users,
  ArrowUp,
  ArrowDown,
  Github,
  Linkedin,
  Twitter,
  Heart,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  avatar: string | null;
  social_twitter: string | null;
  social_linkedin: string | null;
  social_github: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CompanyValue {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function TeamManager() {
  const { toast } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<'members' | 'values'>('members');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [values, setValues] = useState<CompanyValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'list' | 'edit'>('list');
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editingValue, setEditingValue] = useState<CompanyValue | null>(null);
  const [deleteMember, setDeleteMember] = useState<TeamMember | null>(null);
  const [deleteValue, setDeleteValue] = useState<CompanyValue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Member form
  const [memberForm, setMemberForm] = useState({
    name: '',
    role: '',
    bio: '',
    avatar: '',
    social_twitter: '',
    social_linkedin: '',
    social_github: '',
    is_active: true,
  });

  // Value form
  const [valueForm, setValueForm] = useState({
    title: '',
    description: '',
    icon: '',
    is_active: true,
  });

  // ───────────────────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ───────────────────────────────────────────────────────────────────────────

  const fetchData = async () => {
    try {
      setLoading(true);

      const [membersRes, valuesRes] = await Promise.all([
        supabase
          .from('team_members')
          .select('*')
          .order('display_order', { ascending: true }),
        supabase
          .from('company_values')
          .select('*')
          .order('display_order', { ascending: true }),
      ]);

      if (membersRes.error) throw membersRes.error;
      if (valuesRes.error) throw valuesRes.error;

      setMembers(membersRes.data || []);
      setValues(valuesRes.data || []);
    } catch (error: any) {
      toast({
        title: '❌ Error loading data',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // TEAM MEMBER CRUD
  // ───────────────────────────────────────────────────────────────────────────

  const handleCreateMember = () => {
    setMemberForm({
      name: '',
      role: '',
      bio: '',
      avatar: '',
      social_twitter: '',
      social_linkedin: '',
      social_github: '',
      is_active: true,
    });
    setEditingMember(null);
    setMode('edit');
  };

  const handleEditMember = (member: TeamMember) => {
    setMemberForm({
      name: member.name,
      role: member.role || '',
      bio: member.bio || '',
      avatar: member.avatar || '',
      social_twitter: member.social_twitter || '',
      social_linkedin: member.social_linkedin || '',
      social_github: member.social_github || '',
      is_active: member.is_active,
    });
    setEditingMember(member);
    setMode('edit');
  };

  const handleSaveMember = async () => {
    if (!memberForm.name) {
      toast({
        title: '⚠️ Name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      const data = {
        name: memberForm.name,
        role: memberForm.role,
        bio: memberForm.bio,
        avatar: memberForm.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${memberForm.name.replace(/\s/g, '')}&backgroundColor=6366f1`,
        social_twitter: memberForm.social_twitter || null,
        social_linkedin: memberForm.social_linkedin || null,
        social_github: memberForm.social_github || null,
        is_active: memberForm.is_active,
        updated_at: new Date().toISOString(),
      };

      if (editingMember) {
        const { error } = await supabase
          .from('team_members')
          .update(data)
          .eq('id', editingMember.id);
        if (error) throw error;
        toast({ title: '✅ Team member updated' });
      } else {
        const maxOrder = Math.max(0, ...members.map((m) => m.display_order));
        const { error } = await supabase.from('team_members').insert([
          { ...data, display_order: maxOrder + 1 },
        ]);
        if (error) throw error;
        toast({ title: '✅ Team member added' });
      }

      await fetchData();
      setMode('list');
    } catch (error: any) {
      toast({
        title: '❌ Error saving member',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!deleteMember) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', deleteMember.id);
      if (error) throw error;

      toast({ title: '✅ Team member deleted' });
      await fetchData();
    } catch (error: any) {
      toast({
        title: '❌ Error deleting member',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteMember(null);
    }
  };

  const toggleMemberActive = async (member: TeamMember) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ is_active: !member.is_active })
        .eq('id', member.id);
      if (error) throw error;
      await fetchData();
    } catch (error: any) {
      toast({
        title: '❌ Error updating member',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const moveMember = async (member: TeamMember, direction: 'up' | 'down') => {
    const currentIndex = members.findIndex((m) => m.id === member.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= members.length) return;

    const swapMember = members[newIndex];

    try {
      await Promise.all([
        supabase
          .from('team_members')
          .update({ display_order: swapMember.display_order })
          .eq('id', member.id),
        supabase
          .from('team_members')
          .update({ display_order: member.display_order })
          .eq('id', swapMember.id),
      ]);
      await fetchData();
    } catch (error: any) {
      toast({
        title: '❌ Error reordering members',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // COMPANY VALUE CRUD
  // ───────────────────────────────────────────────────────────────────────────

  const handleCreateValue = () => {
    setValueForm({
      title: '',
      description: '',
      icon: 'Heart',
      is_active: true,
    });
    setEditingValue(null);
    setMode('edit');
  };

  const handleEditValue = (value: CompanyValue) => {
    setValueForm({
      title: value.title,
      description: value.description || '',
      icon: value.icon || 'Heart',
      is_active: value.is_active,
    });
    setEditingValue(value);
    setMode('edit');
  };

  const handleSaveValue = async () => {
    if (!valueForm.title) {
      toast({
        title: '⚠️ Title is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      const data = {
        title: valueForm.title,
        description: valueForm.description,
        icon: valueForm.icon,
        is_active: valueForm.is_active,
      };

      if (editingValue) {
        const { error } = await supabase
          .from('company_values')
          .update(data)
          .eq('id', editingValue.id);
        if (error) throw error;
        toast({ title: '✅ Company value updated' });
      } else {
        const maxOrder = Math.max(0, ...values.map((v) => v.display_order));
        const { error } = await supabase.from('company_values').insert([
          { ...data, display_order: maxOrder + 1 },
        ]);
        if (error) throw error;
        toast({ title: '✅ Company value added' });
      }

      await fetchData();
      setMode('list');
    } catch (error: any) {
      toast({
        title: '❌ Error saving value',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteValue = async () => {
    if (!deleteValue) return;

    try {
      const { error } = await supabase
        .from('company_values')
        .delete()
        .eq('id', deleteValue.id);
      if (error) throw error;

      toast({ title: '✅ Company value deleted' });
      await fetchData();
    } catch (error: any) {
      toast({
        title: '❌ Error deleting value',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteValue(null);
    }
  };

  // Filter members by search
  const filteredMembers = searchQuery
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.role?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : members;

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER: EDIT VIEW
  // ───────────────────────────────────────────────────────────────────────────

  if (mode === 'edit') {
    const isEditingMember = activeTab === 'members';

    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setMode('list')}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-white">
                {isEditingMember
                  ? editingMember
                    ? 'Edit Team Member'
                    : 'Add Team Member'
                  : editingValue
                  ? 'Edit Company Value'
                  : 'Add Company Value'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setMode('list')}
                className="border-gray-700 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={isEditingMember ? handleSaveMember : handleSaveValue}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-6">
            {isEditingMember ? (
              <>
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={memberForm.name}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="John Doe"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={memberForm.role}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, role: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Frontend Developer"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={memberForm.bio}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, bio: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Short bio about the team member..."
                  />
                </div>

                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    value={memberForm.avatar}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, avatar: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://... (leave empty for auto-generated)"
                  />
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Social Links
                  </label>
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-5 h-5 text-blue-500" />
                    <input
                      type="text"
                      value={memberForm.social_linkedin}
                      onChange={(e) =>
                        setMemberForm({
                          ...memberForm,
                          social_linkedin: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="LinkedIn URL"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Github className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={memberForm.social_github}
                      onChange={(e) =>
                        setMemberForm({
                          ...memberForm,
                          social_github: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="GitHub URL"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Twitter className="w-5 h-5 text-sky-500" />
                    <input
                      type="text"
                      value={memberForm.social_twitter}
                      onChange={(e) =>
                        setMemberForm({
                          ...memberForm,
                          social_twitter: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Twitter URL"
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <Switch
                    checked={memberForm.is_active}
                    onCheckedChange={(checked) =>
                      setMemberForm({ ...memberForm, is_active: checked })
                    }
                  />
                  <span className="text-gray-300">Active (visible on website)</span>
                </div>
              </>
            ) : (
              <>
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={valueForm.title}
                    onChange={(e) =>
                      setValueForm({ ...valueForm, title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Innovation First"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={valueForm.description}
                    onChange={(e) =>
                      setValueForm({ ...valueForm, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Description of this company value..."
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Icon (Lucide icon name)
                  </label>
                  <input
                    type="text"
                    value={valueForm.icon}
                    onChange={(e) =>
                      setValueForm({ ...valueForm, icon: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Heart, Lightbulb, Users, etc."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Use Lucide icon names: Heart, Lightbulb, Trophy, Users, Eye, etc.
                  </p>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <Switch
                    checked={valueForm.is_active}
                    onCheckedChange={(checked) =>
                      setValueForm({ ...valueForm, is_active: checked })
                    }
                  />
                  <span className="text-gray-300">Active (visible on website)</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER: LIST VIEW
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-500" />
              Team Manager
            </h1>
            <p className="text-gray-400 mt-1">
              Manage team members and company values
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'members'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Team Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('values')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'values'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Company Values ({values.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : activeTab === 'members' ? (
          <>
            {/* Search & Add */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <Button
                onClick={handleCreateMember}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>

            {/* Members List */}
            {filteredMembers.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No team members found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className={`bg-gray-900 rounded-xl p-4 border transition-colors ${
                      member.is_active ? 'border-gray-800' : 'border-gray-800/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <img
                        src={member.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${member.name}&backgroundColor=6366f1`}
                        alt={member.name}
                        className="w-14 h-14 rounded-full bg-gray-800"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white">
                          {member.name}
                        </h3>
                        <p className="text-sm text-indigo-400">{member.role}</p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {member.bio}
                        </p>
                      </div>

                      {/* Social Links */}
                      <div className="flex items-center gap-2">
                        {member.social_linkedin && (
                          <a
                            href={member.social_linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-blue-500"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {member.social_github && (
                          <a
                            href={member.social_github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-white"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {member.social_twitter && (
                          <a
                            href={member.social_twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-sky-500"
                          >
                            <Twitter className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      {/* Order Controls */}
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveMember(member, 'up')}
                          disabled={index === 0}
                          className="h-6 w-6 p-0 text-gray-500 hover:text-white"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveMember(member, 'down')}
                          disabled={index === filteredMembers.length - 1}
                          className="h-6 w-6 p-0 text-gray-500 hover:text-white"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={member.is_active}
                          onCheckedChange={() => toggleMemberActive(member)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditMember(member)}
                          className="text-gray-400 hover:text-indigo-400"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteMember(member)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Add Value Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleCreateValue}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Value
              </Button>
            </div>

            {/* Values List */}
            {values.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No company values found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {values.map((value) => (
                  <div
                    key={value.id}
                    className={`bg-gray-900 rounded-xl p-5 border transition-colors ${
                      value.is_active ? 'border-gray-800' : 'border-gray-800/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-indigo-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-white">
                            {value.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-400">{value.description}</p>
                        <p className="text-xs text-gray-600 mt-2">
                          Icon: {value.icon}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditValue(value)}
                          className="text-gray-400 hover:text-indigo-400"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteValue(value)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Member Dialog */}
      <AlertDialog open={!!deleteMember} onOpenChange={() => setDeleteMember(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteMember?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Value Dialog */}
      <AlertDialog open={!!deleteValue} onOpenChange={() => setDeleteValue(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Company Value</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteValue?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteValue}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
