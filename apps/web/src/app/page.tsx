import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Zap, Target, GitBranch, Key } from "lucide-react";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/workspaces");
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F0F0] text-black font-sans selection:bg-[#FFE600] selection:text-black overflow-hidden border-x-4 border-black max-w-[1600px] mx-auto">
      
      {/* Background Dots */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: 'radial-gradient(#000 2px, transparent 2px)',
          backgroundSize: '24px 24px'
        }}
      ></div>

      {/* Navbar */}
      <header className="relative z-50 flex items-center justify-between p-4 md:px-8 border-b-4 border-black bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF90E8] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-sm flex items-center justify-center font-bold text-xl leading-none">
            P
          </div>
          <span className="text-2xl font-black uppercase tracking-tighter ml-2">PILLAR</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="https://github.com/pranavamrutkar9/Pillar" target="_blank" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase hover:bg-[#FFE600] px-3 py-1 border-2 border-transparent hover:border-black transition-colors rounded-sm">
            GitHub
          </Link>
          <Link href="/auth" className="px-5 py-2 text-sm font-bold uppercase bg-[#FFE600] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all rounded-sm flex items-center gap-2">
            Sign In <Key className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full relative z-10">
        
        {/* Hero Section */}
        <section className="w-full flex flex-col lg:flex-row border-b-4 border-black">
          {/* Left: Copy */}
          <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center border-b-4 lg:border-b-0 lg:border-r-4 border-black bg-[#90A8ED]">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-fit rotate-[-2deg] font-bold uppercase text-sm">
              <div className="w-3 h-3 bg-[#FF5E5E] border-2 border-black rounded-full animate-pulse"></div>
              Pillar v1.0 is Live
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8 bg-white text-black p-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-fit">
              SHIP <br className="hidden md:block" />
              FASTER. <br className="hidden md:block" />
              NO BS.
            </h1>
            
            <p className="text-xl md:text-2xl font-bold max-w-lg mb-10 bg-[#FF90E8] p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              The issue tracker that doesn't feel like doing taxes. Build your product, track your cycles, and actually enjoy the process.
            </p>
            
            <Link href="/auth" className="w-fit px-8 py-4 text-xl font-black uppercase bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none active:translate-x-[8px] active:translate-y-[8px] transition-all flex items-center gap-4 group">
              Start Free
              <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          {/* Right: Mockup Graphic */}
          <div className="w-full lg:w-1/2 bg-[#23A094] p-8 md:p-16 flex items-center justify-center relative overflow-hidden">
             {/* Decorative Elements */}
             <div className="absolute top-10 right-10 w-24 h-24 bg-[#FFE600] border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
             <div className="absolute bottom-10 left-10 w-32 h-32 bg-[#FF5E5E] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[15deg]"></div>
             <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-15deg] flex items-center justify-center font-black text-3xl">!</div>

             {/* The Fake Window */}
             <div className="relative z-10 w-full max-w-md bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col rotate-[2deg] hover:rotate-0 transition-transform duration-300">
               <div className="h-12 border-b-4 border-black bg-[#FFE600] flex items-center px-4 gap-2 justify-between">
                 <div className="flex gap-2">
                   <div className="w-4 h-4 bg-white border-2 border-black rounded-full"></div>
                   <div className="w-4 h-4 bg-white border-2 border-black rounded-full"></div>
                 </div>
                 <div className="font-black uppercase text-sm tracking-widest">Workspace.exe</div>
               </div>
               <div className="p-6 bg-white flex flex-col gap-4">
                 <div className="w-full h-8 bg-[#E0E0E0] border-2 border-black relative overflow-hidden">
                   <div className="absolute top-0 left-0 h-full bg-[#23A094] border-r-2 border-black w-3/4 flex items-center px-2 font-bold text-xs text-white uppercase">Loading Cycles...</div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div className="h-24 bg-[#FF90E8] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center font-bold uppercase text-center p-2">Fix<br/>Bugs</div>
                   <div className="h-24 bg-[#90A8ED] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center font-bold uppercase text-center p-2">Ship<br/>Features</div>
                 </div>
               </div>
             </div>
          </div>
        </section>

        {/* Marquee Banner */}
        <div className="w-full bg-[#FFE600] border-b-4 border-black py-3 overflow-hidden flex whitespace-nowrap">
          <div className="animate-marquee flex gap-8 items-center font-black uppercase text-xl">
             <span>* BUILT FOR SPEED *</span>
             <span>OPTIMISTIC UI</span>
             <span>* REAL-TIME SYNC *</span>
             <span>NO MORE LOADING SPINNERS</span>
             <span>* BUILT FOR SPEED *</span>
             <span>OPTIMISTIC UI</span>
             <span>* REAL-TIME SYNC *</span>
             <span>NO MORE LOADING SPINNERS</span>
          </div>
        </div>

        {/* Features Grid */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-b-4 border-black bg-white relative z-10">
          
          <div className="p-8 md:p-12 border-b-4 md:border-b-0 lg:border-r-4 border-black hover:bg-[#FF90E8] transition-colors group">
            <div className="w-16 h-16 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Zap className="w-8 h-8" strokeWidth={3} />
            </div>
            <h3 className="text-3xl font-black uppercase mb-4">Blazing Fast</h3>
            <p className="text-lg font-bold text-gray-800 leading-snug">
              Updates happen instantly. Period. We use optimistic UI so you never have to stare at a loading spinner again while moving a ticket.
            </p>
          </div>

          <div className="p-8 md:p-12 border-b-4 md:border-b-0 lg:border-r-4 border-black hover:bg-[#90A8ED] transition-colors group">
            <div className="w-16 h-16 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Target className="w-8 h-8" strokeWidth={3} />
            </div>
            <h3 className="text-3xl font-black uppercase mb-4">Cycles, Not Sprints</h3>
            <p className="text-lg font-bold text-gray-800 leading-snug">
              Break work into healthy cycles. No more endless, soul-crushing backlogs. Plan what you can actually achieve and hit the target.
            </p>
          </div>

          <div className="p-8 md:p-12 border-b-4 md:border-b-0 border-black hover:bg-[#23A094] transition-colors group">
            <div className="w-16 h-16 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <GitBranch className="w-8 h-8" strokeWidth={3} />
            </div>
            <h3 className="text-3xl font-black uppercase mb-4">Keep Everyone Synced</h3>
            <p className="text-lg font-bold text-gray-800 leading-snug">
              Websockets keep everything live. Generate public, read-only viewer links to show off your progress without giving away the keys.
            </p>
          </div>

        </section>

        {/* Big CTA */}
        <section className="w-full bg-[#FF5E5E] p-12 md:p-24 flex flex-col items-center text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8 bg-white p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg]">
              READY TO BUILD?
            </h2>
            <Link href="/auth" className="px-12 py-6 text-2xl font-black uppercase bg-[#FFE600] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[6px] hover:translate-y-[6px] active:shadow-none active:translate-x-[12px] active:translate-y-[12px] transition-all rounded-sm">
              Create Workspace
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t-4 border-black p-8 flex flex-col md:flex-row justify-between items-center gap-6 z-10 relative">
        <div className="font-black text-3xl uppercase tracking-tighter">
          PILLAR.
        </div>
        
        <div className="flex gap-4">
           <Link href="https://github.com/pranavamrutkar9/Pillar" target="_blank" className="font-bold uppercase px-4 py-2 border-2 border-black hover:bg-[#FFE600] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
             Source Code
           </Link>
           <span className="font-bold uppercase px-4 py-2 border-2 border-black bg-[#E0E0E0] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
             MIT License
           </span>
        </div>
      </footer>

      {/* Tailwind Custom Keyframes for Marquee */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
        }
      `}} />
    </div>
  );
}
