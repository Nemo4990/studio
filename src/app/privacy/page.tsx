import PublicFooter from '@/components/landing/public-footer';
import PublicHeader from '@/components/landing/public-header';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        <section className="bg-secondary py-20 text-center md:py-32">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Privacy Policy
              </h1>
              <p className="mt-6 text-lg leading-8 text-foreground/70">
                Your privacy is important to us. We are committed to protecting your personal data.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24">
            <div className="container mx-auto max-w-4xl">
            <p className="mb-8 text-center text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-8 text-lg text-foreground/80">
                <div className="space-y-4">
                    <h2 className="font-headline text-3xl font-bold text-foreground">1. Introduction</h2>
                    <p>Welcome to TaskVerse ("we," "our," or "us"). We are committed to protecting your privacy and handling your data in an open and transparent manner. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application and services (collectively, the "Services").</p>
                </div>
                
                <div className="space-y-4">
                    <h2 className="font-headline text-3xl font-bold text-foreground">2. Information We Collect</h2>
                    <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
                    <ul className="list-disc space-y-2 pl-8">
                        <li>
                            <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and contact details that you voluntarily provide to us when you register for an account or participate in various activities related to the Services.
                        </li>
                        <li>
                            <strong>Financial Data:</strong> Data related to your payment method (e.g., wallet addresses) that we may collect when you perform transactions within the Services. We store only limited, if any, financial information we collect.
                        </li>
                        <li>
                            <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Services, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Services.
                        </li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h2 className="font-headline text-3xl font-bold text-foreground">3. Use of Your Information</h2>
                    <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:</p>
                    <ul className="list-disc space-y-2 pl-8">
                        <li>Create and manage your account.</li>
                        <li>Process transactions and send you related information, including confirmations and invoices.</li>
                        <li>Email you regarding your account, security alerts, and administrative information.</li>
                        <li>Enable user-to-user communications.</li>
                        <li>Monitor and analyze usage and trends to improve your experience with the Services.</li>
                        <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h2 className="font-headline text-3xl font-bold text-foreground">4. Disclosure of Your Information</h2>
                    <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
                    <ul className="list-disc space-y-2 pl-8">
                        <li>
                            <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
                        </li>

                        <li>
                            <strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, and customer service.
                        </li>
                         <li>
                            <strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
                        </li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h2 className="font-headline text-3xl font-bold text-foreground">5. Security of Your Information</h2>
                    <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
                </div>

                <div className="space-y-4">
                    <h2 className="font-headline text-3xl font-bold text-foreground">6. Your Rights</h2>
                    <p>You have certain rights regarding your personal data, including the right to access, correct, or delete your data. You may review or change the information in your account or terminate your account at any time by logging into your account settings.</p>
                </div>


                <div className="space-y-4">
                    <h2 className="font-headline text-3xl font-bold text-foreground">7. Contact Us</h2>
                    <p>If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@taskverse.io" className="text-primary hover:underline">privacy@taskverse.io</a></p>
                </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
