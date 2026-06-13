"use client";

import { useRouter } from "next/navigation";
import FitnessBackground from "@/components/fitness-background";
import { Button } from "@/components/ui/button";
import { Dumbbell, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <FitnessBackground />

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
          <Dumbbell className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
          NC Fitness Club
        </h1>

        <p className="text-xl md:text-2xl text-white/70 mb-2 font-light">
          Unified Operations Platform
        </p>

        <p className="text-base text-white/50 mb-10 max-w-lg mx-auto">
          Empowering athletes, coaches, and communities through world-class programs, facilities, and technology.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-white text-slate-900 hover:bg-white/90 font-semibold px-8"
            onClick={() => router.push("/login")}
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 px-8"
            onClick={() => router.push("/login")}
          >
            Staff Login
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-white/40 text-sm">
          <div>
            <p className="text-2xl font-bold text-white/80">15+</p>
            <p>Programs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white/80">3</p>
            <p>Locations</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white/80">50+</p>
            <p>Coaches</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white/80">2k+</p>
            <p>Members</p>
          </div>
        </div>
      </div>
    </main>
  );
}
