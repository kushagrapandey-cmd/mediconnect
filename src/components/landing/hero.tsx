"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Activity, Database } from "lucide-react";

export function Hero() {
  return (
    <section className="relative w-full py-20 md:py-32 overflow-hidden bg-background">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),rgba(15,23,42,1))]" />
      
      <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-muted/50 backdrop-blur-sm mb-6"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          India's Unified Health Interface Platform
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl"
        >
          Secure India's Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">Health Future</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed"
        >
          Medi-Connect unifies the fragmented healthcare ecosystem through a secure, privacy-first Unified Health Interface (UHI) powered by advanced encryption and FHIR interoperability.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full px-8 h-11 font-medium text-sm bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="#security"
            className="inline-flex items-center justify-center rounded-full px-8 h-11 font-medium text-sm border border-input bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Explore UHI
          </Link>
        </motion.div>

        {/* 3D Floating Cards Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
        >
          <div className="relative group p-6 rounded-2xl border bg-card/50 backdrop-blur-xl shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl hover:border-primary/50">
            <Shield className="h-10 w-10 text-blue-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">Zero-Trust Security</h3>
            <p className="text-sm text-muted-foreground">End-to-end encryption for all patient health records.</p>
          </div>
          <div className="relative group p-6 rounded-2xl border bg-card/50 backdrop-blur-xl shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl hover:border-cyan-500/50 mt-0 md:-mt-8">
            <Activity className="h-10 w-10 text-cyan-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">Real-time Interoperability</h3>
            <p className="text-sm text-muted-foreground">FHIR standard APIs linking hospitals, clinics, and labs.</p>
          </div>
          <div className="relative group p-6 rounded-2xl border bg-card/50 backdrop-blur-xl shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl hover:border-teal-500/50">
            <Database className="h-10 w-10 text-teal-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">Consent Management</h3>
            <p className="text-sm text-muted-foreground">Patient-controlled granular access to medical history.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
