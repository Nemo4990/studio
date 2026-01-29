import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center size-10 bg-primary rounded-md', className)}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6 text-primary-foreground"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    </div>
  );
}

export function LogoWithText({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Logo />
            <span className="font-headline text-lg font-bold text-foreground">TaskVerse</span>
        </div>
    )
}
