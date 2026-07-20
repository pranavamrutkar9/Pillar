import { cookies } from "next/headers";
import ClientProfileSettings from "./ClientProfileSettings";

export default async function ProfileSettingsPage() {
  const cookieStore = await cookies();
  const sessionToken = 
    cookieStore.get("next-auth.session-token")?.value || 
    cookieStore.get("__Secure-next-auth.session-token")?.value;

  return <ClientProfileSettings sessionToken={sessionToken} />;
}
