import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

type SearchParams = {
  next?: string;
};

function safeNext(value?: string): string {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/account";
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const nextPath = safeNext(params.next);

  return (
    <div className="form-page auth-page">
      <div className="container auth-page-container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          <span aria-hidden="true">›</span>
          <span>アカウント作成</span>
        </div>
        <AuthForm mode="signup" nextPath={nextPath} />
      </div>
    </div>
  );
}
