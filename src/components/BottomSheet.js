"use client";

import { useEffect } from "react";

export default function BottomSheet({ open, onClose, children, title }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
      <div className="modal-backdrop fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-h-[85vh] overflow-auto rounded-t-3xl bg-[#1a1009] p-5 pb-8 shadow-2xl md:max-w-md md:rounded-3xl md:pb-5">
        {/* Handle bar */}
        <div className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-white/20 md:hidden" />
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-black text-[#fff0df]">{title}</h3>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20">&times;</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
