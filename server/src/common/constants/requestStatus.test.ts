import { describe, expect, it } from "vitest";
import { REQUEST_STATUSES, canTransition } from "./requestStatus.js";

describe("service request transitions", () => {
  it("allows submitted requests to enter review", () => {
    expect(canTransition(REQUEST_STATUSES.SUBMITTED, REQUEST_STATUSES.UNDER_REVIEW)).toBe(
      true
    );
  });

  it("rejects skipping from submitted to completed", () => {
    expect(canTransition(REQUEST_STATUSES.SUBMITTED, REQUEST_STATUSES.COMPLETED)).toBe(
      false
    );
  });

  it("allows delivery after the client is ready", () => {
    expect(
      canTransition(REQUEST_STATUSES.READY_FOR_DELIVERY, REQUEST_STATUSES.DELIVERED)
    ).toBe(true);
  });
});
