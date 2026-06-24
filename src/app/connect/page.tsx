import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, ArrowRight, Shield, MessageCircle, Users } from "lucide-react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

export const metadata: Metadata = {
  title: "Connect App - NC Fitness Club",
  description:
    "Connect or reconnect NC Fitness Club to your Facebook account and other integrations.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: appUrl ? `${appUrl}/connect` : undefined,
  },
};

export default function ConnectPage() {
  const connectUrl = appUrl ? `${appUrl}/connect` : "https://<your-domain>/connect";

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
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-slate-200/20 shadow-xl">
          <CardHeader className="border-b border-slate-100 text-center">
            <CardTitle className="text-3xl font-bold text-slate-900">
              Connect to NC Fitness Club
            </CardTitle>
            <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
              Connect or reconnect your account to enable messaging, scheduling, and community
              features.
            </p>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-slate-700" />
                <p className="text-sm font-medium text-slate-900">Secure Login</p>
                <p className="text-xs text-slate-500 mt-1">Sign in with your existing account.</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-slate-700" />
                <p className="text-sm font-medium text-slate-900">Facebook Groups</p>
                <p className="text-xs text-slate-500 mt-1">Share updates with your community.</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center">
                <MessageCircle className="h-6 w-6 mx-auto mb-2 text-slate-700" />
                <p className="text-sm font-medium text-slate-900">Messenger</p>
                <p className="text-xs text-slate-500 mt-1">Receive coaching messages.</p>
              </div>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Connect with Facebook
              </h2>
              <p className="text-slate-600 mb-4">
                Connecting with Facebook lets NC Fitness Club share updates to your Facebook Page
                and Groups, and send you coaching messages via Messenger if you choose to opt in.
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-slate-600">
                <li>Click the button below to sign in to your NC Fitness Club account.</li>
                <li>Go to the Integrations or Settings section of your dashboard.</li>
                <li>Select Facebook and follow the prompts to authorize the connection.</li>
                <li>Choose which Pages and Groups you want to connect.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Reconnect an Existing Account
              </h2>
              <p className="text-slate-600 mb-4">
                If your connection expired or was removed, sign in again and reconnect the
                integration from your dashboard. You will not lose any account history.
              </p>
            </section>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/login">
                  Sign In to Connect
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="w-full sm:w-auto">
                <Link href="/disconnect">Need to Disconnect?</Link>
              </Button>
            </div>

            <div className="rounded-md bg-slate-50 border border-slate-100 p-4">
              <p className="text-sm text-slate-500">
                <strong>Connect URL:</strong>{" "}
                <code className="text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                  {connectUrl}
                </code>
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Provide this URL in your app settings when a "Connect URL" is required.
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
