"use client";

import { motion } from "framer-motion";
import { Fingerprint, FileText, Stethoscope, Search, Landmark, Bot, CalendarCheck, Bell, Vault, Ambulance } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { icon: Fingerprint, title: "Unified Health ID", desc: "A persistent, portable identity linked to Aadhar." },
  { icon: FileText, title: "Digital Health Records", desc: "Centralized, FHIR-compliant medical history." },
  { icon: Stethoscope, title: "Symptom Checker", desc: "Context-aware initial diagnostics." },
  { icon: Search, title: "Doctor Discovery", desc: "Find verified specialists based on real-time availability." },
  { icon: Landmark, title: "Government Schemes", desc: "Seamless integration with Ayushman Bharat." },
  { icon: Bot, title: "AI Health Assistant", desc: "24/7 intelligent conversational support." },
  { icon: CalendarCheck, title: "Appointment Booking", desc: "Frictionless scheduling across UHI network." },
  { icon: Bell, title: "Notifications System", desc: "Critical alerts for prescriptions and lab results." },
  { icon: Vault, title: "Secure Medical Vault", desc: "AES-256 encrypted storage for sensitive documents." },
  { icon: Ambulance, title: "Emergency Mode", desc: "Instantly share critical vitals during crises." },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">A Comprehensive Ecosystem</h2>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Ten core modules designed to seamlessly interoperate, bringing hospital-grade infrastructure directly to the patient's fingertips.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full bg-card/40 backdrop-blur-sm border-primary/10 hover:border-primary/40 transition-colors">
                <CardHeader className="pb-2">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-md">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
