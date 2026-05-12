"use client";

import { useEffect, useState } from "react";
import { popupApi } from "@/lib/api";

const POPUP_SEEN_KEY = "btb_popup_seen";

export default function PopupAd() {
  const [popup, setPopup] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    popupApi.getActive().then((res) => {
      const data = res?.data;
      if (!data) return;
      const seen = sessionStorage.getItem(POPUP_SEEN_KEY);
      if (seen) return;
      setPopup(data);
      setTimeout(() => setShow(true), 800);
    }).catch(() => {});
  }, []);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem(POPUP_SEEN_KEY, "1");
  };

  if (!show || !popup) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div className="modal-backdrop fixed inset-0 bg-black/60" onClick={handleClose} />
      <div className="modal-content relative z-10 w-full max-w-md rounded-3xl bg-white p-0 shadow-2xl overflow-hidden">
        {popup.imageUrl && (
          <div className="h-48 w-full overflow-hidden bg-[#faf8f5]">
            <img src={popup.imageUrl} alt="" className="h-full w-full object-contain bg-[#f5f0eb]" />
          </div>
        )}
        <div className="p-6 pt-5">
          {popup.title && <h2 className="text-2xl font-black text-[#1c1c1e]">{popup.title}</h2>}
          {popup.content && <p className="mt-3 text-sm leading-relaxed text-[#6b6b6b]">{popup.content}</p>}
          <div className="mt-6 flex gap-3">
            {popup.linkUrl && (
              <a href={popup.linkUrl} target="_blank" rel="noopener noreferrer"
                className="btn-primary flex-1 rounded-xl py-3 text-center text-sm font-semibold text-white">
                {popup.linkLabel || "Learn More"}
              </a>
            )}
            <button onClick={handleClose}
              className={`rounded-xl border border-[#1c1c1e]/20 py-3 text-sm font-semibold text-[#6b6b6b] transition-all hover:bg-[#faf8f5] ${popup.linkUrl ? "flex-1" : "w-full"}`}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
