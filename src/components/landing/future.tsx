"use client";

import { motion } from "framer-motion";
import { Brain, Link2, Cpu, Radio, Globe, FlaskConical } from "lucide-react";

const futureItems = [
  { icon: Brain, phase: "Phase 2", color: "text-blue-500 bg-blue-500/10", title: "AI & ML Diagnostics", desc: "ML models trained on anonymized data to predict health risks and assist clinical decisions." },
  { icon: Link2, phase: "Phase 2", color: "text-purple-500 bg-purple-500/10", title: "Blockchain Security", desc: "Immutable distributed ledger for medical transactions eliminating data tampering." },
  { icon: Cpu, phase: "Phase 3", color: "text-cyan-500 bg-cyan-500/10", title: "IoT & Wearables Sync", desc: "Smartwatches, glucometers, and monitors feeding live vitals into UHI records." },
  { icon: Radio, phase: "Phase 3", color: "text-teal-500 bg-teal-500/10", title: "Telemedicine Ecosystem", desc: "Remote consultations bringing specialist care to tier-2/3 cities and rural India." },
  { icon: Globe, phase: "Phase 4", color: "text-green-500 bg-green-500/10", title: "Global Interoperability", desc: "Adapting UHI for international health systems aligned with HL7 FHIR R5." },
  { icon: FlaskConical, phase: "Phase 4", color: "text-orange-500 bg-orange-500/10", title: "Research Collaboration", desc: "Anonymized consented data shared with institutions for epidemiology and drug discovery." },
];

export function FutureScope() {
  return (
    <section id="future" className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">The Road Ahead</h2>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Medi-Connect is engineered for the next decade of Indian healthcare innovation.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {futureItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-lg ${item.color} flex items-center justify-center`}>
                  <item.icon className={`h-5 w-5 ${item.color.split(" ")[0]}`} />
                </div>
                <span className="text-xs font-mono font-medium text-muted-foreground border rounded-full px-2 py-0.5">{item.phase}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
