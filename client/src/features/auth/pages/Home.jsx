import LoginBanner from "../components/LoginBanner";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <LoginBanner />
      <LoginForm />
    </div>
  );
}