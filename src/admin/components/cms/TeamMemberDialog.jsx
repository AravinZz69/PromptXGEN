/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * TeamMemberDialog Sub-Component
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Modal for adding/editing team members
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Linkedin, Twitter, Github } from 'lucide-react';
import ImageUpload from './ImageUpload';

export function TeamMemberDialog({ member, open, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    role: '',
    bio: '',
    avatar: '',
    linkedinUrl: '',
    twitterUrl: '',
    githubUrl: '',
    displayOrder: 0,
    isVisible: true,
  });

  useEffect(() => {
    if (member) {
      setFormData(member);
    } else {
      // Reset for new member
      setFormData({
        id: Date.now().toString(),
        name: '',
        role: '',
        bio: '',
        avatar: '',
        linkedinUrl: '',
        twitterUrl: '',
        githubUrl: '',
        displayOrder: 0,
        isVisible: true,
      });
    }
  }, [member, open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-muted border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {member ? 'Edit Team Member' : 'Add Team Member'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Avatar */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Avatar
            </label>
            <ImageUpload
              bucket="cms-media"
              filePath="team/"
              currentUrl={formData.avatar}
              onUpload={(url) => handleChange('avatar', url)}
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Doe"
              className="w-full bg-muted border border-border text-white placeholder-muted-foreground rounded-lg px-3 py-2"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Role / Title</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              placeholder="CEO & Founder"
              className="w-full bg-muted border border-border text-white placeholder-muted-foreground rounded-lg px-3 py-2"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Brief bio about this team member..."
              rows={3}
              className="w-full bg-muted border border-border text-white placeholder-muted-foreground rounded-lg px-3 py-2 resize-none"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Social Links</label>
            
            {/* LinkedIn */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Linkedin className="w-5 h-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={formData.linkedinUrl}
                onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="flex-1 bg-muted border border-border text-white placeholder-muted-foreground rounded-lg px-3 py-2"
              />
            </div>

            {/* Twitter */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Twitter className="w-5 h-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={formData.twitterUrl}
                onChange={(e) => handleChange('twitterUrl', e.target.value)}
                placeholder="https://twitter.com/..."
                className="flex-1 bg-muted border border-border text-white placeholder-muted-foreground rounded-lg px-3 py-2"
              />
            </div>

            {/* GitHub */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <Github className="w-5 h-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={formData.githubUrl}
                onChange={(e) => handleChange('githubUrl', e.target.value)}
                placeholder="https://github.com/..."
                className="flex-1 bg-muted border border-border text-white placeholder-muted-foreground rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Display Order</label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => handleChange('displayOrder', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full bg-muted border border-border text-white placeholder-muted-foreground rounded-lg px-3 py-2"
            />
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between py-2">
            <label className="text-sm font-medium text-muted-foreground">
              Visible on website
            </label>
            <Switch
              checked={formData.isVisible}
              onCheckedChange={(val) => handleChange('isVisible', val)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border text-muted-foreground hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary/90"
          >
            Save Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TeamMemberDialog;
