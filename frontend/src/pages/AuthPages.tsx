import {
  LoginPage as LoginFeature,
  RegisterPage as RegisterFeature,
} from "@/features/auth";

export function LoginPage() {
  return <LoginFeature />;
}

export function RegisterPage() {
  return <RegisterFeature />;
}
