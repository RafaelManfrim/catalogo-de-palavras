import axios from "axios";

export interface Word {
  id: number;
  text: string;
  stars: number;
  studied: boolean;
  phonetic: string | null;
  partOfSpeech: string | null;
  audioUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Stats {
  totalWords: number;
  studiedWords: number;
  totalStars: number;
  avgStars: number;
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token: string | null) {
  if (token) {
    http.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete http.defaults.headers.common.Authorization;
  }
}

type ApiError = {
  status: number;
  error?: string;
  message?: string;
  [key: string]: unknown;
};

function normalizeError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 500;
    const data = (error.response?.data ?? {}) as Record<string, unknown>;
    throw {
      status,
      ...data,
      error:
        (typeof data.error === "string" && data.error) ||
        (typeof data.message === "string" && data.message) ||
        error.message ||
        "Request failed",
    } as ApiError;
  }

  throw {
    status: 500,
    error: "Unexpected request error",
  } as ApiError;
}

export const api = {
  getWords(q?: string, sort?: string, order?: string) {
    return http
      .get<Word[]>("/words", { params: { q, sort, order } })
      .then((res) => res.data)
      .catch(normalizeError);
  },

  register(email: string, password: string) {
    return http
      .post<AuthResponse>("/auth/register", { email, password })
      .then((res) => res.data)
      .catch(normalizeError);
  },

  login(email: string, password: string) {
    return http
      .post<AuthResponse>("/auth/login", { email, password })
      .then((res) => res.data)
      .catch(normalizeError);
  },

  me() {
    return http
      .get<{ user: User }>("/auth/me")
      .then((res) => res.data.user)
      .catch(normalizeError);
  },

  searchWords(q: string) {
    return http
      .get<Word[]>("/words/search", { params: { q } })
      .then((res) => res.data)
      .catch(normalizeError);
  },

  getStats() {
    return http
      .get<Stats>("/words/stats")
      .then((res) => res.data)
      .catch(normalizeError);
  },

  getRandomWord() {
    return http
      .get<Word | null>("/words/random")
      .then((res) => res.data)
      .catch(normalizeError);
  },

  addWord(text: string) {
    return http
      .post<Word>("/words", { text })
      .then((res) => res.data)
      .catch(normalizeError);
  },

  repeatWord(id: number) {
    return http
      .patch<Word>(`/words/${id}/repeat`)
      .then((res) => res.data)
      .catch(normalizeError);
  },

  setWordStudied(id: number, studied: boolean) {
    return http
      .patch<Word>(`/words/${id}/studied`, { studied })
      .then((res) => res.data)
      .catch(normalizeError);
  },

  deleteWord(id: number) {
    return http
      .delete(`/words/${id}`)
      .then(() => undefined)
      .catch(normalizeError);
  },
};
