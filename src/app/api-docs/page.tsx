export default function APIDocsPage() {
  return (
    <div className="container max-w-4xl px-4 md:px-6 py-16">
      <h1 className="text-4xl font-bold mb-2 tracking-tight">API Documentation</h1>
      <p className="text-muted-foreground mb-10">REST API reference for Medi-Connect UHI integration.</p>

      <div className="space-y-8">
        {[
          { method: "POST", path: "/api/auth/register", desc: "Register a new patient or provider account." },
          { method: "POST", path: "/api/auth/login", desc: "Authenticate and receive a JWT session token." },
          { method: "GET",  path: "/api/health-records", desc: "Fetch all health records for the authenticated user." },
          { method: "POST", path: "/api/health-records", desc: "Create a new FHIR-compliant health record entry." },
          { method: "GET",  path: "/api/consent", desc: "Retrieve active consent grants for the user." },
          { method: "POST", path: "/api/consent/grant", desc: "Grant time-bound consent to a healthcare provider." },
          { method: "POST", path: "/api/consent/revoke", desc: "Revoke an existing consent grant immediately." },
          { method: "GET",  path: "/api/admin/users", desc: "List all users. Admin role required." },
          { method: "GET",  path: "/api/admin/logs", desc: "Retrieve audit logs. Admin role required." },
        ].map((api, i) => (
          <div key={i} className="p-5 rounded-xl border bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-mono font-bold rounded px-2 py-0.5 ${
                api.method === "GET" ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"
              }`}>{api.method}</span>
              <code className="text-sm font-mono text-foreground">{api.path}</code>
            </div>
            <p className="text-sm text-muted-foreground">{api.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
