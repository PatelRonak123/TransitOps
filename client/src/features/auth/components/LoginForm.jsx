import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import useLogin from "../hooks/useLogin";

export default function LoginForm() {

    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { login, isLoading, error } = useLogin();

    const onSubmit = async (formData) => {
        try {
            const response = await login(formData);

            if (response?.success) {
                navigate("/dashboard", { replace: true });
            }
        } catch (submissionError) {
            const message = submissionError?.response?.data?.message || "Login failed.";
            setError("root", { message });
        }
    };

    return (

        <div className="flex items-center justify-center bg-slate-50 px-6 py-12 lg:px-10">

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60"
            >

                <div>

                    <h2 className="text-3xl font-bold text-slate-900">
                        Sign In
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Enter your credentials
                    </p>

                </div>

                <input
                    {...register("email", {
                        required: "Email is required",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Enter a valid email address",
                        },
                    })}
                    type="email"
                    placeholder="Email"
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />

                {errors.email && (
                    <p className="-mt-3 text-sm text-red-600">
                        {errors.email.message}
                    </p>
                )}

                <div className="relative">
                    <input
                        {...register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 6,
                                message: "Password must be at least 6 characters",
                            },
                        })}
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="w-full rounded-xl border border-slate-200 p-3 pr-12 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-500 transition hover:text-slate-800"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {errors.password && (
                    <p className="-mt-3 text-sm text-red-600">
                        {errors.password.message}
                    </p>
                )}

                <div className="flex justify-between text-sm text-slate-600">

                    <label>

                        <input type="checkbox" />

                        Remember Me

                    </label>

                    <a href="#" className="text-orange-600 hover:text-orange-700">
                        Forgot Password?
                    </a>

                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-orange-500 py-3 font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isLoading ? "Signing in..." : "Sign In"}
                </button>

                {(error || errors.root?.message) && (
                    <p className="text-sm text-red-600">
                        {error || errors.root?.message}
                    </p>
                )}

            </form>

        </div>
    );
}