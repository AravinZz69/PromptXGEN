import { useState, useEffect } from "react";
import { ChevronDown, HelpCircle, Loader2 } from "lucide-react";
import { faqItems as defaultFaqItems } from "@/data/faqData";
import { useInView } from "@/hooks/useInView";
import { supabase } from "@/lib/supabase";

interface FAQItemData {
  id: string | number;
  question: string;
  answer: string;
  category: string;
  isVisible?: boolean;
}

export const ContactFAQ = () => {
  const [headerRef, headerInView] = useInView<HTMLDivElement>({ threshold: 0.1, triggerOnce: true });
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqItems, setFaqItems] = useState<FAQItemData[]>(defaultFaqItems);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const { data, error } = await supabase
          .from('cms_config')
          .select('data')
          .eq('section', 'faq')
          .maybeSingle();

        if (error) throw error;
        if (data?.data?.faqs) {
          const visibleFaqs = data.data.faqs.filter((f: FAQItemData) => f.isVisible !== false);
          if (visibleFaqs.length > 0) {
            setFaqItems(visibleFaqs);
          }
        }
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        // Keep default FAQs on error
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section-padding bg-card/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div 
          ref={headerRef}
          className={`text-center mb-12 transition-all duration-700 ${
            headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
            <HelpCircle className="w-4 h-4" />
            <span>FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find quick answers to common questions about AskJai, pricing, 
            and features.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            faqItems.map((item, index) => (
              <FAQItem
                key={item.id}
                item={item}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => toggleAccordion(index)}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

interface FAQItemProps {
  item: FAQItemData;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem = ({ item, index, isOpen, onToggle }: FAQItemProps) => {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1, triggerOnce: true });

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 50}ms` }}
      className={`mb-4 transition-all duration-500 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div
        className={`glass-card rounded-xl overflow-hidden transition-all ${
          isOpen ? 'border-primary/40' : ''
        }`}
      >
        {/* Question Button */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-card/50 transition-colors"
        >
          <span className="font-medium text-foreground pr-4">{item.question}</span>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Answer Panel */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isOpen ? 'max-h-96' : 'max-h-0'
          }`}
        >
          <div className="px-5 pb-5 pt-0">
            <div className="h-px bg-border/50 mb-4" />
            <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
            <span className="inline-block mt-3 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
              {item.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
