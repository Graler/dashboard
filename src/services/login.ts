import axios from "axios"
import { User } from "../model/user";
import { LoginResponse } from "../model/login";

const baseUrl: string = import.meta.env.VITE_BASE_URL;

  export const login = async (): Promise<string | null> => {
    try {
      const user: User = new User(import.meta.env.VITE_USERNAME, import.meta.env.VITE_PASSWORD); 
      const response = await axios.post<LoginResponse>(`${baseUrl}/session`, user);
      const { token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('date', new Date().toString());
      return token;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  };