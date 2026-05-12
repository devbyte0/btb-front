import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 hidden border-t border-white/[0.06] bg-[#120903]/80 backdrop-blur-xl md:block">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-center text-sm text-[#d5baa0] md:flex-row md:px-8 md:text-left">
        <div className="flex items-center gap-2">
          <Image
            src="/btb-logo.png"
            alt="BTB logo"
            width={28}
            height={28}
            className="rounded-full bg-white object-cover p-0.5 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#f39b45]/20"
          />
          <p>© {new Date().getFullYear()} Barista Training Bangladesh.</p>
        </div>
        <p className="tracking-wide text-[#e8c9a5]">Learn. Brew. Create. Inspire.</p>
        <p className="text-xs text-[#a09080]">
          Developed by{" "}
          <a href="https://rezatahseen.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-[#f39b45] hover:underline">REZA TAHSEEN</a>
        </p>
      </div>
    </footer>
  );
}
