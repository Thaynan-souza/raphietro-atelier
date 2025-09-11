// src/components/CadastroUsuario.jsx

import React, { useState } from 'react';
import { auth, db } from '../firebase-config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection } from 'firebase/firestore';

import '../styles/CadastroUsuario.css';
import logo from '../assets/logo-raphietro.png';

const CadastroUsuario = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [userType, setUserType] = useState('costureira');

  const usersCollectionRef = collection(db, 'users');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Cria o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // 2. Salva informações adicionais do usuário no Cloud Firestore
      // O ID será o UID gerado pelo próprio Firebase Authentication
      await setDoc(doc(db, 'users', user.uid), {
        nome: nome,
        email: email,
        userType: userType,
        createdAt: new Date()
      });

      alert('Usuário cadastrado com sucesso!');
      setEmail('');
      setSenha('');
      setNome('');
      setUserType('costureira');
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      alert(`Erro ao cadastrar usuário: ${error.message}`);
    }
  };

  return (
    <div className="cadastro-usuario-container">
      <header className="cadastro-usuario-header">
        <img src={logo} alt="Raphietro Atelier Logo" className="cadastro-usuario-logo" />
        <button onClick={() => onNavigate('administracao')} className="back-button">Voltar</button>
      </header>

      <div className="cadastro-usuario-content">
        <h2>Cadastro de Usuários</h2>
        <form onSubmit={handleSubmit} className="cadastro-usuario-form">
          <label htmlFor="user-name">Nome</label>
          <input
            type="text"
            id="user-name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <label htmlFor="user-email">E-mail</label>
          <input
            type="email"
            id="user-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="user-password">Senha</label>
          <input
            type="password"
            id="user-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <label htmlFor="user-type">Tipo de Usuário</label>
          <select
            id="user-type"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            required
          >
            <option value="costureira">Costureira</option>
            <option value="recepcao">Recepção</option>
            <option value="adm">Administrador</option>
          </select>

          <button type="submit" className="cadastro-usuario-button">Cadastrar Usuário</button>
        </form>
      </div>
    </div>
  );
};

export default CadastroUsuario;
