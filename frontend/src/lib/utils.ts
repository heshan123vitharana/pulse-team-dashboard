import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to conditionally join Tailwind classes without conflicts.
 * Required by every Shadcn UI component that uses cn().
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
