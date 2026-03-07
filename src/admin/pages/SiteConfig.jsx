/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SiteConfig Page
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * CMS page for managing site-wide configuration
 * - Navbar: logo, links, CTA, behavior
 * - Footer: logo, social links, columns, copyright, newsletter
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import useCmsConfig from '@/admin/hooks/useCmsConfig';
import NavbarConfig from '@/admin/components/cms/NavbarConfig';
import FooterConfig from '@/admin/components/cms/FooterConfig';

// Default navbar values matching frontend Navbar.tsx
const DEFAULT_NAVBAR = {
  logoUrl: '',
  siteName: 'AskJai',
  tagline: 'AI Prompt Generator',
  navLinks: [
    { id: '1', label: 'Features', url: '#features', isExternal: false, isVisible: true },
    { id: '2', label: 'How It Works', url: '#how-it-works', isExternal: false, isVisible: true },
    { id: '3', label: 'Templates', url: '#templates', isExternal: false, isVisible: true },
    { id: '4', label: 'Pricing', url: '#pricing', isExternal: false, isVisible: true },
  ],
  ctaText: 'Get Started',
  ctaUrl: '/auth?mode=signup',
  ctaVisible: true,
  ctaStyle: 'primary',
  stickyNavbar: true,
  transparentOnHero: true,
};

// Default footer values matching frontend Footer.tsx
const DEFAULT_FOOTER = {
  footerLogoUrl: '',
  footerTagline: 'AI prompt engineering, simplified.',
  social: {
    twitter: { url: '', visible: false },
    linkedin: { url: '', visible: false },
    github: { url: '', visible: false },
    instagram: { url: '', visible: false },
    youtube: { url: '', visible: false },
  },
  columns: [
    {
      id: '1',
      title: 'Product',
      links: [
        { id: '1-1', label: 'Features', url: '#features' },
        { id: '1-2', label: 'Pricing', url: '#pricing' },
        { id: '1-3', label: 'Templates', url: '#templates' },
      ],
    },
    {
      id: '2',
      title: 'Company',
      links: [
        { id: '2-1', label: 'About', url: '/about' },
        { id: '2-2', label: 'Blog', url: '/blogs' },
        { id: '2-3', label: 'Contact', url: '/contact' },
      ],
    },
    {
      id: '3',
      title: 'Legal',
      links: [
        { id: '3-1', label: 'Privacy', url: '/terms?tab=privacy' },
        { id: '3-2', label: 'Terms', url: '/terms' },
      ],
    },
  ],
  copyrightText: '© 2026 AskJai. All rights reserved.',
  showNewsletter: false,
  newsletterPlaceholder: 'Enter your email',
};

export function SiteConfig() {
  const { data: navData, loading: navLoading, saving: navSaving, save: saveNav } = useCmsConfig('navbar');
  const { data: footerData, loading: footerLoading, saving: footerSaving, save: saveFooter } = useCmsConfig('footer');
  
  const [activeTab, setActiveTab] = useState('navbar');
  const [navbarConfig, setNavbarConfig] = useState(DEFAULT_NAVBAR);
  const [footerConfig, setFooterConfig] = useState(DEFAULT_FOOTER);

  // Load navbar data
  useEffect(() => {
    if (navData && Object.keys(navData).length > 0) {
      setNavbarConfig({ ...DEFAULT_NAVBAR, ...navData });
    }
  }, [navData]);

  // Load footer data
  useEffect(() => {
    if (footerData && Object.keys(footerData).length > 0) {
      setFooterConfig({ ...DEFAULT_FOOTER, ...footerData });
    }
  }, [footerData]);

  const handleSave = async () => {
    if (activeTab === 'navbar') {
      await saveNav(navbarConfig);
    } else {
      await saveFooter(footerConfig);
    }
  };

  const loading = navLoading || footerLoading;
  const saving = navSaving || footerSaving;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Site Configuration</h1>
          <p className="text-gray-400 text-sm">
            Configure your website's navigation and footer
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700"
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger
            value="navbar"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            Navbar
          </TabsTrigger>
          <TabsTrigger
            value="footer"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            Footer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="navbar" className="mt-6">
          <NavbarConfig
            config={navbarConfig}
            onChange={setNavbarConfig}
          />
        </TabsContent>

        <TabsContent value="footer" className="mt-6">
          <FooterConfig
            config={footerConfig}
            onChange={setFooterConfig}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SiteConfig;
