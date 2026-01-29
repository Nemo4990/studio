import { SignupForm } from '@/components/auth/signup-form';
import { LogoWithText } from '@/components/logo';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="mb-8">
        <Link href="/">
          <LogoWithText />
        </Link>
      </div>
      <SignupForm />
    </div>
  );
}
