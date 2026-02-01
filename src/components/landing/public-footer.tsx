import Link from 'next/link';
import { LogoWithText } from '@/components/logo';

export default function PublicFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
                <LogoWithText />
                <p className="text-sm text-muted-foreground mt-4">
                    Complete tasks, earn crypto rewards.
                </p>
            </div>
            <div>
                <h4 className="font-headline font-semibold">Product</h4>
                <ul className="mt-4 space-y-2 text-sm">
                    <li><Link href="/#features" className="text-muted-foreground hover:text-foreground">Features</Link></li>
                    <li><Link href="/features" className="text-muted-foreground hover:text-foreground">Partners</Link></li>
                    <li><Link href="/login" className="text-muted-foreground hover:text-foreground">Login</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-headline font-semibold">Company</h4>
                <ul className="mt-4 space-y-2 text-sm">
                    <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
                    <li><Link href="/careers" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
                    <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-headline font-semibold">Legal</h4>
                <ul className="mt-4 space-y-2 text-sm">
                    <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                    <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                </ul>
            </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} TaskVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
