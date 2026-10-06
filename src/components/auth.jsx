import { useState } from 'react';

export function Auth({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const users = JSON.parse(localStorage.getItem('app_users') || '[]');

    if (isRegistering) {
      if (!name || !email || !password) {
        setError('Preencha todos os campos.');
        return;
      }
      if (users.some((u) => u.email === email)) {
        setError('Este e-mail já está cadastrado.');
        return;
      }

      const newUser = { name, email, password };
      users.push(newUser);
      localStorage.setItem('app_users', JSON.stringify(users));
      onLogin({ name: newUser.name, email: newUser.email });
    } else {
      const user = users.find((u) => u.email === email && u.password === password);
      if (!user) {
        setError('E-mail ou senha incorretos.');
        return;
      }
      onLogin({ name: user.name, email: user.email });
    }
  };

  return (
    <div className="auth-card">
      <h2>{isRegistering ? 'Criar Conta' : 'Entrar'}</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="auth-form">
        {isRegistering && (
          <input
            type="text"
            placeholder="Seu Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          {isRegistering ? 'Cadastrar' : 'Entrar'}
        </button>
      </form>

      <button
        type="button"
        className="btn-link"
        onClick={() => {
          setIsRegistering(!isRegistering);
          setError('');
        }}
      >
        {isRegistering ? 'Já possui conta? Faça login' : 'Não tem conta? Cadastre-se'}
      </button>
    </div>
  );
}