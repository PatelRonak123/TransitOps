import { useForm } from "react-hook-form";
import useLogin from "../hooks/useLogin";

export default function LoginForm() {

    const { register, handleSubmit } = useForm();

    const { login } = useLogin();

    return (

        <div className="flex items-center justify-center">

            <form
                onSubmit={handleSubmit(login)}
                className="w-full max-w-md space-y-5"
            >

                <div>

                    <h2 className="text-3xl font-bold">
                        Sign In
                    </h2>

                    <p className="text-gray-500">
                        Enter your credentials
                    </p>

                </div>

                <input
                    {...register("email")}
                    placeholder="Email"
                    className="w-full rounded-lg border p-3"
                />

                <input
                    {...register("password")}
                    type="password"
                    placeholder="Password"
                    className="w-full rounded-lg border p-3"
                />

                <div className="flex justify-between text-sm">

                    <label>

                        <input type="checkbox" />

                        Remember Me

                    </label>

                    <a href="#">
                        Forgot Password?
                    </a>

                </div>

                <button
                    className="w-full rounded-lg bg-orange-500 py-3 text-white"
                >
                    Sign In
                </button>

            </form>

        </div>
    );
}