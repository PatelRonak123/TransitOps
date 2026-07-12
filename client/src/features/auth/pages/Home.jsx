import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginBanner from "../components/LoginBanner";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, isAuthenticated, isLoading]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <LoginBanner />
      <LoginForm />
    </div>
  );
}
