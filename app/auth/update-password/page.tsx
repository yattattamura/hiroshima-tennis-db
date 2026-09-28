import Link from "next/link";
import { UpdatePasswordForm } from "@/components/UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <div className="form-page auth-page">
      <div className="container auth-page-container">
        <div className="breadcrumb">
          <Link href="/">ホーム</Link>
          <span aria-hidden="true">›</span>
          <span>パスワード再設定</span>
        </div>
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
