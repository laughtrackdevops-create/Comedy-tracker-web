import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "../Navbar";
import { Session } from "@supabase/supabase-js";

// Mock supabase client
vi.mock("../../lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}));

const mockSession = {
  user: {
    id: "test-user-id",
    email: "test@example.com",
  },
} as unknown as Session;

describe("Navbar", () => {
  it("renders the app title", () => {
    render(<Navbar session={mockSession} />);
    expect(screen.getByText(/Comedy Tracker/i)).toBeInTheDocument();
  });

  it("displays the user email when session is present", () => {
    render(<Navbar session={mockSession} />);
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("renders sign out button when session is present", () => {
    render(<Navbar session={mockSession} />);
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  it("hides user info when session is null", () => {
    render(<Navbar session={null} />);
    expect(screen.queryByText("test@example.com")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sign out/i })).not.toBeInTheDocument();
  });
});
