import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorState } from "./error-state";

describe("ErrorState", () => {
  it("renders default message when none is provided", () => {
    render(<ErrorState />);
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });

  it("renders custom error message", () => {
    render(<ErrorState message="Failed to load data." />);
    expect(screen.getByText("Failed to load data.")).toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    render(<ErrorState onRetry={vi.fn()} />);
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("does not render retry button when onRetry is omitted", () => {
    render(<ErrorState />);
    expect(screen.queryByText("Try again")).not.toBeInTheDocument();
  });

  it("calls onRetry when button is clicked", () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    fireEvent.click(screen.getByText("Try again"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("message has destructive text color", () => {
    render(<ErrorState message="Oops." />);
    expect(screen.getByText("Oops.").className).toContain("text-destructive");
  });
});
