import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "End-User License Agreement - NC Fitness Club",
  description:
    "Terms and conditions governing use of NC Fitness Club applications and connected services.",
};

export default function LicensePage() {
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
              End-User License Agreement
            </CardTitle>
            <p className="text-sm text-slate-500 mt-2">Last updated: June 24, 2026</p>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none p-6 sm:p-8">
            <p>
              This End-User License Agreement ("EULA" or "Agreement") is a legal agreement between
              you ("End User," "you," or "your") and NC Fitness Club ("Company," "we," "us," or
              "our") governing your access to and use of the NC Fitness Club mobile applications,
              web applications, and connected services (collectively, the "Apps").
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>
              By downloading, installing, accessing, or using the Apps, you agree to be bound by
              this EULA. If you do not agree to these terms, do not install, access, or use the
              Apps. You may not use the Apps unless you are at least 13 years of age (or the age of
              legal majority in your jurisdiction).
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">2. License Grant</h2>
            <p>
              Subject to your compliance with this EULA, we grant you a limited, non-exclusive,
              non-transferable, revocable license to use the Apps on devices that you own or control
              for personal, non-commercial use. This license does not grant you any ownership rights
              in the Apps or their content.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">3. Connected Services</h2>
            <p>
              The Apps connect to NC Fitness Club platform services, including scheduling,
              membership management, communication, and payment processing. Access to these services
              requires a valid account and active membership in good standing where applicable. You
              are responsible for maintaining the confidentiality of your account credentials.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">4. Restrictions</h2>
            <p>You may not:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Copy, modify, distribute, sell, lease, or sublicense the Apps or any part thereof;</li>
              <li>Reverse engineer, decompile, disassemble, or attempt to derive source code;</li>
              <li>Remove or alter any copyright, trademark, or proprietary notices;</li>
              <li>Use the Apps for unlawful, fraudulent, abusive, or harmful purposes;</li>
              <li>Interfere with the security, availability, or integrity of the platform;</li>
              <li>Automate access or scrape data without our prior written consent.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-3">5. Accounts and Security</h2>
            <p>
              You are responsible for all activity occurring under your account. You must provide
              accurate and complete information and promptly update any changes. Notify us
              immediately of any unauthorized use or security breach.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">6. Membership and Payments</h2>
            <p>
              Fees for programs, memberships, or services purchased through the Apps are governed by
              the terms presented at the point of purchase and our applicable membership agreements.
              All payments are processed through secure third-party payment processors and are
              subject to their terms and conditions.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">7. Privacy</h2>
            <p>
              Your privacy is important to us. Our collection and use of personal information is
              described in our{" "}
              <Link href="/privacy" className="text-slate-900 underline hover:no-underline">
                Privacy Policy
              </Link>
              . By using the Apps, you consent to the practices described therein.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">8. Intellectual Property</h2>
            <p>
              All content, trademarks, logos, and software associated with the Apps are owned by or
              licensed to NC Fitness Club and are protected by applicable intellectual property
              laws. Nothing in this EULA grants you any rights to use our trademarks without prior
              written permission.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">9. Termination</h2>
            <p>
              We may suspend or terminate your license and access to the Apps at any time, with or
              without notice, if you violate this EULA or for any other reason in our sole discretion.
              Upon termination, you must cease all use of the Apps and delete all copies from your
              devices.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">10. Disclaimers</h2>
            <p>
              The Apps are provided "as is" and "as available" without warranties of any kind,
              either express or implied. We do not warrant that the Apps will be uninterrupted,
              error-free, or secure. Use of the Apps for fitness activities is at your own risk; you
              should consult a physician before beginning any exercise program.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">11. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, NC Fitness Club shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising out of or
              relating to your use of the Apps, even if advised of the possibility of such damages.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">12. Governing Law</h2>
            <p>
              This EULA shall be governed by and construed in accordance with the laws of the State of
              North Carolina, without regard to conflict of laws principles. Any dispute arising
              under this Agreement shall be resolved in the state or federal courts located in
              North Carolina.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">13. Changes to this Agreement</h2>
            <p>
              We may update this EULA from time to time. We will notify you of material changes by
              posting the revised Agreement within the Apps or by other reasonable means. Continued
              use of the Apps after changes become effective constitutes acceptance of the revised
              terms.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-3">14. Contact Us</h2>
            <p>
              If you have questions about this EULA, please contact us at{" "}
              <a href="mailto:support@ncfitnessclub.com" className="text-slate-900 underline hover:no-underline">
                support@ncfitnessclub.com
              </a>
              .
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
