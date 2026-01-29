import PublicFooter from '@/components/landing/public-footer';
import PublicHeader from '@/components/landing/public-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        <section className="bg-secondary py-20 text-center md:py-32">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Get in Touch
              </h1>
              <p className="mt-6 text-lg leading-8 text-foreground/70">
                Have questions, feedback, or a partnership inquiry? We&apos;d love to hear from you.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <Card className="mx-auto max-w-xl">
                <CardHeader>
                    <CardTitle className="font-headline">Contact Us</CardTitle>
                    <CardDescription>Fill out the form below and we&apos;ll get back to you as soon as possible.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="Your Name" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="your@email.com" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="What is your message about?" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" placeholder="Your message here..." rows={6} />
                    </div>
                     <Button className="w-full">Send Message</Button>
                </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
