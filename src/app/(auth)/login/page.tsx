import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const nextParam = sp.next;
  const nextPath = Array.isArray(nextParam) ? nextParam[0] : nextParam;
  return <LoginForm nextPath={nextPath || "/"} />;
}

