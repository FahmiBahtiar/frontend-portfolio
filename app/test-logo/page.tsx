'use client';

import { Logo } from '@/components/ui/logo';

export default function TestLogoPage() {
  return (
    <div className="min-h-screen">
      {/* Dark Background Section */}
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-8">
        <div className="text-center space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Logo pada Background Dark</h1>
            <p className="text-white/60">Matching dengan tema website</p>
          </div>
          
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="space-y-3">
              <Logo size={120} />
              <p className="text-white/50 text-sm">120px</p>
            </div>
            <div className="space-y-3">
              <Logo size={80} />
              <p className="text-white/50 text-sm">80px</p>
            </div>
            <div className="space-y-3">
              <Logo size={60} />
              <p className="text-white/50 text-sm">60px</p>
            </div>
            <div className="space-y-3">
              <Logo size={40} />
              <p className="text-white/50 text-sm">40px</p>
            </div>
          </div>

          <div className="mt-12 bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 max-w-2xl mx-auto">
            <h3 className="text-white font-semibold mb-3">🎨 Color Palette:</h3>
            <div className="space-y-2 text-left text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-white/20"></div>
                <span className="text-white/70">Background: slate-950 → slate-900 → slate-950</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
                <span className="text-white/70">Text: cyan-500 → blue-500 → purple-500</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded border border-cyan-500/20 bg-cyan-500/5"></div>
                <span className="text-white/70">Border: gradient dengan opacity 0.2</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Light Background Section for Comparison */}
      <div className="min-h-screen bg-gradient-to-br from-white to-slate-100 flex items-center justify-center p-8">
        <div className="text-center space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Logo pada Background Light</h1>
            <p className="text-slate-600">Untuk perbandingan (tetap terlihat bagus!)</p>
          </div>
          
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="space-y-3">
              <Logo size={120} />
              <p className="text-slate-500 text-sm">120px</p>
            </div>
            <div className="space-y-3">
              <Logo size={80} />
              <p className="text-slate-500 text-sm">80px</p>
            </div>
            <div className="space-y-3">
              <Logo size={60} />
              <p className="text-slate-500 text-sm">60px</p>
            </div>
            <div className="space-y-3">
              <Logo size={40} />
              <p className="text-slate-500 text-sm">40px</p>
            </div>
          </div>

          <a 
            href="/"
            className="inline-block mt-8 px-6 py-3 bg-slate-900 text-white rounded-xl hover:scale-105 transition-transform"
          >
            ← Kembali ke Home
          </a>
        </div>
      </div>
    </div>
  );
}
