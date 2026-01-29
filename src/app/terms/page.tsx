import PublicFooter from '@/components/landing/public-footer';
import PublicHeader from '@/components/landing/public-header';

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 py-20 md:py-32">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-headline text-4xl font-bold">Terms of Service</h1>
          <p className="mt-2 text-lg text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="mt-8 space-y-6 text-foreground/80">
            <div className="space-y-2">
                <h2 className="font-headline text-2xl font-bold">1. Agreement to Terms</h2>
                <p>By using our services, you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use the services. We may modify the Terms at any time, and such modifications shall be effective immediately upon posting.</p>
            </div>
            
            <div className="space-y-2">
                <h2 className="font-headline text-2xl font-bold">2. User Accounts</h2>
                <p>To use certain features of our service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. We reserve the right to suspend or terminate your account if any information provided during the registration process or thereafter proves to be inaccurate, not current, or incomplete.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-2xl font-bold">3. Tasks and Rewards</h2>
                <p>TaskVerse provides a platform for users to complete tasks in exchange for cryptocurrency rewards. We do not guarantee the availability of tasks or the amount of rewards. Rewards are determined by the task provider and are subject to change. We reserve the right to review all task submissions and to reject any submission that does not meet our quality standards.</p>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-2xl font-bold">4. Prohibited Activities</h2>
                <p>You agree not to engage in any of the following prohibited activities:</p>
                <ul className="list-disc space-y-1 pl-8">
                    <li>Using any automated system, including "robots," "spiders," or "offline readers," to access the service.</li>
                    <li>Attempting to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the service.</li>
                    <li>Taking any action that imposes, or may impose at our sole discretion an unreasonable or disproportionately large load on our infrastructure.</li>
                    <li>Engaging in any fraudulent activity, including creating multiple accounts or submitting false information.</li>
                </ul>
            </div>

            <div className="space-y-2">
                <h2 className="font-headline text-2xl font-bold">5. Termination</h2>
                <p>We may terminate or suspend your access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
            </div>
            
            <div className="space-y-2">
                <h2 className="font-headline text-2xl font-bold">Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us at: legal@taskverse.io</p>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
