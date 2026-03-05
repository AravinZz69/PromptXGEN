import { useState } from "react";
import { Send, Loader2, Check, AlertCircle } from "lucide-react";
import { contactTypes } from "@/data/faqData";
import { useInView } from "@/hooks/useInView";
import { supabase } from "@/lib/supabase";

interface FormData {
  name: string;
  email: string;
  contactType: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  contactType?: string;
  subject?: string;
  message?: string;
}

export const ContactForm = () => {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1, triggerOnce: true });
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    contactType: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.contactType) {
      newErrors.contactType = "Please select a contact type";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setStatus("loading");
    
    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      // Determine priority based on contact type
      const priorityMap: Record<string, string> = {
        'technical': 'High',
        'billing': 'High',
        'account': 'Medium',
        'general': 'Low',
        'partnership': 'Medium',
        'feedback': 'Low'
      };
      
      // Create the initial message
      const initialMessage = {
        sender: 'user',
        text: `[${formData.contactType.toUpperCase()}] ${formData.message}\n\nFrom: ${formData.name} (${formData.email})`,
        timestamp: new Date().toISOString()
      };
      
      // Insert into support_tickets table
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user?.id || null,
          user_email: formData.email,
          subject: `[${formData.contactType}] ${formData.subject}`,
          priority: priorityMap[formData.contactType] || 'Medium',
          status: 'Open',
          messages: [initialMessage]
        });
      
      if (error) {
        console.error('Error creating support ticket:', error);
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
        return;
      }
      
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        contactType: "",
        subject: "",
        message: ""
      });
      
      // Reset status after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div
      ref={ref}
      className={`glass-card rounded-2xl p-6 sm:p-8 transition-all duration-700 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <h2 className="text-xl font-display font-semibold text-foreground mb-6">
        Send us a Message
      </h2>

      {status === "success" ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">
            Message Sent!
          </h3>
          <p className="text-muted-foreground">
            We'll get back to you within 24-48 hours.
          </p>
        </div>
      ) : status === "error" ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">
            Something went wrong
          </h3>
          <p className="text-muted-foreground">
            Please try again or contact us directly at support@askjai.com
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name & Email Row */}
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={status === "loading"}
                placeholder="John Doe"
                className={`w-full px-4 py-3 bg-background/50 border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50 ${
                  errors.name ? 'border-red-500' : 'border-border/50'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={status === "loading"}
                placeholder="john@example.com"
                className={`w-full px-4 py-3 bg-background/50 border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50 ${
                  errors.email ? 'border-red-500' : 'border-border/50'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Contact Type */}
          <div>
            <label htmlFor="contactType" className="block text-sm font-medium text-foreground mb-2">
              What can we help you with?
            </label>
            <select
              id="contactType"
              name="contactType"
              value={formData.contactType}
              onChange={handleChange}
              disabled={status === "loading"}
              className={`w-full px-4 py-3 bg-background/50 border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50 ${
                errors.contactType ? 'border-red-500' : 'border-border/50'
              } ${!formData.contactType ? 'text-muted-foreground' : ''}`}
            >
              <option value="">Select a topic</option>
              {contactTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.contactType && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.contactType}
              </p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              disabled={status === "loading"}
              placeholder="Brief description of your inquiry"
              className={`w-full px-4 py-3 bg-background/50 border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50 ${
                errors.subject ? 'border-red-500' : 'border-border/50'
              }`}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.subject}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              disabled={status === "loading"}
              placeholder="Tell us more about how we can help..."
              rows={5}
              className={`w-full px-4 py-3 bg-background/50 border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none disabled:opacity-50 ${
                errors.message ? 'border-red-500' : 'border-border/50'
              }`}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background transition-all disabled:opacity-50"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
