export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl px-4 md:px-6 py-16">
      <h1 className="text-4xl font-bold mb-2 tracking-tight">Privacy Policy</h1>
      <p className="text-muted-foreground mb-10 text-sm">Last updated: May 9, 2025</p>

      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">Medi-Connect is committed to protecting the privacy and security of your personal health data. This policy outlines how we collect, process, and safeguard your information in compliance with India's Digital Personal Data Protection Act (DPDP) 2023 and the ABDM framework.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-3">2. Data We Collect</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Personal identifiers (name, email, Aadhar-linked UHI ID)</li>
            <li>Medical records, prescriptions, and lab reports you choose to link</li>
            <li>Appointment and consultation history</li>
            <li>Consent logs and access records</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-3">3. Consent Framework</h2>
          <p className="text-muted-foreground leading-relaxed">No data is shared without your explicit, granular, and time-bound consent. You can revoke consent at any time from your dashboard. All consent actions are recorded in an immutable audit log.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-3">4. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">All data is encrypted in transit using TLS 1.3 and at rest using AES-256. We implement multi-factor authentication, role-based access control, and continuous intrusion detection to protect your information.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-3">5. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">For privacy-related queries, contact our Data Protection Officer at <span className="text-primary font-mono">privacy@medi-connect.in</span></p>
        </section>
      </div>
    </div>
  );
}
