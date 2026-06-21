import { Link } from 'react-router-dom';
import Header from '../../../core/components/Header';
import Footer from '../../../core/components/Footer';
import whalesharkBg from '../../../assets/whaleshark.png';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B1326] text-white font-inter flex flex-col overflow-x-hidden selection:bg-[#22D3EE]/30">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section 
          className="relative pt-32 pb-40 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center w-full min-h-[80vh] justify-center bg-black"
        >
          {/* Background Image with feathered edges */}
          <div 
            className="absolute inset-0 pointer-events-none bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${whalesharkBg})`, 
              backgroundSize: '70%',
              maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)'
            }}
          />
          {/* Dark overlay to ensure text remains readable */}
          <div className="absolute inset-0 bg-[#0B1326]/60 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B1326] to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center justify-center px-4 py-1.5 mb-8 border border-[#22D3EE]/30 rounded-full bg-[#22D3EE]/5 text-[10px] font-bold tracking-widest text-[#22D3EE] uppercase backdrop-blur-sm">
              Dive into Web Dev
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] text-white">
              Start your Web Development<br />
              Journey the <span className="text-[#22D3EE] italic font-serif drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">RIGHT</span> way
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed font-light drop-shadow-md">
              Everyone can code, but are you sure that's the proper way to do it?<br />
              Dive into proper practices and build your fundamentals here in<br />
              DevDive!
            </p>

            <Link
              to="/course-map"
              className="inline-flex items-center gap-2 bg-[#22D3EE] text-slate-900 font-bold px-8 py-3.5 rounded-full hover:bg-cyan-300 hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >
              Start Learning for Free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* How it works Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#131318]/50 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif">How it works</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                DevDive is a website we wish we knew when starting our web dev journey. We use quality resources from the internet to supplement learning and present them in a logical order. What makes DevDive unique is it uses AI to check not just if your "works," but also how cleanly you wrote it and how it looks like on different sizes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-[#09090B] border border-white/5 rounded-xl p-10 flex flex-col items-center text-center hover:border-[#22D3EE]/30 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-[#003546] flex items-center justify-center mb-6 text-[#22D3EE]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3 font-serif tracking-wide">Read Lesson</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Familiarize first by studying the concepts of web development.</p>
              </div>

              {/* Card 2 */}
              <div className="bg-[#09090B] border border-white/5 rounded-xl p-10 flex flex-col items-center text-center hover:border-[#22D3EE]/30 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-[#003546] flex items-center justify-center mb-6 text-[#22D3EE]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3 font-serif tracking-wide">Write Code</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Immediately start applying your knowledge with our online IDE.</p>
              </div>

              {/* Card 3 */}
              <div className="bg-[#09090B] border border-white/5 rounded-xl p-10 flex flex-col items-center text-center hover:border-[#22D3EE]/30 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-[#003546] flex items-center justify-center mb-6 text-[#22D3EE]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3 font-serif tracking-wide">Get Feedback</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Receive constructive feedback regarding your code as well as visual output.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-[#0F172A] border border-[#1E293B] rounded-2xl p-12 text-center shadow-2xl relative overflow-hidden">


            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-serif relative z-10">
              Ready to improve your Web Development skills?
            </h2>
            <p className="text-slate-400 mb-10 relative z-10">
              Let's start here, from square one, no, from zero!
            </p>
            <Link
              to="/signup"
              className="inline-block bg-[#30BCED] text-white font-bold px-10 py-3 rounded text-sm hover:bg-cyan-400 transition-colors relative z-10"
            >
              Sign up
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
