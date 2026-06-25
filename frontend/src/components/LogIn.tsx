import { useState } from 'react';

interface Props {
  onLoginFeito: (token: string, userId :number) => void;
  irParaRegisto: () => void;
}

export const Login = ({ onLoginFeito, irParaRegisto }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://127.0.0.1:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciais inválidas');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', String(data.userId));
      onLoginFeito(data.token, data.userId);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      <span className="ml-4 text-slate-500">A entrar…</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center py-24">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Entrar</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center mb-4">
            <p className="text-red-600 mb-2">Erro ao entrar: {error}</p>
            <button onClick={() => setError(null)} className="bg-red-600 text-white px-4 py-2 rounded-lg">
              Tentar novamente
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm"
          />
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            Entrar
          </button>
          <p className="text-center text-sm text-gray-400">
            Não tens conta?{' '}
            <button onClick={irParaRegisto} className="text-blue-600">
              Criar conta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};