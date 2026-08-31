"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Badge } from "@/components/ui/badge";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import {
  Save,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Lock,
  Shield,
  TestTube,
  Rocket,
} from "lucide-react";
import { sileo } from "sileo";

export default function MercadoPagoPage() {
  const dialog = useDialog();
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [mpMode, setMpMode] = useState<"TEST" | "PRODUCTION">("PRODUCTION");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const res = await fetch("/api/advisor/mercadopago", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.publicKey) {
          setPublicKey(data.publicKey);
          setAccessToken(data.accessToken ? "••••••••••••••••" : "");
          setIsConnected(true);
        }
        if (data.mpMode) {
          setMpMode(data.mpMode);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!publicKey || !accessToken) {
      dialog.showAlert(
        "Required fields",
        "Public Key and Access Token are required",
        "warning"
      );
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/advisor/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ publicKey, accessToken, mpMode }),
      });

      if (res.ok) {
        setIsConnected(true);
        setHasChanges(false);
        dialog.showAlert("Success", "Credentials saved successfully", "success");
      } else {
        const data = await res.json();
        dialog.showAlert("Error", data.error || "Failed to save credentials", "error");
      }
    } catch (error) {
      dialog.showAlert("Error", "Connection error", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleModeSwitch = async (newMode: "TEST" | "PRODUCTION") => {
    if (newMode === mpMode) return;

    if (newMode === "PRODUCTION" && isConnected) {
      const confirmed = await dialog.showConfirm(
        "Switch to Production mode",
        "Switching to production will delete all test appointments. Continue?",
        "warning"
      );
      if (!confirmed) return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/advisor/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mpMode: newMode }),
      });

      if (res.ok) {
        const data = await res.json();
        setMpMode(newMode);

        if (data.deletedTestCount > 0) {
          sileo.success({
            title: "Production mode enabled",
            description: `${data.deletedTestCount} test appointment(s) deleted.`,
          });
        } else {
          sileo.success({
            title: newMode === "TEST" ? "Test mode enabled" : "Production mode enabled",
            description: newMode === "TEST"
              ? "Appointments created now are test appointments and do not charge real money."
              : "Test appointments deleted. Make sure to use production credentials.",
          });
        }
      } else {
        const data = await res.json();
        dialog.showAlert("Error", data.error || "Failed to change mode", "error");
      }
    } catch (error) {
      dialog.showAlert("Error", "Connection error", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingPage />;

  const isTestMode = mpMode === "TEST";

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
              Payment Settings
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              Connect your Mercado Pago account to receive payments directly
            </p>
          </div>
          <Badge
            variant={isTestMode ? "warning" : "success"}
            className="w-fit text-sm px-3 py-1.5"
          >
            {isTestMode ? (
              <><TestTube className="w-4 h-4 mr-1.5" /> Test Mode</>
            ) : (
              <><Rocket className="w-4 h-4 mr-1.5" /> Production Mode</>
            )}
          </Badge>
        </div>

        {/* Test mode banner */}
        {isTestMode && (
          <Card className="border-[var(--warning)] bg-[var(--warning-light)]">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <TestTube className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[var(--text-primary)]">
                    You are in test mode
                  </p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Appointments created are test appointments and do not charge real money. You can
                    test the full purchase flow without spending. When switching to
                    production, all test appointments will be deleted.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Status & Mode */}
          <div className="lg:col-span-1 space-y-6">
            {/* Connection Status */}
            <Card className={isConnected ? "border-[var(--success)]" : ""}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isConnected ? "bg-[var(--success-light)]" : "bg-[var(--warning-light)]"}`}>
                    {isConnected ? (
                      <CheckCircle className="w-6 h-6 text-[var(--success)]" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-[var(--warning)]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-[var(--text-primary)]">
                      {isConnected ? "Connected" : "Not connected"}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {isConnected
                        ? "Ready to receive payments"
                        : "Set up your credentials"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mode Switch */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Operating mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => handleModeSwitch("TEST")}
                  disabled={isSaving || isTestMode}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isTestMode
                      ? "border-[var(--warning)] bg-[var(--warning-light)]"
                      : "border-[var(--border)] hover:border-[var(--warning)]/50"
                  } ${isSaving ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <TestTube className={`w-5 h-5 ${isTestMode ? "text-[var(--warning)]" : "text-[var(--text-muted)]"}`} />
                    <div>
                      <p className="font-medium text-sm text-[var(--text-primary)]">Test</p>
                      <p className="text-xs text-[var(--text-muted)]">Test cards, no real charges</p>
                    </div>
                    {isTestMode && <CheckCircle className="w-4 h-4 text-[var(--warning)] ml-auto" />}
                  </div>
                </button>

                <button
                  onClick={() => handleModeSwitch("PRODUCTION")}
                  disabled={isSaving || !isTestMode}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    !isTestMode
                      ? "border-[var(--success)] bg-[var(--success-light)]"
                      : "border-[var(--border)] hover:border-[var(--success)]/50"
                  } ${isSaving ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <Rocket className={`w-5 h-5 ${!isTestMode ? "text-[var(--success)]" : "text-[var(--text-muted)]"}`} />
                    <div>
                      <p className="font-medium text-sm text-[var(--text-primary)]">Production</p>
                      <p className="text-xs text-[var(--text-muted)]">Real payments, money in your account</p>
                    </div>
                    {!isTestMode && <CheckCircle className="w-4 h-4 text-[var(--success)] ml-auto" />}
                  </div>
                </button>
              </CardContent>
            </Card>

            {/* How it works */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">How does it work?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[var(--primary)]">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[var(--text-primary)]">Client paga</p>
                      <p className="text-xs text-[var(--text-muted)]">Uses MP Checkout PRO</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[var(--accent)]">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[var(--text-primary)]">You receive your earnings</p>
                      <p className="text-xs text-[var(--text-muted)]">Money goes to your MP account</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--warning-light)] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[var(--warning)]">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[var(--text-primary)]">Monthly fee</p>
                      <p className="text-xs text-[var(--text-muted)]">You receive an invoice for the platform fee</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help link */}
            <div className="text-center">
              <a
                href="https://www.mercadopago.com.ar/developers"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                MP Documentation
              </a>
            </div>
          </div>

          {/* Right Column - Credentials Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Credentials {isTestMode ? "for Test" : "for Production"}
                </CardTitle>
                <CardDescription>
                  {isTestMode
                    ? "Use Mercado Pago test credentials. Payments are not real."
                    : "These credentials are used to process real payments. They are confidential."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    Public Key
                  </label>
                  <Input
                    type="text"
                    value={publicKey}
                    onChange={(e) => {
                      setPublicKey(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="APP_USR-xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Endd it in Your account → Developers → Credentials
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    Access Token
                  </label>
                  <PasswordInput
                    value={accessToken}
                    onChange={(e) => {
                      setAccessToken(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="APP_USR-xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Never share this token. It is used to create payment preferences.
                  </p>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save credentials"}
                  </Button>

                  {isConnected && (
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Conectado
                    </Badge>
                  )}
                </div>

                {/* Security note */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--accent-light)] mt-4">
                  <Shield className="w-4 h-4 text-[var(--accent)] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-[var(--text-secondary)]">
                    Your credentials are stored encrypted. They are never shown in full in the interface.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog state={dialog} />
    </>
  );
}
