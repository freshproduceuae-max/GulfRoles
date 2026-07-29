import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  if (typeof window === "undefined") {
    // Server-side initialization
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      integrations: [
        new Sentry.Integrations.Postgres(),
        new Sentry.Integrations.Http({ tracing: true }),
      ],
      beforeSend(event, hint) {
        // Filter out certain errors in development
        if (process.env.NODE_ENV === "development") {
          if (event.exception) {
            const error = hint.originalException;
            // Log to console in development
            console.error("[Sentry]", error);
          }
        }
        return event;
      },
    });
  }
}

export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      ...(context && { custom: context }),
    },
  });
}

export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info"
) {
  Sentry.captureMessage(message, level);
}

export { Sentry };
