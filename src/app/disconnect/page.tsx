import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, ArrowLeft, ExternalLink } from "lucide-react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

export const metadata: Metadata = {
  title: "Disconnect App - NC Fitness Club",
  description:
    "Disconnect NC Fitness Club from your connected social accounts and integrations.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: appUrl ? `${appUrl}/disconnect` : undefined,
  },
};

export default function DisconnectPage() {
  const disconnectUrl = appUrl ? `${appUrl}/disconnect` : "https://<your-domain>/disconnect";

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <Dumbbell className="h-6 w-6" />
            <span className="font-semibold text-lg">NC Fitness Club</span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-white/30 text-white bg-transparent hover:bg-white/10"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-slate-200/20 shadow-xl">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-3xl font-bold text-slate-900">
              Disconnect Your Account
            </CardTitle>
            <p className="text-sm text-slate-500 mt-2">
              Use this page to remove NC Fitness Club from your connected apps and integrations.
            </p>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Disconnect from Facebook
              </h2>
              <p className="text-slate-600 mb-4">
                If you connected your Facebook account to NC Fitness Club, you can remove the
                connection at any time from your Facebook settings.
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-slate-600">
                <li>Go to Facebook and sign in to the account you connected.</li>
                <li>
                  Open{" "}
                  <a
                    href="https://www.facebook.com/settings/?tab=applications"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-slate-900 underline hover:no-underline"
                  >
                    Apps and Websites
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>{" "}
                  in your Facebook settings.
                </li>
                <li>Find "NC Fitness Club" in the list of active apps.</li>
                <li>Click the app and select "Remove".</li>
                <li>Confirm that you want to remove the connection and optionally delete any data the app has shared.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Disconnect from Messenger
              </h2>
              <p className="text-slate-600 mb-4">
                If you opted in to receive Messenger updates from NC Fitness Club, you can stop
                messages directly in Messenger or through Facebook settings.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>
                  In Messenger, open the conversation with NC Fitness Club and select{" "}
                  <strong>Preferences</strong> &gt; <strong>Manage messages</strong> &gt;{" "}
                  <strong>Delete conversation</strong> or <strong>Block</strong>.
                </li>
                <li>
                  Alternatively, remove the app from Facebook as described above, which will also
                  revoke Messenger permissions.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Disconnect from NC Fitness Club Platform
              </h2>
              <p className="text-slate-600 mb-4">
                To close your NC Fitness Club platform account or delete the data we hold about you,
                please contact our support team. We will process your request in accordance with our
                Privacy Policy.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="w-full sm:w-auto">
                  <a href="mailto:support@ncfitnessclub.com">
                    Contact Support
                  </a>
                </Button>
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/privacy">View Privacy Policy</Link>
                </Button>
              </div>
            </section>

            <div className="rounded-md bg-slate-50 border border-slate-100 p-4">
              <p className="text-sm text-slate-500">
                <strong>Disconnect URL:</strong>{" "}
                <code className="text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                  {disconnectUrl}
                </code>
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Provide this URL in your app settings when a "Disconnect URL" is required.
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-white/40 text-sm mt-8">
          © {new Date().getFullYear()} NC Fitness Club. All rights reserved.
        </p>
      </div>
    </main>
  );
}
