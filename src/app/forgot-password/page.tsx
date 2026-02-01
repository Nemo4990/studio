import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { LogoWithText } from '@/components/logo';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="mb-8">
        <Link href="/">
          <LogoWithText />
        </Link>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
