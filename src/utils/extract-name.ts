export function extractNameFromEmail(email: string): string {
  if (!email.includes("@")) return "";

  const username = email.split("@")[0]; // before @
  const parts = username
    .replace(/[0-9]/g, "") // remove digits
    .replace(/[_\-.]+/g, " ")
    .trim()
    .split(" ") // split into words
    .filter(Boolean); // remove empty strings

  if (parts.length === 0) return "";

  // Capitalize first letter of each part
  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}
