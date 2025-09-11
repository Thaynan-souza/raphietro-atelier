// src/components/Login.jsx

import React, { useState } from 'react';
import { auth } from '../firebase-config'; // Importa a autenticação do seu arquivo de config
import { signInWithEmailAndPassword } from 'firebase/auth'; // Importa a função de login
import '../styles/Login.css';
import logo from '../assets/logo-raphietro.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = async (e) => { // A função agora é assíncrona
    e.preventDefault();
    try {
      // Chama a função do Firebase para tentar fazer o login
      await signInWithEmailAndPassword(auth, email, senha);
      alert('Login bem-sucedido!');
      console.log('Login bem-sucedido!');
      // O redirecionamento para a próxima tela virá aqui
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(`Erro: ${errorMessage}`);
      console.error("Erro no login:", errorCode, errorMessage);
    }
  };

  return (
    <div className="login-container">
      <div className="login-logo-container">
        <img src={logo} alt="Raphietro Atelier Logo" className="login-logo" />
      </div>

      <div className="login-form-box">
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="login-email">Login</label>
          <input
            type="email"
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="login-senha">Senha</label>
          <input
            type="password"
            id="login-senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <button type="submit" className="login-button">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;