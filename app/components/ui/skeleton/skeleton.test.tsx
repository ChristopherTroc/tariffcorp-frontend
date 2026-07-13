import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton, SkeletonCard, SkeletonTable } from "./skeleton";

describe("Skeleton", () => {
  it("renders with animate-pulse class", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });

  it("is aria-hidden", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("merges custom className", () => {
    const { container } = render(<Skeleton className="h-8 w-32" />);
    expect(container.firstChild).toHaveClass("h-8", "w-32");
  });
});

describe("SkeletonCard", () => {
  it("renders two skeleton elements inside a card wrapper", () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelectorAll(".animate-pulse").length).toBe(2);
  });
});

describe("SkeletonTable", () => {
  it("renders header skeleton + default 5 row skeletons", () => {
    const { container } = render(<SkeletonTable />);
    expect(container.querySelectorAll(".animate-pulse").length).toBe(6);
  });

  it("renders header skeleton + custom number of row skeletons", () => {
    const { container } = render(<SkeletonTable rows={3} />);
    expect(container.querySelectorAll(".animate-pulse").length).toBe(4);
  });
});
