import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Perfil e Definições</h1>
        <p className="text-zinc-400 mt-1">Gerencie os seus dados biométricos e objetivos calóricos.</p>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}
