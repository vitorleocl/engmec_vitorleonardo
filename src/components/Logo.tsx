/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'footer';
}

export default function Logo({ className = '', variant = 'light' }: LogoProps) {
  const isDarkBg = variant === 'footer';
  
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icon Frame - Mechanical Engineering Blueprint Symbol */}
      <div className="relative flex-shrink-0 group">
        <div className="absolute -inset-1 bg-gradient-to-tr from-[#4895EF] to-[#134074] rounded-xl blur-sm opacity-25 group-hover:opacity-60 transition duration-500" />
        <div className={`relative flex items-center justify-center w-11 h-11 rounded-xl shadow-md border transition-all duration-300 ${
          isDarkBg 
            ? 'bg-slate-900 border-slate-800' 
            : 'bg-[#0B2545] border-[#134074]'
        }`}>
          {/* Precise Mechanical Engineering SVG Symbol - Interlocking Gears & Technical Caliper Lines */}
          <svg 
            viewBox="0 0 100 100" 
            className="w-7 h-7 text-white fill-none"
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {/* Outer technical blueprint circle */}
            <circle cx="50" cy="50" r="44" className="stroke-white/15 stroke-[1]" />
            <circle cx="50" cy="50" r="44" className="stroke-[#4895EF]/30 stroke-[1]" strokeDasharray="4 4" />
            
            {/* Compass / Caliper measuring arms */}
            <path d="M15 15 L50 50 L85 15" className="stroke-[#4895EF]/40 stroke-[2]" />
            <path d="M28 28 L72 28" className="stroke-white/30 stroke-[1.5]" strokeDasharray="2 2" />

            {/* Left Gear (Interlocking, larger) */}
            <g className="stroke-[#4895EF] stroke-[3]">
              {/* Pitch Circle */}
              <circle cx="42" cy="58" r="16" className="stroke-white stroke-[2.5]" />
              <circle cx="42" cy="58" r="8" className="stroke-[#4895EF]/70 stroke-[1.5]" fill="currentColor" fillOpacity="0.1" />
              
              {/* Gear Teeth */}
              <path d="M42 36 L42 42" />
              <path d="M42 74 L42 80" />
              <path d="M20 58 L26 58" />
              <path d="M58 58 L64 58" />
              
              <path d="M26.5 42.5 L31 47" />
              <path d="M53 69 L57.5 73.5" />
              <path d="M57.5 42.5 L53 47" />
              <path d="M31 69 L26.5 73.5" />
            </g>

            {/* Right Gear (Interlocking, smaller secondary planetary gear) */}
            <g className="stroke-[#4895EF] stroke-[2.5]">
              {/* Pitch Circle */}
              <circle cx="68" cy="42" r="11" className="stroke-[#4895EF]/90 stroke-[2]" />
              <circle cx="68" cy="42" r="5" className="stroke-white/50 stroke-[1]" fill="currentColor" fillOpacity="0.2" />
              
              {/* Gear Teeth */}
              <path d="M68 26 L68 31" />
              <path d="M68 53 L68 58" />
              <path d="M52 42 L57 42" />
              <path d="M79 42 L84 42" />
              
              <path d="M57 31 L61 35" />
              <path d="M75 49 L79 53" />
              <path d="M79 31 L75 35" />
              <path d="M61 49 L57 53" />
            </g>

            {/* Dynamic Center Pivot Bolt */}
            <circle cx="42" cy="58" r="3" className="fill-white stroke-none" />
            <circle cx="68" cy="42" r="2" className="fill-white stroke-none" />
          </svg>
        </div>
      </div>

      {/* Styled Brand Typography pairing */}
      <div className="text-left flex flex-col justify-center">
        <div className="flex items-baseline gap-1 leading-none">
          <span className={`text-xl font-sans font-black tracking-tight ${
            isDarkBg ? 'text-white' : 'text-slate-950 dark:text-white'
          }`}>
            VL
          </span>
          <span className={`text-xs font-mono font-extrabold tracking-widest ${
            isDarkBg ? 'text-[#4895EF]' : 'text-[#134074] dark:text-[#4895EF]'
          }`}>
            ENGENHARIA
          </span>
        </div>
        <span className={`text-[9px] font-mono tracking-widest font-black uppercase leading-none pt-1 ${
          isDarkBg ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
        }`}>
          Inspeções, Laudos e Soluções em Engenharia Mecânica
        </span>
      </div>
    </div>
  );
}
