import React, { useState } from "react";

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client-side validation
    if (!email || !password || (isRegister && !name)) {
      setError("Please fill all required fields");
      setLoading(false);
      return;
    }

    try {
      const base =
        (import.meta as any).env.VITE_API_URL || "http://localhost:3000";
      const endpoint = isRegister
        ? `${base}/auth/register`
        : `${base}/auth/login`;
      const body: any = { email, password } as any;
      if (isRegister) body.name = name;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.message || "Request failed");
      }

      const data = await res.json();
      const token = data.token;
      if (!token) throw new Error("No token returned");

      localStorage.setItem("hmac_token", token);
      onLogin(token);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="w-96 bg-white/5 border border-white/10 rounded-lg p-6 glass-panel">
        <h2 className="text-white text-lg font-semibold mb-4">
          Sign in to hmac OS
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {isRegister && (
            <input
              className="px-3 py-2 rounded bg-white/10 text-white outline-none"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            className="px-3 py-2 rounded bg-white/10 text-white outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="px-3 py-2 rounded bg-white/10 text-white outline-none"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
            <button
              type="button"
              className="mt-2 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded disabled:opacity-50"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Switch to Sign in" : "Switch to Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
