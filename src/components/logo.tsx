import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center size-10 bg-primary rounded-md', className)}>
      <span className="font-headline text-2xl font-bold text-primary-foreground">
        N
      </span>
    </div>
  );
}

export function LogoWithText({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Logo />
            <span className="font-headline text-lg font-bold text-foreground">NovaChain Nexus</span>
        </div>
    )
}
