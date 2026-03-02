import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 section-padding py-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">PromptForge</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI prompt engineering, simplified.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#templates" className="hover:text-foreground transition-colors">Templates</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PromptForge. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
