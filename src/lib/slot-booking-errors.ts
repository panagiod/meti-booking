export class SlotBookingError extends Error {
  constructor(
    message: string,
    readonly code:
      | "INVALID_TIME"
      | "INACTIVE_DAY"
      | "SLOT_UNAVAILABLE"
      | "INSTRUCTOR_INACTIVE"
      | "SERVICE_MISMATCH"
  ) {
    super(message);
    this.name = "SlotBookingError";
  }
}
