import type { User } from "@supabase/supabase-js";
import type { Role } from "@/types";
import { getSupabaseClient } from "@/lib/supabase";

export function getRoleFromUserMetadata(user: User): Role {
  const role = user.user_metadata?.role;
  if (typeof role === "string") {
    const normalizedRole = role.trim().toLowerCase();
    if (normalizedRole === "parent") return "parent";
    if (normalizedRole === "asha" || normalizedRole === "asha worker") return "asha";
  }

  throw new Error("Your account does not have a supported Parent or ASHA Worker role.");
}

export async function registerWithPassword(
  email: string,
  password: string,
  selectedRole: Role,
  fullName: string,
): Promise<void> {
  const { error } = await getSupabaseClient().auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { role: selectedRole, full_name: fullName.trim() },
    },
  });

  if (error) throw error;
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  const redirectTo = typeof window === "undefined" ? undefined : `${window.location.origin}/login`;
  const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email.trim(), {
    redirectTo,
  });
  if (error) throw error;
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await getSupabaseClient().auth.updateUser({ password });
  if (error) throw error;
}

export function onPasswordRecovery(callback: () => void): () => void {
  const { data } = getSupabaseClient().auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") callback();
  });
  return () => data.subscription.unsubscribe();
}

export async function loginWithPassword(email: string, password: string) {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw error;
  if (!data.session || !data.user) {
    throw new Error("Supabase did not return an authenticated user session.");
  }

  let role: Role;
  try {
    role = getRoleFromUserMetadata(data.user);
  } catch (error) {
    await getSupabaseClient().auth.signOut();
    throw error;
  }

  const profile = {
    id: data.user.id,
    email: data.user.email ?? null,
    full_name: String(data.user.user_metadata?.full_name ?? ""),
    role,
  };
  localStorage.setItem("access_token", data.session.access_token);
  localStorage.setItem("user_profile", JSON.stringify(profile));

  return { role, profile };
}

export async function logout() {
  const { error } = await getSupabaseClient().auth.signOut();
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_profile");
  if (error) throw error;
}
