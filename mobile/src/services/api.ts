import { ApiValidationError, LoginResponse } from "../types";
import { Platform } from "react-native";

const configurada = process.env.EXPO_PUBLIC_API_URL?.trim();
const enderecoPadrao = Platform.OS === "web"
    ? "http://localhost:3000"
    : "http://10.0.2.2:3000";
export const API_URL = (configurada || enderecoPadrao).replace(/\/$/, "");

interface ApiErrorBody {
    mensagem?: string;
    erros?: ApiValidationError[];
}

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly erros: ApiValidationError[] = []
    ) {
        super(message);
    }
}

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
    token?: string | null
): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        }
    });

    const text = await response.text();
    const body = text ? JSON.parse(text) as ApiErrorBody | T : undefined;

    if (!response.ok) {
        const erro = body as ApiErrorBody | undefined;
        const detalhes = erro?.erros?.map(item => item.mensagem).join("\n");
        throw new ApiError(
            detalhes || erro?.mensagem || "Não foi possível concluir a operação",
            response.status,
            erro?.erros
        );
    }

    return body as T;
}

export function loginRequest(email: string, senha: string) {
    return apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, senha })
    });
}

