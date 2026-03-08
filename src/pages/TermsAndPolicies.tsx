import { motion } from 'framer-motion';
import { MiniNavbar } from '@/components/ui/mini-navbar';
import Footer from '@/components/landing/Footer';
import { Shield, FileText, Lock, Users, Mail, AlertCircle } from 'lucide-react';

const TermsAndPolicies = () => {
  return (
    <div className="min-h-screen bg-background">
      <MiniNavbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Terms & Policies
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Last updated: March 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-4xl space-y-12">
          
          {/* Terms of Service */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold">Terms of Service</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                By accessing and using PromptXGEN (AskJai), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>
              <h3 className="text-lg font-semibold text-foreground mt-6">1. Use of Service</h3>
              <p>
                You may use our AI prompt generation services for personal and commercial purposes. 
                You agree not to misuse the service or help anyone else do so.
              </p>
              <h3 className="text-lg font-semibold text-foreground mt-6">2. User Accounts</h3>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials 
                and for all activities that occur under your account.
              </p>
              <h3 className="text-lg font-semibold text-foreground mt-6">3. Credits System</h3>
              <p>
                Our service operates on a credit-based system. Credits are deducted for each AI generation. 
                Unused credits do not roll over to the next billing period unless specified in your plan.
              </p>
              <h3 className="text-lg font-semibold text-foreground mt-6">4. Prohibited Uses</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Generating harmful, illegal, or unethical content</li>
                <li>Attempting to bypass security measures or rate limits</li>
                <li>Reselling or redistributing the service without authorization</li>
                <li>Using automated systems to abuse the service</li>
              </ul>
            </div>
          </motion.div>

          {/* Privacy Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Lock className="w-5 h-5 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold">Privacy Policy</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We take your privacy seriously. This policy describes how we collect, use, 
                and protect your personal information.
              </p>
              <h3 className="text-lg font-semibold text-foreground mt-6">Information We Collect</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Account information (name, email, profile details)</li>
                <li>Usage data (prompts generated, features used)</li>
                <li>Technical data (device type, browser, IP address)</li>
              </ul>
              <h3 className="text-lg font-semibold text-foreground mt-6">How We Use Your Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To provide and improve our services</li>
                <li>To personalize your experience</li>
                <li>To communicate important updates</li>
                <li>To ensure security and prevent fraud</li>
              </ul>
              <h3 className="text-lg font-semibold text-foreground mt-6">Data Protection</h3>
              <p>
                We implement industry-standard security measures to protect your data. 
                Your prompts and generated content are encrypted and stored securely.
              </p>
            </div>
          </motion.div>

          {/* Cookie Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold">Cookie Policy</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We use cookies and similar technologies to enhance your experience on our platform.
              </p>
              <h3 className="text-lg font-semibold text-foreground mt-6">Types of Cookies</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential cookies:</strong> Required for the service to function</li>
                <li><strong>Analytics cookies:</strong> Help us understand how you use our service</li>
                <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
              </ul>
            </div>
          </motion.div>

          {/* Refund Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold">Refund Policy</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We want you to be satisfied with our service. Here's our refund policy:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Refund requests must be made within 7 days of purchase</li>
                <li>Unused credits may be eligible for a prorated refund</li>
                <li>Free tier users are not eligible for refunds</li>
                <li>Enterprise plans have custom refund terms</li>
              </ul>
              <p className="mt-4">
                To request a refund, please contact our support team with your account details 
                and reason for the refund request.
              </p>
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl p-8 text-center"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Have Questions?</h2>
            <p className="text-muted-foreground mb-6">
              If you have any questions about our terms and policies, please don't hesitate to reach out.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
          </motion.div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsAndPolicies;
