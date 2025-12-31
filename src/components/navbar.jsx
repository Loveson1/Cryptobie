export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center font-bold">₿</div>
            <div>
              <h1 className="font-black text-sm text-white">Cryptobie</h1>
              
            </div>
          </div>
          
          {/* Search */}
          <div className="flex-1 max-w-xs">
            <input 
              type="search" 
              placeholder="Search..." 
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Button */}
          <button className="btn-primary text-xs shrink-0 ">Sign In</button>
        </div>
      </div>
    </nav>
  );
}
