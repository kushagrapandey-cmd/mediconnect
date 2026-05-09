import { Users, Building2, ShieldAlert, Activity, BarChart3, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Admin Panel | Medi-Connect",
  description: "System administration and health monitoring",
};

const stats = [
  { label: "Total Users", value: "12,483", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Hospitals Connected", value: "247", icon: Building2, color: "text-teal-500", bg: "bg-teal-500/10" },
  { label: "Threat Alerts", value: "3", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
  { label: "API Requests / day", value: "1.2M", icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10" },
];

const recentLogs = [
  { time: "20:14:02", user: "admin@aiims.in", action: "Accessed patient record", status: "ALLOWED", risk: "low" },
  { time: "20:10:17", user: "dr.sharma@apollo.com", action: "Exported CBC report", status: "AUDITED", risk: "medium" },
  { time: "19:58:44", user: "unknown-ip:192.168.1.44", action: "Failed login attempt x5", status: "BLOCKED", risk: "high" },
  { time: "19:45:33", user: "admin@medi-connect.com", action: "Updated RBAC policy", status: "ALLOWED", risk: "low" },
  { time: "19:30:11", user: "api-gateway", action: "FHIR sync — Thyrocare node", status: "SUCCESS", risk: "low" },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 md:px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              Admin Control Center
            </h1>
            <p className="text-muted-foreground mt-1">System health, user management & threat monitoring</p>
          </div>
          <span className="text-xs font-mono bg-green-500/10 text-green-500 rounded-full px-3 py-1 border border-green-500/20">
            ● All Systems Operational
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => (
            <Card key={i} className="bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Audit Logs Viewer */}
          <Card className="lg:col-span-2 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Live Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLogs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 gap-2 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground">{log.time}</span>
                      <div>
                        <p className="text-xs font-medium">{log.user}</p>
                        <p className="text-xs text-muted-foreground">{log.action}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-mono font-medium rounded-full px-2 py-0.5 ${
                      log.risk === "high" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                      log.risk === "medium" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                      "bg-green-500/10 text-green-500 border border-green-500/20"
                    }`}>{log.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Controls */}
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                Security Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "TLS 1.3 Encryption", status: "ACTIVE", on: true },
                { label: "MFA Enforcement", status: "ENABLED", on: true },
                { label: "RBAC Policies", status: "3 ROLES", on: true },
                { label: "Intrusion Detection", status: "MONITORING", on: true },
                { label: "Audit Log Retention", status: "7 YEARS", on: true },
                { label: "Blockchain (Beta)", status: "DISABLED", on: false },
              ].map((ctrl, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                  <span className="text-sm">{ctrl.label}</span>
                  <span className={`text-xs font-mono font-medium rounded-full px-2 py-0.5 ${
                    ctrl.on
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : "bg-muted text-muted-foreground border"
                  }`}>{ctrl.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
