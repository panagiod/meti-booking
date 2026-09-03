export const PENDING_BOOKING_KEY = "meti-pending-booking";

export function savePendingBooking(
  params: URLSearchParams | Record<string, string | null | undefined>
) {
  const bookingData: Record<string, string> = {};
  if (params instanceof URLSearchParams) {
    params.forEach((value, key) => {
      bookingData[key] = value;
    });
  } else {
    Object.entries(params).forEach(([key, value]) => {
      if (value) bookingData[key] = value;
    });
  }
  localStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify(bookingData));
}

export function clearPendingBooking() {
  localStorage.removeItem(PENDING_BOOKING_KEY);
}

function parsePendingBooking(stored: string): URLSearchParams | null {
  try {
    const data = JSON.parse(stored) as Record<string, unknown>;
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    const instructorId = params.get("instructorId") || params.get("advisorId");
    if (!instructorId || !params.get("serviceId")) {
      return null;
    }
    if (!params.get("instructorId")) {
      params.set("instructorId", instructorId);
    }
    const instructorName = params.get("instructorName") || params.get("advisorName");
    if (instructorName && !params.get("instructorName")) {
      params.set("instructorName", instructorName);
    }
    return params;
  } catch {
    return null;
  }
}

/** Read a valid pending booking without clearing it. */
export function peekPendingBooking(): URLSearchParams | null {
  const stored = localStorage.getItem(PENDING_BOOKING_KEY);
  if (!stored) return null;
  const params = parsePendingBooking(stored);
  if (!params) {
    clearPendingBooking();
    return null;
  }
  return params;
}

/** Get and clear pending booking after login. */
export function getPendingBooking(): URLSearchParams | null {
  const params = peekPendingBooking();
  clearPendingBooking();
  return params;
}
