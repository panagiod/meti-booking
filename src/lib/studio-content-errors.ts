export class StudioContentParseError extends Error {
  constructor(message = "Stored studio content failed validation") {
    super(message);
    this.name = "StudioContentParseError";
  }
}
