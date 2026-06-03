import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Zoventro" },
      { name: "description", content: "The terms that govern your access and use of our platform." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.975_0.012_290)] flex flex-col">
      <div className="pt-4">
        <Header />
      </div>

      <main className="flex-1 px-4 py-16 max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-muted-foreground text-sm max-w-xl mx-auto">
            The terms that govern your access and use of our platform.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-card border border-border rounded-[2rem] p-8 md:p-12 shadow-card space-y-8">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Acceptance of Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By accessing or using our platform, you agree to comply with these Terms &amp; Conditions.
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-bold text-foreground mb-2">Use of Platform</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              You agree to:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
              <li>Use the platform for lawful purposes only.</li>
              <li>Provide accurate information during registration.</li>
              <li>Not misuse, disrupt, or attempt unauthorized access.</li>
            </ul>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-bold text-foreground mb-2">User Accounts</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-bold text-foreground mb-2">Participation in Activities</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Participation in games or activities is voluntary. Users are expected to engage respectfully and follow the guidelines provided during the experience.
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-bold text-foreground mb-2">Intellectual Property</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All content, designs, and materials on the platform are owned by us or our licensors and may not be copied or reused without permission.
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-bold text-foreground mb-2">Limitation of Liability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              We are not liable for:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
              <li>Any interruptions or technical issues.</li>
              <li>Loss of data or participation issues.</li>
              <li>Outcomes of game-based activities or decisions made during them.</li>
            </ul>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-bold text-foreground mb-2">Termination</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate access if users violate these terms.
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-bold text-foreground mb-2">Updates</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These Terms may be updated periodically. Continued use indicates acceptance.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
