import { useState } from "react";
import { BriefcaseBusiness, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import useLogin from "../hooks/useLogin";

const roles = [
    {
        value: "Fleet Manager",
        label: "Fleet Manager",
        hint: "Full fleet control",
        color: "border-orange-300 bg-orange-50 text-orange-700 ring-orange-100",
    },
    {
        value: "Dispatcher",
        label: "Dispatcher",
        hint: "Trips and routing",
        color: "border-blue-300 bg-blue-50 text-blue-700 ring-blue-100",
    },
    {
        value: "Safety Officer",
        label: "Safety Officer",
        hint: "Compliance view",
        color: "border-emerald-300 bg-emerald-50 text-emerald-700 ring-emerald-100",
    },
    {
        value: "Financial Analyst",
        label: "Financial Analyst",
        hint: "Cost insights",
        color: "border-violet-300 bg-violet-50 text-violet-700 ring-violet-100",
    },
];

export default function LoginForm() {

    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        defaultValues: {
            email: "",
            password: "",
            role: "Fleet Manager",
            rememberMe: false,
        },
    });

    const { login, isLoading, error } = useLogin();
    const selectedRole = useWatch({ control, name: "role" });

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

                

                {errors.role && (
                    <p className="-mt-3 text-sm text-red-600">
                        {errors.role.message}
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

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <ShieldCheck size={17} className="text-orange-500" />
                        Select Role
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {roles.map((role) => {
                            const isSelected = selectedRole === role.value;

                            return (
                                <label
                                    key={role.value}
                                    className={`group relative cursor-pointer rounded-2xl border p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                                        isSelected
                                            ? `${role.color} scale-[1.02] shadow-md ring-4`
                                            : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50/40"
                                    }`}
                                >
                                    <input
                                        {...register("role", {
                                            required: "Role is required",
                                        })}
                                        type="radio"
                                        value={role.value}
                                        className="sr-only"
                                    />

                                    <span
                                        className={`absolute right-3 top-3 h-2.5 w-2.5 rounded-full transition ${
                                            isSelected ? "scale-125 bg-current" : "bg-slate-300 group-hover:bg-orange-300"
                                        }`}
                                    />

                                    <span className="flex items-start gap-3">
                                        <span
                                            className={`mt-0.5 rounded-xl p-2 transition ${
                                                isSelected ? "bg-white/80" : "bg-slate-100 text-slate-500 group-hover:bg-white"
                                            }`}
                                        >
                                            <BriefcaseBusiness size={18} />
                                        </span>

                                        <span>
                                            <span className="block text-sm font-semibold">{role.label}</span>
                                            <span className="mt-1 block text-xs opacity-75">{role.hint}</span>
                                        </span>
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-between text-sm text-slate-600">

                    <label className="flex items-center gap-2">

                        <input
                            {...register("rememberMe")}
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                        />

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
