import { useEffect } from "react";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/landing/Footer";
import { ContactHero, ContactForm, ContactInfo, ContactFAQ } from "@/components/contact";

const ContactUs = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <MiniNavbar />
      
      {/* Hero */}
      <ContactHero />

      {/* FAQ Section */}
      <ContactFAQ />
      
      {/* Main Content - Form & Info */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-5">
            <ContactInfo />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
