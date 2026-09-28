import Link from "next/link";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="form-page auth-page">
      <div className="container auth-page-container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          <span aria-hidden="true">›</span>
          <Link href="/auth/login">ログイン</Link>
          <span aria-hidden="true">›</span>
          <span>パスワードを忘れた方</span>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
