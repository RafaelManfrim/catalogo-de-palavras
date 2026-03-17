import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

export function LoginScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Login realizado com sucesso.");
      } else {
        await register(email, password);
        toast.success("Conta criada com sucesso.");
      }
    } catch (error: any) {
      toast.error(error?.error || "Falha na autenticacao.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-6 space-y-5">
        <header className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Catalogo de Palavras</h1>
          <p className="text-zinc-400 text-sm">Entre para acessar suas palavras</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 outline-none focus:border-violet-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg py-2.5 font-medium"
          >
            {isLoading ? "..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="w-full text-sm text-zinc-400 hover:text-zinc-200"
        >
          {mode === "login"
            ? "Nao tem conta? Criar agora"
            : "Ja tem conta? Fazer login"}
        </button>
      </div>
    </div>
  );
}
