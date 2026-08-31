"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Video, ExternalLink } from "lucide-react";

interface JoinCallButtonProps {
  appointmentId: string;
  status: string;
}

export function JoinCallButton({ appointmentId, status }: JoinCallButtonProps) {
  // Only show for confirmed appointments
  if (status !== "CONFIRMED" && status !== "IN_PROGRESS") {
    return null;
  }

  return (
    <Button asChild>
      <Link href={`/call/${appointmentId}`}>
        <Video className="w-4 h-4 mr-2" />
        Join video call
      </Link>
    </Button>
  );
}
