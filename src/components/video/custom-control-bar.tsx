"use client";

import { Track } from "livekit-client";
import { TrackToggle, useTracks } from "@livekit/components-react";
import {
  Mic,
  Camera,
  Monitor,
  MonitorOff,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomControlBarProps {
  onToggleChat?: () => void;
  isChatOpen?: boolean;
  onLeave?: () => void;
}

export function CustomControlBar({
  onToggleChat,
  isChatOpen,
  onLeave,
}: CustomControlBarProps) {
  const tracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);
  const isScreenShareEnabled = tracks.some(
    (t) => t.publication?.isEnabled
  );

  return (
    <div className="lk-control-bar flex items-center justify-center gap-2 p-2 bg-[var(--surface)] border-t border-[var(--border)]">
      {/* Micrófono */}
      <TrackToggle
        source={Track.Source.Microphone}
        className="lk-button flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--background)]"
      >
        <Mic className="w-4 h-4" />
        <span className="hidden sm:inline">Micrófono</span>
      </TrackToggle>

      {/* Cámara */}
      <TrackToggle
        source={Track.Source.Camera}
        className="lk-button flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--background)]"
      >
        <Camera className="w-4 h-4" />
        <span className="hidden sm:inline">Cámara</span>
      </TrackToggle>

      {/* Compartir pantalla */}
      <TrackToggle
        source={Track.Source.ScreenShare}
        className="lk-button flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--background)]"
      >
        {isScreenShareEnabled ? (
          <MonitorOff className="w-4 h-4" />
        ) : (
          <Monitor className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {isScreenShareEnabled ? "Dejar de compartir" : "Compartir pantalla"}
        </span>
      </TrackToggle>

      {/* Chat */}
      <button
        onClick={onToggleChat}
        className={cn(
          "lk-button flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--background)]",
          isChatOpen && "lk-active"
        )}
      >
        <MessageSquare className="w-4 h-4" />
        <span className="hidden sm:inline">Chat</span>
      </button>

      {/* Salir */}
      <button
        onClick={onLeave}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[var(--error)] text-white hover:opacity-90 transition-opacity"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Salir</span>
      </button>
    </div>
  );
}
