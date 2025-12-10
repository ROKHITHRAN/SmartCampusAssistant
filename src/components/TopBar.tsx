// src/components/TopBar.tsx
import { useAuth } from "../contexts/AuthContext";
import { extractNameFromEmail } from "../utils/extract-name";

interface TopBarProps {
  title: string;
}

const TopBar = ({ title }: TopBarProps) => {
  const { currentUser } = useAuth();

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "";

  const displayName = extractNameFromEmail(currentUser?.email || "");

  return (
    <div
      className={`
        h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8
        fixed top-0 right-0 left-0 md:left-64 shadow-sm z-10
        transition-all duration-300
      `}
    >
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>

      {currentUser && (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">{displayName}</p>
            <p className="text-xs text-gray-500">{currentUser.email}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold shadow-md">
            {getInitials(displayName)}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;
