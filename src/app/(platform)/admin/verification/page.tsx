"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Brain,
  User,
  Download,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  aiAnalysis: string | null;
  aiScore: number | null;
  aiStatus: string | null;
  manualStatus: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  advisor: {
    id: string;
    user: {
      name: string;
      email: string;
    };
    speciality: string | null;
    verificationStatus: string;
    isVerified: boolean;
  };
}

export default function VerificationPage() {
  const dialog = useDialog();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/admin/verification/documents", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async (documentId: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/admin/verify-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ documentId }),
      });

      if (res.ok) {
        await fetchDocuments();
        dialog.showAlert("Éxito", "Documento analizado correctamente", "success");
      }
    } catch (error) {
      dialog.showAlert("Error", "Error al analizar documento", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApprove = async (documentId: string) => {
    setIsVerifying(true);
    try {
      const res = await fetch("/api/admin/verify-document/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ documentId, action: "approve" }),
      });

      if (res.ok) {
        await fetchDocuments();
        setSelectedDoc(null);
        dialog.showAlert("Éxito", "Documento aprobado", "success");
      }
    } catch (error) {
      dialog.showAlert("Error", "Error al aprobar", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReject = async (documentId: string) => {
    const reason = await dialog.showPrompt(
      "Rechazar documento",
      "¿Cuál es la razón del rechazo?"
    );

    if (reason) {
      setIsVerifying(true);
      try {
        const res = await fetch("/api/admin/verify-document/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ documentId, action: "reject", reason }),
        });

        if (res.ok) {
          await fetchDocuments();
          setSelectedDoc(null);
          dialog.showAlert("Éxito", "Documento rechazado", "success");
        }
      } catch (error) {
        dialog.showAlert("Error", "Error al rechazar", "error");
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const getStatusBadge = (doc: Document) => {
    if (doc.manualStatus === "APPROVED") {
      return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Aprobado</Badge>;
    }
    if (doc.manualStatus === "REJECTED") {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rechazado</Badge>;
    }
    if (doc.aiStatus === "COMPLETED") {
      return <Badge variant="warning"><Brain className="w-3 h-3 mr-1" /> Pendiente revisión</Badge>;
    }
    return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> Analizando</Badge>;
  };

  const pendingDocs = documents.filter(
    (d) => !d.manualStatus && (d.aiStatus === "COMPLETED" || d.aiStatus === "PENDING")
  );
  const reviewedDocs = documents.filter(
    (d) => d.manualStatus === "APPROVED" || d.manualStatus === "REJECTED"
  );

  if (isLoading) return <LoadingPage />;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
            Verificación de Asesores
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Revisa y aprueba los documentos de los asesores
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Pendientes</p>
                  <p className="text-2xl font-heading font-bold text-[var(--warning)]">
                    {pendingDocs.length}
                  </p>
                </div>
                <Clock className="w-5 h-5 text-[var(--warning)]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Revisados</p>
                  <p className="text-2xl font-heading font-bold text-[var(--success)]">
                    {reviewedDocs.length}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-[var(--success)]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Total</p>
                  <p className="text-2xl font-heading font-bold text-[var(--text-primary)]">
                    {documents.length}
                  </p>
                </div>
                <FileText className="w-5 h-5 text-[var(--text-primary)]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Viewer or List */}
        {selectedDoc ? (
          <div className="space-y-4">
            {/* Back button */}
            <Button
              variant="ghost"
              onClick={() => setSelectedDoc(null)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la lista
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Document Preview */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {selectedDoc.fileName}
                      </CardTitle>
                      {getStatusBadge(selectedDoc)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Document preview */}
                    <div className="rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--background)]">
                      {selectedDoc.mimeType === "application/pdf" ? (
                        <iframe
                          src={selectedDoc.fileUrl}
                          className="w-full h-[500px]"
                          title={selectedDoc.fileName}
                        />
                      ) : (
                        <img
                          src={selectedDoc.fileUrl}
                          alt={selectedDoc.fileName}
                          className="w-full h-auto max-h-[500px] object-contain"
                        />
                      )}
                    </div>

                    {/* Download link */}
                    <div className="mt-4">
                      <a
                        href={selectedDoc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Abrir en nueva pestaña
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Document Info */}
              <div className="space-y-4">
                {/* Advisor info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Asesor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium text-[var(--text-primary)]">
                      {selectedDoc.advisor.user.name}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {selectedDoc.advisor.user.email}
                    </p>
                    {selectedDoc.advisor.speciality && (
                      <p className="text-sm text-[var(--text-muted)] mt-1">
                        {selectedDoc.advisor.speciality}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Document details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Detalles del documento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Tipo</span>
                      <span>{selectedDoc.documentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Tamaño</span>
                      <span>{(selectedDoc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Subido</span>
                      <span>{new Date(selectedDoc.createdAt).toLocaleDateString()}</span>
                    </div>
                    {selectedDoc.verifiedAt && (
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Verificado</span>
                        <span>{new Date(selectedDoc.verifiedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Analysis */}
                {selectedDoc.aiAnalysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Análisis IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 rounded-lg bg-[var(--background)] text-sm">
                        {JSON.parse(selectedDoc.aiAnalysis).observations}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-[var(--text-muted)]">Confianza:</span>
                        <span className="font-bold text-[var(--primary)]">
                          {selectedDoc.aiScore}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                {!selectedDoc.manualStatus && (
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Acciones
                      </p>
                      {selectedDoc.aiStatus === "PENDING" && (
                        <Button
                          className="w-full"
                          variant="secondary"
                          onClick={() => handleAnalyze(selectedDoc.id)}
                          disabled={isAnalyzing}
                        >
                          <Brain className="w-4 h-4 mr-1" />
                          {isAnalyzing ? "Analizando..." : "Analizar con IA"}
                        </Button>
                      )}
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleApprove(selectedDoc.id)}
                          disabled={isVerifying}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleReject(selectedDoc.id)}
                          disabled={isVerifying}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Rejection reason */}
                {selectedDoc.rejectionReason && (
                  <Card className="border-[var(--error)]">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-[var(--error)] mb-1">
                        Razón de rechazo
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {selectedDoc.rejectionReason}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Documentos pendientes de revisión</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingDocs.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Sin documentos pendientes"
                  description="Todos los documentos han sido revisados."
                />
              ) : (
                <div className="space-y-3">
                  {pendingDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-[var(--background)] hover:bg-[var(--border-light)] transition-colors cursor-pointer"
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[var(--primary-light)] flex items-center justify-center">
                          <FileText className="w-6 h-6 text-[var(--primary)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {doc.fileName}
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">
                            {doc.advisor.user.name} • {doc.documentType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(doc)}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoc(doc);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog state={dialog} />
    </>
  );
}
