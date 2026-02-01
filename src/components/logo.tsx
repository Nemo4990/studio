import { cn } from '@/lib/utils';
import Image from 'next/image';

/**
 * Renders the application logo as an image.
 * This component now displays the full logo including text.
 * Assumes a logo.png file exists in the /public directory.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Image
        src="/logo.png"
        alt="TaskVerse Logo"
        width={250} // Intrinsic width of the logo image for aspect ratio.
        height={250} // Intrinsic height of the logo image for aspect ratio.
        className={cn('h-12 w-auto', className)} // Default display size is 48px height.
        priority // Logos are usually important for LCP.
    />
  );
}

/**
 * Displays the full application logo. This is the primary logo component
 * used throughout the app.
 */
export function LogoWithText({ className }: { className?: string }) {
    // The parent div is kept to preserve layout from the previous version.
    // The text span is removed because the new logo image includes the "TaskVerse" text.
    return (
        <div className={cn("flex items-center", className)}>
            <Logo />
        </div>
    )
}
