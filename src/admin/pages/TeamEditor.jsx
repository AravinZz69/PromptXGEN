/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * TeamEditor Page
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * CMS page for managing team members
 * - Grid of team member cards
 * - Add/edit/delete members via dialog
 * - Avatar, name, role, bio, social links
 * - Display order and visibility
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Linkedin, Twitter, Github } from 'lucide-react';
import useCmsConfig from '@/admin/hooks/useCmsConfig';
import TeamMemberDialog from '@/admin/components/cms/TeamMemberDialog';

const DEFAULT_TEAM = {
  members: [
    {
      id: '1',
      name: 'Jane Doe',
      role: 'CEO & Founder',
      bio: 'Passionate about AI and innovation',
      avatar: '',
      linkedinUrl: '',
      twitterUrl: '',
      githubUrl: '',
      displayOrder: 1,
      isVisible: true,
    },
    {
      id: '2',
      name: 'John Smith',
      role: 'CTO',
      bio: 'Tech enthusiast and problem solver',
      avatar: '',
      linkedinUrl: '',
      twitterUrl: '',
      githubUrl: '',
      displayOrder: 2,
      isVisible: true,
    },
  ],
};

export function TeamEditor() {
  const { data, loading, saving, save } = useCmsConfig('team');
  const [members, setMembers] = useState(DEFAULT_TEAM.members);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (data && data.members) {
      // Sort by displayOrder
      const sorted = [...data.members].sort((a, b) => a.displayOrder - b.displayOrder);
      setMembers(sorted);
    }
  }, [data]);

  const handleSave = async () => {
    await save({ members });
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setDialogOpen(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setDialogOpen(true);
  };

  const handleSaveMember = (memberData) => {
    if (editingMember) {
      // Update existing
      setMembers((prev) =>
        prev.map((m) => (m.id === memberData.id ? memberData : m))
      );
    } else {
      // Add new
      setMembers((prev) => [...prev, memberData]);
    }
  };

  const handleDeleteMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setDeleteId(null);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Editor</h1>
          <p className="text-muted-foreground text-sm">
            Manage your team members and their profiles
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleAddMember}
            variant="outline"
            className="border-border text-muted-foreground hover:bg-muted gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      {/* Team members grid */}
      {members.length === 0 ? (
        <div className="bg-muted border border-border rounded-xl p-12 text-center">
          <div className="max-w-sm mx-auto space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Plus className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No team members yet</h3>
            <p className="text-muted-foreground text-sm">
              Add your first team member to showcase your amazing team.
            </p>
            <Button
              onClick={handleAddMember}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Member
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-muted border border-border rounded-xl p-6 space-y-4 relative group hover:border-border transition-colors"
            >
              {/* Visibility indicator */}
              <div className="absolute top-4 right-4">
                {member.isVisible ? (
                  <Eye className="w-4 h-4 text-green-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-600" />
                )}
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground border-2 border-border">
                    {getInitials(member.name || 'NA')}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-primary">{member.role}</p>
                {member.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{member.bio}</p>
                )}
              </div>

              {/* Social Links */}
              {(member.linkedinUrl || member.twitterUrl || member.githubUrl) && (
                <div className="flex items-center justify-center gap-2">
                  {member.linkedinUrl && (
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <Linkedin className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  {member.twitterUrl && (
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <Twitter className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  {member.githubUrl && (
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <Github className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditMember(member)}
                  className="flex-1 border-border text-muted-foreground hover:bg-muted gap-2"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteId(member.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Display order badge */}
              <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
                Order: {member.displayOrder}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <TeamMemberDialog
        member={editingMember}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveMember}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-muted border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Team Member?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently remove this team member from your website. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted text-muted-foreground border-border hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteMember(deleteId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TeamEditor;
