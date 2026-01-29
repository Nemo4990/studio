import PublicFooter from '@/components/landing/public-footer';
import PublicHeader from '@/components/landing/public-header';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 py-20 md:py-32">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-headline text-4xl font-bold">Privacy Policy</h1>
          <p className="mt-2 text-lg text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="mt-8 space-y-6 text-foreground/80">
            <div className="space-y-2">
                <h2 className="font-headline text-2xl font-bold">1. Introduction</h2>
                <p>Welcome to TaskVerse. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>
            </div>
            
            <div className="space-y-2">
                <h2 className="font-headline text-2xl font-bold">2. Information We Collect</h2>
                <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
                <ul className="list-disc space-y-1 pl-8">
                  <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, that you voluntarily give to us when you register with the application.</li>
                  <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
                </ul>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-2xl font-bold">3. Use of Your Information</h2>
                <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
                <ul className="list-disc space-y-1 pl-8">
                    <li>Create and manage your account.</li>
                    <li>Email you regarding your account or order.</li>
                    <li>Enable user-to-user communications.</li>
                    <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                </ul>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-2xl font-bold">4. Disclosure of Your Information</h2>
                <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
                <ul className="list-disc space-y-1 pl-8">
                    <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                    <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including data analysis, email delivery, hosting services, and customer service.</li>
                </ul>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-2xl font-bold">5. Security of Your Information</h2>
                <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-2xl font-bold">Contact Us</h2>
                <p>If you have questions or comments about this Privacy Policy, please contact us at: privacy@taskverse.io</p>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
