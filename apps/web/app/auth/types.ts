export type AuthFormState = {
  tone: "neutral" | "success" | "error";
  message: string | null;
};

export const authInitialState: AuthFormState = {
  tone: "neutral",
  message: null,
};
