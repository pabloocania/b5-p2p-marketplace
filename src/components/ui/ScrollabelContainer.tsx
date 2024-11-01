import { ReactNode } from "react";

export function ScrollableContainer({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-md mx-auto h-[calc(100vh-8rem)] overflow-y-auto p-4 rounded-lg">
      {children}
    </div>
  );
}
