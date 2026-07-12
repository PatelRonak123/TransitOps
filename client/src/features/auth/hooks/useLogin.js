// import authService from "../service/authService";

export default function useLogin() {

    async function login(data) {

        try {

            const response = await authService.login(data);

            console.log(response);

        }

        catch (err) {

            console.log(err);

        }

    }

    return { login };
}