# Medi-Connect 🏥

> **Secure India's Digital Health Future**  
> A world-class, production-ready UHI (Unified Health Interface) platform built for India.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🚀 Overview

Medi-Connect is a full-stack Next.js 15 healthcare platform addressing **Security and Privacy Concerns in Implementing a Unified Health Interface (UHI) in the Indian Context**. Built with a zero-trust security architecture, consent-first data model, and FHIR R4 compliance.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 App Router, React, Tailwind CSS, Framer Motion |
| **UI Components** | ShadCN UI |
| **Authentication** | NextAuth.js v4 (JWT sessions, RBAC) |
| **Database** | PostgreSQL + Prisma ORM |
| **Containerization** | Docker + docker-compose |
| **Standards** | FHIR R4, ABDM, DPDP Act 2023 |

---

## 🛠️ Getting Started (Local Development)

### Prerequisites
- Node.js 20+
- npm
- PostgreSQL running locally (or use Docker)

### 1. Clone the repository
```bash
git clone https://github.com/kushagrapandey-cmd/mediconnect.git
cd mediconnect
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
# Fill in DATABASE_URL, NEXTAUTH_SECRET
```

### 4. Start dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🐳 Docker (Full Stack)

```bash
docker-compose up -d
```
This spins up PostgreSQL + the Next.js app automatically.

---

## 📋 Pages & Routes

| Route | Description |
|---|---|
| `/` | Landing Page (Hero, Security, Features, Research, Future) |
| `/login` | User Login |
| `/register` | User Registration |
| `/dashboard` | Patient Health Dashboard |
| `/admin` | Admin Control Center |
| `/privacy` | Privacy Policy |
| `/api-docs` | REST API Reference |

---

## 🔒 Security Architecture

- **TLS 1.3** — All data in transit encrypted
- **AES-256** — All data at rest encrypted
- **JWT sessions** — Secure, role-bound session tokens
- **RBAC** — Patient, Doctor, Admin role separation
- **Audit Logs** — 7-year immutable access records
- **Consent Engine** — Granular, revocable patient data sharing
- **ABDM Aligned** — Compliant with NHA guidelines

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 📜 License

MIT — Built at Axis Institute of Technology and Management.
