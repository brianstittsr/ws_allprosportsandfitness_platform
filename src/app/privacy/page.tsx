import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - NC Fitness Club",
  description:
    "Privacy practices for NC Fitness Club applications, website, and connected services.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <Dumbbell className="h-6 w-6" />
            <span className="font-semibold text-lg">NC Fitness Club</span>
          </Link>
          <Button variant="outline" size="sm" asChild className="border-white/30 text-white bg-transparent hover:bg-white/10">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-slate-200/20 shadow-xl">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-3xl font-bold text-slate-900">
              Privacy Policy
            </CardTitle>
            <p className="text-sm text-slate-500 mt-2">Last updated: June 24, 2026</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none p-6 sm:p-8">
            <p>
              NC Fitness Club ("Company," "we," "us," or "our") is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you use our website, mobile applications, and connected
              services (collectively, the "Services").
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">1. Information We Collect</h2>
            <p>We may collect the following categories of information:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Account Information:</strong> Name, email address, phone number, username,
                password, and membership details.
              </li>
              <li>
                <strong>Profile and Fitness Data:</strong> Age, height, weight, fitness goals,
                workout history, attendance, program participation, and progress metrics.
              </li>
              <li>
                <strong>Payment Information:</strong> Billing address, payment method details, and
                transaction history. Payment card data is processed securely by our payment
                partners and is not stored on our servers.
              </li>
              <li>
                <strong>Device and Usage Data:</strong> IP address, device type, operating system,
                browser type, app usage, crash logs, and cookies or similar technologies.
              </li>
              <li>
                <strong>Communications:</strong> Messages, emails, support tickets, and other
                correspondence you send to us.
              </li>
              <li>
                <strong>Location Data:</strong> With your consent, we may collect location data to
                help you find nearby facilities, check in, or participate in location-based
                features.
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, operate, and maintain the Services and connected applications;</li>
              <li>Manage your membership, account, and program registrations;</li>
              <li>Process payments, refunds, and billing inquiries;</li>
              <li>Communicate with you about updates, offers, events, and support requests;</li>
              <li>Personalize your experience and recommend programs or content;</li>
              <li>Monitor and analyze usage trends and improve the Services;</li>
              <li>Ensure security, prevent fraud, and enforce our terms;</li>
              <li>Comply with legal obligations and protect our rights.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-3">3. Sharing Your Information</h2>
            <p>
              We do not sell your personal information. We may share information with the following
              categories of recipients:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Service Providers:</strong> Payment processors, cloud hosting providers,
                analytics providers, email delivery services, and customer support platforms.
              </li>
              <li>
                <strong>Coaches and Staff:</strong> Limited access is granted to authorized staff to
                manage programs, attendance, and member communications.
              </li>
              <li>
                <strong>Legal and Safety:</strong> We may disclose information when required by law,
                subpoena, or to protect our rights, safety, or the safety of others.
              </li>
              <li>
                <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale
                of assets, your information may be transferred as part of that transaction.
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-3">4. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar technologies to remember preferences, analyze traffic, and
              enhance your experience. You can manage cookie preferences through your browser or
              device settings. Disabling certain cookies may affect functionality.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">5. Data Security</h2>
            <p>
              We implement reasonable administrative, technical, and physical safeguards to protect
              your information. However, no method of transmission or storage is completely secure,
              and we cannot guarantee absolute security.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">6. Data Retention</h2>
            <p>
              We retain personal information for as long as necessary to fulfill the purposes
              described in this Policy, comply with legal obligations, resolve disputes, and enforce
              our agreements. When information is no longer needed, we securely delete or anonymize it.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">7. Your Rights and Choices</h2>
            <p>
              Depending on your location, you may have the right to access, correct, delete, or
              restrict processing of your personal information. You may also have the right to
              object to processing, request data portability, or withdraw consent. To exercise these
              rights, contact us at{" "}
              <a href="mailto:privacy@ncfitnessclub.com" className="text-slate-900 underline hover:no-underline">
                privacy@ncfitnessclub.com
              </a>
              .
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">8. Children's Privacy</h2>
            <p>
              The Services are not directed to children under 13. If we learn that we have collected
              personal information from a child under 13 without verified parental consent, we will
              promptly delete that information.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">9. Third-Party Links</h2>
            <p>
              The Services may contain links to third-party websites or services. We are not
              responsible for the privacy practices or content of those third parties. We encourage
              you to review their privacy policies before providing any information.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will post the revised Policy
              within the Services and update the effective date. Continued use of the Services after
              changes constitutes acceptance of the updated Policy.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">11. Contact Us</h2>
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or our data
              practices, please contact us at:
            </p>
            <p className="font-medium">
              NC Fitness Club
              <br />
              Email:{" "}
              <a href="mailto:privacy@ncfitnessclub.com" className="text-slate-900 underline hover:no-underline">
                privacy@ncfitnessclub.com
              </a>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-white/40 text-sm mt-8">
          © {new Date().getFullYear()} NC Fitness Club. All rights reserved.
        </p>
      </div>
    </main>
  );
}
