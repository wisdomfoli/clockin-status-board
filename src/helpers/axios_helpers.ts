import axios from "axios";
import Cookies from 'js-cookie';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/hospital/api',
});

// Intercepteur pour ajouter automatiquement le token à toutes les requêtes
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalide ou expiré - supprimer le token et rediriger vers login
      Cookies.remove('access');
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      // Optionnel: rediriger vers la page de connexion
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  code_patient: string;
  password: string;
}


export async function login(credentials: any) {
  try {
    const res = await axiosInstance.post("/auth/user-login/", credentials);
    Cookies.set('access', res.data.user.access);
    return { success: true, data: res.data, status: res.status };
  } catch (error: any) {
    if (error.response) {
      // Erreur renvoyée par le serveur
      return {
        success: false,
        status: error.response.status,
        error: error.response.data,
      };
    } else {
      // Erreur réseau ou autre
      return { success: false, status: null, error: error.message };
    }
  }
}

export async function getUsersTodayClocks() {
  try {
    const token = Cookies.get('access');
    if (!token) {
      return {
        success: false,
        status: 401,
        error: 'Token d\'authentification manquant',
      };
    }
    const res = await axiosInstance.get("/users/today_clock/");
    return { success: true, data: res.data, status: res.status };
  } catch (error: any) {
    if (error.response) {
      // Erreur renvoyée par le serveur
      return {
        success: false,
        status: error.response.status,
        error: error.response.data,
      };
    } else {
      // Erreur réseau ou autre
      return { success: false, status: null, error: error.message };
    }
  }
}

export async function getUsers() {
  try {
    // const token = Cookies.get('access');
    // if (!token) {
    //   return {
    //     success: false,
    //     status: 401,
    //     error: 'Token d\'authentification manquant',
    //   };
    // }
    const res = await axiosInstance.get("/users/");
    return { success: true, data: res.data, status: res.status };
  } catch (error: any) {
    if (error.response) {
      // Erreur renvoyée par le serveur
      return {
        success: false,
        status: error.response.status,
        error: error.response.data,
      };
    } else {
      // Erreur réseau ou autre
      return { success: false, status: null, error: error.message };
    }
  }
}

export async function clockIn() {
  try {
    const token = Cookies.get('access');
    if (!token) {
      return {
        success: false,
        status: 401,
        error: 'Token d\'authentification manquant',
      };
    }

    const res = await axiosInstance.post("/users/clock-in/", {});
    
    // L'API peut retourner success: false dans le body même si la requête HTTP est réussie
    if (res.data.success === false) {
      return {
        success: false,
        status: res.status,
        error: res.data,
        data: res.data, // Inclure les données pour récupérer le clock_in_time existant
      };
    }
    
    return { success: true, data: res.data, status: res.status };
  } catch (error: any) {
    if (error.response) {
      // Erreur renvoyée par le serveur
      return {
        success: false,
        status: error.response.status,
        error: error.response.data,
      };
    } else {
      // Erreur réseau ou autre
      return { success: false, status: null, error: error.message };
    }
  }
}

// Fonction pour vérifier si l'utilisateur est authentifié
export function isAuthenticated(): boolean {
  const token = Cookies.get('access');
  return !!token;
}

// Fonction pour obtenir le token
export function getToken(): string | undefined {
  return Cookies.get('access');
}

// Fonction pour clock-out
export async function clockOut() {
  try {
    const token = Cookies.get('access');
    if (!token) {
      return {
        success: false,
        status: 401,
        error: 'Token d\'authentification manquant',
      };
    }

    const res = await axiosInstance.post("/users/clock-out/", {});
    return { success: true, data: res.data, status: res.status };
  } catch (error: any) {
    if (error.response) {
      // Erreur renvoyée par le serveur
      return {
        success: false,
        status: error.response.status,
        error: error.response.data,
      };
    } else {
      // Erreur réseau ou autre
      return { success: false, status: null, error: error.message };
    }
  }
}

// Fonction pour se déconnecter
export function logout(): void {
  Cookies.remove('access');
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
}