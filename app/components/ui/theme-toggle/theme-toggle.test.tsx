import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "./theme-toggle";

const mockSetTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: vi.fn(),
}));

import { useTheme } from "next-themes";
const mockUseTheme = vi.mocked(useTheme);

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockSetTheme.mockReset();
  });

  it("renders a button (not null) when resolvedTheme is undefined — jsdom runs effects synchronously", async () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: undefined,
      setTheme: mockSetTheme,
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);
    // In jsdom, useEffect runs synchronously inside act, so mounted=true immediately.
    // With resolvedTheme=undefined, isDark=false, so the moon icon button is rendered.
    const btn = await screen.findByRole("button");
    expect(btn).toHaveAttribute("aria-label", "Switch to dark mode");
  });

  it("renders moon icon button in light mode after mount", async () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: "light",
      setTheme: mockSetTheme,
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);
    // useEffect runs synchronously in jsdom
    const btn = await screen.findByRole("button");
    expect(btn).toHaveAttribute("aria-label", "Switch to dark mode");
  });

  it("renders sun icon button in dark mode after mount", async () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: "dark",
      setTheme: mockSetTheme,
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);
    const btn = await screen.findByRole("button");
    expect(btn).toHaveAttribute("aria-label", "Switch to light mode");
  });

  it("calls setTheme with 'dark' when in light mode and button is clicked", async () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: "light",
      setTheme: mockSetTheme,
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);
    const btn = await screen.findByRole("button");
    fireEvent.click(btn);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("calls setTheme with 'light' when in dark mode and button is clicked", async () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: "dark",
      setTheme: mockSetTheme,
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);
    const btn = await screen.findByRole("button");
    fireEvent.click(btn);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });
});
