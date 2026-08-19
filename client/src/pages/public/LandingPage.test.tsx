import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LandingPage } from "./LandingPage";

describe("LandingPage", () => {
  it("states the SOLA promise", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Real Problems. Real Skills. Real Solutions.")).toBeTruthy();
    expect(screen.getByText("Submit a Problem")).toBeTruthy();
  });
});
