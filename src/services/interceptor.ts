import axios, { AxiosError } from 'axios';
import { login } from './login';

// Configuração do interceptor
export const interceptor = () => {
    axios.interceptors.request.use(
        async config => {
            // Modifique a configuração da solicitação, se necessário
            // Por exemplo, adicione cabeçalhos de autorização

            if (config.url !== "https://api.ollie.elanto.com.br/session") {
                const token = getToken();
                if (token == undefined || token == null || token.length == 0) {
                   await login();
                }

                const dateToken = getDate();
                if (dateToken != undefined && dateToken != null && dateToken.length > 0) {
                    const time: number = Math.abs(new Date().getTime() - new Date(dateToken).getTime());
                    if (time >= 86400000) {
                        await login();
                    }
                }

                config.headers['Authorization'] = 'Bearer ' + getToken();
            }
            return config;
        },
        (error: AxiosError) => {
            // Manipule erros de solicitação
            return Promise.reject(error);
        }
    );
}


const getToken = () => {
    return localStorage.getItem("token");
}

const getDate = () => {
    return localStorage.getItem("date");
}