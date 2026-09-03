"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LiveKitRoom,
  LayoutContextProvider,
  RoomAudioRenderer,
  ParticipantTile,
  useTracks,
  useConnectionState,
  useRoomContext,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";
import "@livekit/components-styles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingPage } from "@/components/ui/loading";
import { ChatPanel } from "@/components/video/chat-panel";
import { CustomControlBar } from "@/components/video/custom-control-bar";
import { TimeWarning } from "@/components/video/time-warning";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { VideoOff, Mic, Info } from "lucide-react";

interface VideoCallProps {
  appointmentId: string;
  userRole: "advisor" | "client";
  userName: string;
  userId: string;
}

interface AppointmentData {
  scheduledAt: string;
  durationMin: number;
}

function CallContent({
  appointmentId,
  userRole,
  userId,
  appointment,
}: {
  appointmentId: string;
  userRole: "advisor" | "client";
  userId: string;
  appointment: AppointmentData | null;
}) {
  const connectionState = useConnectionState();
  const isConnected = connectionState === ConnectionState.Connected;
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const room = useRoomContext();
  const router = useRouter();

  const { isListening, isSupported, transcript, start, stop } =
    useSpeechRecognition({
      language: "en-US",
    });

  // Start transcription when connected
  useEffect(() => {
    if (isConnected && isSupported) {
      start();
    }
    return () => {
      if (isListening) {
        stop();
      }
    };
  }, [isConnected]);

  const handleLeave = useCallback(async () => {
    // Stop transcription
    if (isListening) {
      stop();
    }

    // If there is a transcript, generate a summary before leaving
    if (transcript && transcript.trim().length > 50) {
      setIsGeneratingSummary(true);
      try {
        await fetch(`/api/appointments/${appointmentId}/summary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ transcript }),
        });
      } catch (error) {
        console.error("Error generating summary:", error);
      }
    }

    // Disconnect and navigate
    room?.disconnect();
    if (userRole === "client") {
      router.push(`/dashboard/appointments/${appointmentId}/review`);
    } else {
      router.push("/dashboard/appointments");
    }
  }, [
    room,
    userRole,
    appointmentId,
    router,
    isListening,
    stop,
    transcript,
  ]);

  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  if (!isConnected) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <LoadingPage label="Connecting to room..." className="min-h-0" />
      </div>
    );
  }

  return (
    <LayoutContextProvider>
      <div className="h-full flex flex-col">
        {/* Participant grid */}
        <div className="flex-1 min-h-0 p-2">
          <div
            className={`h-full gap-2 ${
              tracks.length <= 1
                ? "grid grid-cols-1"
                : tracks.length <= 2
                ? "grid grid-cols-2"
                : "grid grid-cols-2 grid-rows-2"
            }`}
          >
            {tracks.map((track, index) => (
              <div
                key={`${track.source}-${track.participant?.identity ?? index}`}
                className="relative rounded-lg overflow-hidden bg-[var(--surface)]"
              >
                <ParticipantTile
                  trackRef={track}
                  className="h-full w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Transcription indicator */}
        {isSupported && (
          <div className="absolute top-4 left-4 z-20">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isListening
                  ? "bg-[var(--success)] text-white"
                  : "bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]"
              }`}
            >
              <Mic className="w-3 h-3" />
              {isListening ? "Transcribing..." : "Transcription disabled"}
            </div>
          </div>
        )}

        {/* Subtle Chrome banner (only when not supported) */}
        {!isSupported && (
          <div className="absolute top-4 left-4 z-20">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]">
              <Info className="w-3 h-3" />
              <span>Use Chrome for automatic summaries</span>
            </div>
          </div>
        )}

        {/* Control bar */}
        <CustomControlBar
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
          isChatOpen={isChatOpen}
          onLeave={handleLeave}
        />

        {/* Audio */}
        <RoomAudioRenderer />
      </div>

      {/* Remaining time warning */}
      {appointment && (
        <TimeWarning
          scheduledAt={appointment.scheduledAt}
          durationMin={appointment.durationMin}
        />
      )}

      <ChatPanel
        appointmentId={appointmentId}
        currentUserId={userId}
        currentUserRole={userRole}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />

      {/* Generating summary modal */}
      {isGeneratingSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-sm">
            <CardContent className="p-8 text-center">
              <LoadingPage label="Generating session summary..." className="min-h-0" />
              <p className="text-sm text-[var(--text-muted)] mt-4">
                AI is processing the meeting notes.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </LayoutContextProvider>
  );
}

export function VideoCall({
  appointmentId,
  userRole,
  userName,
  userId,
}: VideoCallProps) {
  const [token, setToken] = useState<string | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await fetch(`/api/appointments/${appointmentId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setAppointment(data.appointment);
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  useEffect(() => {
    const getToken = async () => {
      try {
        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ appointmentId }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to get token");
        }

        const data = await res.json();
        setToken(data.token);
        setRoomUrl(data.url);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    getToken();
  }, [appointmentId]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingPage label="Preparing video call..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--error-light)] flex items-center justify-center mx-auto mb-4">
            <VideoOff className="w-8 h-8 text-[var(--error)]" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-2">
            Connection error
          </h2>
          <p className="text-[var(--text-muted)] mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (!token || !roomUrl) {
    return null;
  }

  return (
    <div className="relative h-[calc(100vh-8rem)]">
      <LiveKitRoom
        token={token}
        serverUrl={roomUrl}
        connect={true}
        video={true}
        audio={true}
        data-lk-theme="default"
        style={{ height: "100%" }}
      >
        <CallContent
          appointmentId={appointmentId}
          userRole={userRole}
          userId={userId}
          appointment={appointment}
        />
      </LiveKitRoom>
    </div>
  );
}
