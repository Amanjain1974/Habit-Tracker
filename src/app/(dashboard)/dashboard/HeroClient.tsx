"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { Target } from "lucide-react";

export default function HeroClient({ 
  greeting, 
  firstName, 
  activeTaskCount, 
  finishRate 
}: { 
  greeting: string, 
  firstName: string, 
  activeTaskCount: number, 
  finishRate: number 
}) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mouse Parallax logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth) * 2 - 1; // -1 to 1
    const y = (clientY / innerHeight) * 2 - 1; // -1 to 1
    mouseX.set(x);
    mouseY.set(y);
  };

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Rotate orb based on mouse
  const rotateX = useTransform(smoothY, [-1, 1], [15, -15]);
  const rotateY = useTransform(smoothX, [-1, 1], [-15, 15]);
  
  // Shift background glow based on mouse
  const glowX = useTransform(smoothX, [-1, 1], [-30, 30]);
  const glowY = useTransform(smoothY, [-1, 1], [-30, 30]);
  const inverseGlowX = useTransform(glowX, v => -v);
  const inverseGlowY = useTransform(glowY, v => -v);

  if (!isMounted) return null;

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative w-full rounded-[2rem] p-8 md:p-12 border border-white/5 bg-[#111113]/80 backdrop-blur-3xl overflow-hidden shadow-2xl"
    >
      {/* Ambient Mouse-Tracking Glow */}
      <motion.div 
        style={{ x: glowX, y: glowY }}
        className="absolute top-0 right-1/4 w-96 h-96 bg-[#7C3AED]/20 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        style={{ x: inverseGlowX, y: inverseGlowY }}
        className="absolute bottom-0 right-0 w-64 h-64 bg-[#22D3EE]/15 rounded-full blur-[100px] pointer-events-none" 
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 perspective-[1000px]">
        
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 space-y-5"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
            {greeting}, <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7C3AED] to-[#22D3EE]">
              {firstName}
            </span>.
          </h1>
          <p className="text-xl text-[#A1A1AA] font-medium max-w-md">
            What matters today? Finish your most important work.
          </p>
          <div className="pt-2 flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-[#A78BFA] text-sm font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(124,58,237,0.15)]"
            >
              <Target className="w-4 h-4" /> {activeTaskCount} priorities remaining
            </motion.div>
          </div>
        </motion.div>

        {/* 3D Parallax Orb */}
        <motion.div 
          style={{ rotateX, rotateY }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-48 h-48 md:w-64 md:h-64 shrink-0 flex items-center justify-center preserve-3d"
        >
          {/* Outer Rotating Rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            className="absolute inset-0 rounded-full border-[1.5px] border-[#7C3AED]/30 border-dashed" 
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 25, ease: "linear", repeat: Infinity }}
            className="absolute inset-4 rounded-full border-[1.5px] border-[#22D3EE]/20 border-dotted" 
          />
          
          {/* Core Liquid Orb */}
          <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#22D3EE] shadow-[0_0_60px_rgba(124,58,237,0.5)] flex flex-col items-center justify-center text-white border-4 border-[#18181B] overflow-hidden">
            {/* Liquid wave representation */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: `${100 - finishRate}%` }}
              transition={{ duration: 1.5, cubicBezier: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 bg-[#09090B]/40 backdrop-blur-sm" 
            />
            
            <div className="relative z-10 text-center transform translate-z-10">
              <span className="text-5xl font-black tracking-tighter drop-shadow-lg">{finishRate}%</span>
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.2em] opacity-90 mt-1 drop-shadow-md">Finish Rate</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
