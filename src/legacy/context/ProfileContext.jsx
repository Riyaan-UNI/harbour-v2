import { createContext, useCallback, useContext, useEffect, useState } from "react";
const ProfileContext = createContext(null);
function readProfile() {
  if (typeof window === "undefined") return null;
  const normalize = (value, key) => {
    if (typeof value === "string") { try { value = JSON.parse(value); } catch { value = key === "harbour-name" ? { name: value } : null; } }
    if (!value || typeof value !== "object") return null;
    value = value.profile || value.user || value.account || value;
    const name = String(value.name || value.displayName || value.username || value.fullName || "").trim();
    if (!name) return null;
    return { ...value, name, country: value.country || value.homeCountry || "", university: value.university || value.school || "", socials: value.socials && typeof value.socials === "object" ? value.socials : {} };
  };
  // Support the canonical Harbour profile and the keys used by earlier local prototypes.
  for (const key of ["harbour-profile", "harbour-user", "harbour-local-profile", "harbour-account", "harbour-current-user", "harbour-name", "profile", "user"]) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const profile = normalize(raw, key);
      if (!profile) continue;
      if (key !== "harbour-profile") { try { localStorage.setItem("harbour-profile", JSON.stringify(profile)); } catch { /* Keep the profile usable if storage is read-only. */ } }
      return profile;
    } catch { /* One malformed legacy key should not hide another saved profile. */ }
  }
  return null;
}
export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(readProfile);
  const saveProfile = useCallback(value => {
    const next = value?.name ? { ...value, name: value.name.trim() } : null;
    try { if (next) { localStorage.setItem("harbour-profile", JSON.stringify(next)); localStorage.setItem("harbour-name", next.name); } } catch { /* State still updates for this open session if browser storage is unavailable. */ }
    setProfile(next);
    window.dispatchEvent(new Event("harbour-profile-change"));
  }, []);
  const clearProfile = useCallback(() => {
    for (const key of ["harbour-profile", "harbour-name", "harbour-user", "harbour-local-profile", "harbour-account", "harbour-current-user", "profile", "user"]) { try { localStorage.removeItem(key); } catch { /* Ignore unavailable storage. */ } }
    setProfile(null);
    window.dispatchEvent(new Event("harbour-profile-change"));
  }, []);
  useEffect(() => {
    const sync = () => setProfile(readProfile());
    window.addEventListener("storage", sync); window.addEventListener("harbour-profile-change", sync);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener("harbour-profile-change", sync); };
  }, []);
  return <ProfileContext.Provider value={{ profile, saveProfile, clearProfile }}>{children}</ProfileContext.Provider>;
}
export const useProfile = () => useContext(ProfileContext);
