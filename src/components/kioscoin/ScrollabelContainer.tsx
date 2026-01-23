import { ReactNode } from "react";

export function ScrollableContainer({ children }: { children: ReactNode }) {
  return <div className="w-full max-w-md mx-auto rounded-lg">{children}</div>;
}
