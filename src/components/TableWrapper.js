export default function TableWrapper({ children, className = "" }) {
  return (
    <div className={`w-full overflow-auto rounded-2xl border border-white/10 bg-[#211309] ${className}`}>
      <div className="min-w-[600px]">
        {children}
      </div>
    </div>
  );
}
