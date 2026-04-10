import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const titleCase = (text?: string) => {
  if (!text || text.length <= 0) return text;

  const titles = text.toLowerCase().split(" ");
  var result = "";

  titles.forEach((e) => {
    const first = e[0].toUpperCase();
    result += first + (e.length > 1 ? e.slice(1) : "") + " ";
  });

  return result.trim();
};
