import { LoginForm } from '@/components/auth/login-form';
import { LogoWithText } from '@/components/logo';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="mb-8">
        <Link href="/">
          <LogoWithText />
        </Link>
      </div>
      <LoginForm />
    </div>
  );
}
