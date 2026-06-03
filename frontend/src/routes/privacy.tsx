import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Zoventro" },
      { name: "description", content: "How we collect, use, and protect your information while you use our platform." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.975_0.012_290)] flex flex-col">
      <div className="pt-4">
        <Header />
      </div>

      <main className="flex-1 px-4 py-16 max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-4 text-muted-foreground text-sm max-w-xl mx-auto">
            How we collect, use, and protect your information while you use our platform.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-card border border-border rounded-[2rem] p-8 md:p-12 shadow-card space-y-8">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Introduction</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform, including our website, organizer dashboard, and interactive experiences.
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-bold text-foreground mb-2">Information We Collect</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              We may collect the following types of information:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
              <li>Personal details such as name, email address, and organization details.</li>
              <li>Usage data including interactions within the platform.</li>
              <li>Device and technical information such as browser type and IP address.</li>
              <li>Feedback and responses submitted during activities.</li>
            </ul>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-bold text-foreground mb-2">How We Use Your Information</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              We use the collected data to:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
              <li>Provide and improve our services.</li>
              <li>Enable participation in activities and events.</li>
              <li>Communicate important updates and notifications.</li>
              <li>Analyze usage to enhance user experience.</li>
              <li>Ensure platform security and prevent misuse.</li>
            </ul>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-bold text-foreground mb-2">Data Sharing</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              We do not sell or rent your personal data. Your information may only be shared with:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
              <li>Service providers who support platform operations.</li>
              <li>Organizations hosting the activity (for participant management).</li>
              <li>Legal authorities when required by law.</li>
            </ul>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-bold text-foreground mb-2">Data Security</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We implement appropriate security measures to protect your data against unauthorized access, misuse, or disclosure. However, no system is completely secure, and we cannot guarantee absolute security.
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-bold text-foreground mb-2">Data Retention</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We retain your data only for as long as necessary to provide our services and fulfill legal obligations.
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-bold text-foreground mb-2">Your Rights</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You may request access, correction, or deletion of your personal data by contacting us.
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-bold text-foreground mb-2">Updates</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. Continued use of the platform implies acceptance of the updated policy.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
