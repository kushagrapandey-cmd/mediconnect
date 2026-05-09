import { Activity, FileText, CalendarDays, ShieldCheck, Bell, TrendingUp, Users, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Patient Dashboard | Medi-Connect",
  description: "Your personal health command center",
};

const stats = [
  { title: "Health Score", value: "92", unit: "/100", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
  { title: "Records", value: "14", unit: " docs", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
  { title: "Upcoming", value: "3", unit: " appts", icon: CalendarDays, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { title: "Alerts", value: "1", unit: " new", icon: Bell, color: "text-amber-500", bg: "bg-amber-500/10" },
];

const timeline = [
  { date: "22 Sep 2024", title: "Discharge Summary", org: "Fortis Healthcare", type: "Discharge" },
  { date: "5 Jul 2024", title: "Vaccination Record", org: "PHC Varanasi", type: "Vaccine" },
  { date: "18 Apr 2024", title: "Consultation Notes", org: "Apollo Hospitals", type: "Consultation" },
  { date: "2 Mar 2024", title: "Lab Report — CBC", org: "Thyrocare", type: "Lab" },
  { date: "14 Jan 2024", title: "Prescription", org: "AIIMS New Delhi", type: "Prescription" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 md:px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Good morning, Rohan 👋</h1>
            <p className="text-muted-foreground mt-1">
              UHI ID: <span className="font-mono text-primary">UHI-IN-2024-X4F2-9K7M</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Consent Status</p>
              <p className="text-sm font-medium text-green-500">Active & Verified</p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => (
            <Card key={i} className="bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div className="text-2xl font-bold">
                  {s.value}<span className="text-sm font-normal text-muted-foreground">{s.unit}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{s.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Medical History Timeline */}
          <Card className="lg:col-span-2 bg-card/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Medical History
              </CardTitle>
              <span className="text-xs text-muted-foreground font-mono border rounded-full px-2 py-0.5">FHIR R4</span>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-6">
                  {timeline.map((item, i) => (
                    <div key={i} className="flex gap-4 relative pl-8">
                      <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{item.title}</p>
                          <span className="text-xs border rounded-full px-2 py-0.5 text-muted-foreground">{item.type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.org}</p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Analytics */}
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Health Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Blood Pressure", value: "120/80", status: "Normal", color: "text-green-500" },
                { label: "Blood Glucose", value: "98 mg/dL", status: "Normal", color: "text-green-500" },
                { label: "Cholesterol", value: "210 mg/dL", status: "Monitor", color: "text-amber-500" },
                { label: "BMI", value: "22.4", status: "Healthy", color: "text-green-500" },
              ].map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                  <div>
                    <p className="text-xs text-muted-foreground">{h.label}</p>
                    <p className="font-semibold font-mono">{h.value}</p>
                  </div>
                  <span className={`text-xs font-medium ${h.color}`}>{h.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Security Status */}
        <Card className="mt-6 bg-card/60 backdrop-blur-sm border-green-500/20">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-bold">Security Status: Active</p>
                  <p className="text-sm text-muted-foreground">TLS 1.3 · AES-256 · MFA Enabled · ABDM Aligned</p>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                {["FHIR R4", "ABDM", "HIPAA-Aware", "Encrypted"].map(tag => (
                  <span key={tag} className="text-xs font-mono bg-primary/10 text-primary rounded-full px-3 py-1 border border-primary/20">{tag}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
