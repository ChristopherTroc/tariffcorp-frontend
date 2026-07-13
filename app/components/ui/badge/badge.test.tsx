import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>R1</Badge>);
    expect(screen.getByText("R1")).toBeInTheDocument();
  });

  it("uses default variant classes when no variant is specified", () => {
    const { container } = render(<Badge>label</Badge>);
    expect(container.firstChild).toHaveClass("bg-muted");
  });

  it("applies matched variant classes", () => {
    const { container } = render(<Badge variant="matched">Matched</Badge>);
    expect(container.firstChild).toHaveClass("bg-emerald-100");
  });

  it("applies unmatched variant classes", () => {
    const { container } = render(<Badge variant="unmatched">Unmatched</Badge>);
    expect(container.firstChild).toHaveClass("bg-amber-100");
  });

  it("applies destructive variant classes", () => {
    const { container } = render(<Badge variant="destructive">Error</Badge>);
    expect(container.firstChild).toHaveClass("text-destructive");
  });

  it("applies rule variant classes (font-mono)", () => {
    const { container } = render(<Badge variant="rule">R3</Badge>);
    expect(container.firstChild).toHaveClass("font-mono");
  });

  it("merges custom className", () => {
    const { container } = render(<Badge className="my-custom">X</Badge>);
    expect(container.firstChild).toHaveClass("my-custom");
  });
});
