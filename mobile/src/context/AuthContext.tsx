import {
    PropsWithChildren,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";
import { loginRequest } from "../services/api";
import { deleteStorageItem, getStorageItem, setStorageItem } from "../services/storage";
import { Usuario } from "../types";

const TOKEN_KEY = "clinica.jwt";
const USER_KEY = "clinica.usuario";

interface AuthContextValue {
    token: string | null;
    usuario: Usuario | null;
    carregando: boolean;
    entrar(email: string, senha: string): Promise<void>;
    sair(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
    const [token, setToken] = useState<string | null>(null);
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        Promise.all([
            getStorageItem(TOKEN_KEY),
            getStorageItem(USER_KEY)
        ]).then(([tokenSalvo, usuarioSalvo]) => {
            setToken(tokenSalvo);
            setUsuario(usuarioSalvo ? JSON.parse(usuarioSalvo) as Usuario : null);
        }).finally(() => setCarregando(false));
    }, []);

    const entrar = useCallback(async (email: string, senha: string) => {
        const resposta = await loginRequest(email, senha);
        await Promise.all([
            setStorageItem(TOKEN_KEY, resposta.token),
            setStorageItem(USER_KEY, JSON.stringify(resposta.usuario))
        ]);
        setToken(resposta.token);
        setUsuario(resposta.usuario);
    }, []);

    const sair = useCallback(async () => {
        await Promise.all([
            deleteStorageItem(TOKEN_KEY),
            deleteStorageItem(USER_KEY)
        ]);
        setToken(null);
        setUsuario(null);
    }, []);

    const value = useMemo(
        () => ({ token, usuario, carregando, entrar, sair }),
        [token, usuario, carregando, entrar, sair]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
    return context;
}

