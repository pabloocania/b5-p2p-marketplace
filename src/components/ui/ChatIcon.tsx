import React from "react";

interface ChatIconProps {
  onClick: () => void;
}

export const ChatIcon: React.FC<ChatIconProps> = ({ onClick }) => (
  <button onClick={onClick} className="text-primary hover:text-secondary">
    {/* Replace with an actual icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 10h.01M12 10h.01M16 10h.01M21 16.5a2.5 2.5 0 01-2.5 2.5H6l-4 4V5.5A2.5 2.5 0 014.5 3h13A2.5 2.5 0 0120 5.5v11z"
      />
    </svg>
  </button>
);
