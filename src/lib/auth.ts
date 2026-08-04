import { supabase } from "./supabase";

export type AccountType = "candidate" | "employer" | "both";

type SignUpDetails = {
  accountType: AccountType;
  emailRedirectTo: string;
  termsVersion: string;
  privacyVersion: string;
  acceptedAt: string;
};

export async function signUp(
  email: string,
  password: string,
  details: SignUpDetails,
) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: details.emailRedirectTo,
      data: {
        account_type: details.accountType,

        terms_accepted: true,
        terms_version: details.termsVersion,
        terms_accepted_at: details.acceptedAt,

        privacy_acknowledged: true,
        privacy_version: details.privacyVersion,
        privacy_acknowledged_at: details.acceptedAt,
      },
    },
  });
}

export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}