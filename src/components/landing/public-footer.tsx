import Link from 'next/link';
import { LogoWithText } from '@/components/logo';

export default function PublicFooter() {
  return (
    <footer className="bg-secondary">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
                <LogoWithText />
                <p className="text-sm text-foreground/60 mt-4">
                    Complete tasks, earn crypto rewards.
                </p>
            </div>
            <div>
                <h4 className="font-headline font-semibold">Product</h4>
                <ul className="mt-4 space-y-2 text-sm">
                    <li><Link href="/#features" className="text-foreground/60 hover:text-foreground">How It Works</Link></li>
                    <li><Link href="/features" className="text-foreground/60 hover:text-foreground">Partners</Link></li>
                    <li><Link href="/#testimonials" className="text-foreground/60 hover:text-foreground">Testimonials</Link></li>
                    <li><Link href="/login" className="text-foreground/60 hover:text-foreground">Login</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-headline font-semibold">Company</h4>
                <ul className="mt-4 space-y-2 text-sm">
                    <li><a href="#" className="text-foreground/60 hover:text-foreground">About Us</a></li>
                    <li><a href="#" className="text-foreground/60 hover:text-foreground">Careers</a></li>
                    <li><a href="#" className="text-foreground/60 hover:text-foreground">Contact</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-headline font-semibold">Legal</h4>
                <ul className="mt-4 space-y-2 text-sm">
                    <li><a href="#" className="text-foreground/60 hover:text-foreground">Privacy Policy</a></li>
                    <li><a href="#" className="text-foreground/60 hover:text-foreground">Terms of Service</a></li>
                </ul>
            </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-foreground/60">
            <p>&copy; {new Date().getFullYear()} TaskVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
