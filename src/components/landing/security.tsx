"use client";

import { motion } from "framer-motion";
import { ShieldAlert, EyeOff, Lock, ServerCrash, KeyRound, UserX, Network } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const securityRisks = [
  { icon: ServerCrash, title: "Data Breaches", desc: "Centralized honeypots vulnerable to sophisticated state-sponsored attacks." },
  { icon: UserX, title: "Insider Threats", desc: "Unauthorized access by hospital staff without proper RBAC enforcement." },
  { icon: KeyRound, title: "API Vulnerabilities", desc: "Insecure endpoints leading to massive data exfiltration." },
  { icon: ShieldAlert, title: "Ransomware", desc: "Targeting critical health infrastructure to lock patient records." },
];

const privacyRisks = [
  { icon: EyeOff, title: "Surveillance Fears", desc: "Unintended tracking of citizen health data by state actors." },
  { icon: Network, title: "Secondary Misuse", desc: "Selling anonymized data that gets re-identified by third parties." },
  { icon: Lock, title: "Consent Management", desc: "Complex consent flows causing patients to unintentionally expose data." },
];

export function SecurityPrivacy() {
  return (
    <section id="security" className="py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Security & Privacy Constraints</h2>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Implementing a Unified Health Interface demands unprecedented architectural resilience. These are the critical vectors Medi-Connect mitigates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Security Concerns */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold">Security Vulnerabilities</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {securityRisks.map((risk, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="bg-background/60 backdrop-blur-md border-red-500/20 hover:border-red-500/50 transition-colors">
                    <CardHeader className="pb-2">
                      <risk.icon className="h-6 w-6 text-red-500 mb-2" />
                      <CardTitle className="text-lg">{risk.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{risk.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Privacy Concerns */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <EyeOff className="h-5 w-5 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold">Privacy & Ethical Risks</h3>
            </div>
            <div className="flex flex-col gap-4">
              {privacyRisks.map((risk, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  whileHover={{ x: 5 }}
                >
                  <Card className="bg-background/60 backdrop-blur-md border-orange-500/20 hover:border-orange-500/50 transition-colors flex flex-row items-center p-4">
                    <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center mr-4 shrink-0">
                      <risk.icon className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{risk.title}</h4>
                      <p className="text-sm text-muted-foreground">{risk.desc}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
