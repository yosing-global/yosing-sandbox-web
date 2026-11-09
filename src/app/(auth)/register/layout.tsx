import { RegistrationStoreProvider } from "@/features/register/registration-store";

// 新規登録の store を置く（/register と /register/setup の間を移っても、レイアウトは作り直されないため、値が残る）
export default function RegisterLayout({ children }: LayoutProps<"/register">) {
  return <RegistrationStoreProvider>{children}</RegistrationStoreProvider>;
}
