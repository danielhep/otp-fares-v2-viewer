export default function Header() {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-6 text-slate-100">
        <h1 className="text-2xl font-semibold">OTP Fare Viewer</h1>
        <p className="text-sm text-slate-400">Debug tool for OTP fare product analysis</p>
      </div>
    </header>
  )
}

