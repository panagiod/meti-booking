import { RoomServiceClient } from "livekit-server-sdk";

// LiveKit configuration
export const LIVEKIT_CONFIG = {
  apiKey: process.env.LIVEKIT_API_KEY || "",
  apiSecret: process.env.LIVEKIT_API_SECRET || "",
  url: process.env.LIVEKIT_URL || "wss://meti-cognilab.livekit.cloud",
};

// Create LiveKit client
export function getLiveKitClient() {
  return new RoomServiceClient(LIVEKIT_CONFIG.url.replace("wss://", "https://"), LIVEKIT_CONFIG.apiKey, LIVEKIT_CONFIG.apiSecret);
}

// Generate room name for an appointment
export function generateRoomName(appointmentId: string): string {
  return `meti-appointment-${appointmentId}`;
}

// Generate token for a participant
export async function generateToken(
  roomName: string,
  participantName: string,
  participantId: string,
  metadata?: Record<string, string>
): Promise<string> {
  const { AccessToken } = await import("livekit-server-sdk");

  const token = new AccessToken(LIVEKIT_CONFIG.apiKey, LIVEKIT_CONFIG.apiSecret, {
    identity: participantId,
    name: participantName,
    metadata: metadata ? JSON.stringify(metadata) : undefined,
  });

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return token.toJwt();
}
