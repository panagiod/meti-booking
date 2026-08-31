// Save pending booking before login redirect
export function savePendingBooking(params: URLSearchParams) {
  const bookingData: Record<string, string> = {};
  params.forEach((value, key) => {
    bookingData[key] = value;
  });
  localStorage.setItem("meti-pending-booking", JSON.stringify(bookingData));
}

// Get and clear pending booking after login
export function getPendingBooking(): URLSearchParams | null {
  const stored = localStorage.getItem("meti-pending-booking");
  if (!stored) return null;
  
  localStorage.removeItem("meti-pending-booking");
  const data = JSON.parse(stored);
  
  const params = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value) params.set(key, value as string);
  });
  
  // Only return if we have essential data
  if (!params.get("advisorId") || !params.get("serviceId")) {
    return null;
  }
  
  return params;
}
