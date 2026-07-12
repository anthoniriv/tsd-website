"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:border-brand hover:text-brand"
    >
      <Printer className="h-4 w-4" />
      {label}
    </button>
  );
}
