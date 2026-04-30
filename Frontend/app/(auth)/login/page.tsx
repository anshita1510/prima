import { Suspense } from "react";
import LoginCard from "./_components/LoginCard";
import PageWrapper from "./_components/PageWrapper";

export default function LoginPage() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8 sm:px-6"
      style={{
        backgroundColor: "var(--bg-color)",
        backgroundImage: [
          "radial-gradient(ellipse at 20% 20%, rgba(37,99,235,0.07) 0%, transparent 55%)",
          "radial-gradient(ellipse at 80% 80%, rgba(124,58,237,0.07) 0%, transparent 55%)",
        ].join(", "),
      }}
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-[8%] top-[10%] h-64 w-64 animate-pulse rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, rgba(96,165,250,0.5), transparent)" }} />
        <div className="absolute right-[10%] top-[30%] h-48 w-48 animate-pulse rounded-full blur-3xl opacity-15 [animation-delay:1s]"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5), transparent)" }} />
        <div className="absolute bottom-[15%] left-1/3 h-56 w-56 animate-pulse rounded-full blur-3xl opacity-10 [animation-delay:2s]"
          style={{ background: "radial-gradient(circle, rgba(167,139,250,0.5), transparent)" }} />
      </div>

      <PageWrapper>
        <Suspense
          fallback={
            <div
              className="mx-auto flex h-[580px] max-w-[1024px] animate-pulse items-center justify-center rounded-[24px]"
              style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}
            >
              <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: "var(--card-border)", borderTopColor: "var(--primary-color)" }}
              />
            </div>
          }
        >
          <LoginCard />
        </Suspense>
      </PageWrapper>
    </div>
  );
}