"use client";

import { motion } from "framer-motion";
import { BookOpen, Target, CheckCircle, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ResearchPaper() {
  return (
    <section id="research" className="py-24 bg-muted/20 border-y">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-muted/50 mb-4">
            <BookOpen className="h-4 w-4 mr-2 text-primary" />
            Academic Foundation
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Security & Privacy Concerns in UHI
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl">
            This platform is built upon rigorous academic research detailing the implementation challenges of the Unified Health Interface in the Indian Context.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="bg-background/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <Target className="mr-3 h-6 w-6 text-blue-500" />
                  Abstract & Objectives
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The Unified Health Interface (UHI) holds immense potential to revolutionize healthcare delivery in India by enabling seamless data exchange between patients and healthcare providers. However, its successful implementation hinges on addressing critical security and privacy concerns.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our research investigates the vulnerabilities inherent in a massive centralized gateway architecture and proposes a distributed, consent-first cryptographic framework to mitigate unauthorized profiling and data exfiltration.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <Lightbulb className="mr-3 h-6 w-6 text-amber-500" />
                  Proposed Solutions
                </h3>
                <ul className="space-y-3">
                  {["Zero-knowledge proofs for identity verification without exposing PII.",
                    "Granular, time-bound electronic consent artifacts (ECA).",
                    "Decentralized storage nodes for medical imaging and heavy diagnostic files.",
                    "Strict Role-Based Access Control (RBAC) audited via immutable ledgers."].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="sticky top-24 bg-gradient-to-b from-primary/10 to-transparent p-8 rounded-2xl border">
              <h3 className="text-xl font-bold mb-4">Key Research Findings</h3>
              <div className="space-y-6">
                <div>
                  <div className="text-3xl font-extrabold text-primary mb-1">74%</div>
                  <p className="text-sm text-muted-foreground">Of existing health portals lack FHIR compliant API gateways.</p>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-primary mb-1">AES-256</div>
                  <p className="text-sm text-muted-foreground">Minimum recommended encryption standard for data at rest.</p>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-primary mb-1">HIPAA + DPDP</div>
                  <p className="text-sm text-muted-foreground">Dual compliance required for global-standard Indian healthcare platforms.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
