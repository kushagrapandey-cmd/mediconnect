import { Hero } from "@/components/landing/hero";
import { SecurityPrivacy } from "@/components/landing/security";
import { Features } from "@/components/landing/features";
import { ResearchPaper } from "@/components/landing/research";
import { FutureScope } from "@/components/landing/future";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Hero />
      <SecurityPrivacy />
      <Features />
      <ResearchPaper />
      <FutureScope />
    </div>
  );
}
