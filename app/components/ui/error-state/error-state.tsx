interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-base font-medium text-destructive">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={[
            "mt-4 px-4 py-2 text-sm font-medium rounded-md",
            "border border-border text-foreground hover:bg-muted transition-colors",
          ].join(" ")}
        >
          Try again
        </button>
      )}
    </div>
  );
}
