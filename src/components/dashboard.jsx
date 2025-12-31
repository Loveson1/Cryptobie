import {Navbar, StatCard, CryptoTable} from "./index"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 w-screen ">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatCard />
        <div className="mt-12">
          <CryptoTable />
        </div>
      </main>
    </div>
  );
}
