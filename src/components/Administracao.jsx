// src/components/Administracao.jsx

import React, { useState, useEffect } from 'react'; // Importa useEffect e useState
import { auth, db } from '../firebase-config'; // Importa auth e db
import { doc, getDoc } from 'firebase/firestore'; // Importa doc e getDoc
import { onAuthStateChanged } from 'firebase/auth'; // Importa onAuthStateChanged

import '../styles/Administracao.css'; // Importa os estilos CSS para a página de Administração
import logo from '../assets/logo-raphietro.png'; // Importa a imagem do logo

// O componente Administracao recebe 'onNavigate' como uma prop
const Administracao = ({ onNavigate }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserRole(userDocSnap.data().userType);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="administracao-container">
        <p>Carregando...</p>
      </div>
    );
  }

  // Se o usuário não for 'adm', exibe mensagem de acesso negado
  if (userRole !== 'adm') {
    return (
      <div className="administracao-container">
        <header className="administracao-header">
          <img src={logo} alt="Raphietro Atelier Logo" className="administracao-logo" />
          <button onClick={() => onNavigate('dashboard')} className="back-button">Voltar</button>
        </header>
        <div className="administracao-content">
          <h2>Acesso Negado</h2>
          <p>Você não tem permissão para acessar esta área.</p>
          <button onClick={() => onNavigate('dashboard')} className="administracao-button">Voltar ao Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="administracao-container">
      {/* Cabeçalho da página de Administração */}
      <header className="administracao-header">
        <img src={logo} alt="Raphietro Atelier Logo" className="administracao-logo" />
        {/* Botão para voltar ao Dashboard */}
        <button onClick={() => onNavigate('dashboard')} className="back-button">Voltar</button>
      </header>

      {/* Conteúdo principal da página de Administração */}
      <div className="administracao-content">
        <h2>Administração</h2>
        <div className="administracao-buttons">
          {/* Botão "Serviços" navega para a Lista de Serviços */}
          <button onClick={() => onNavigate('lista-servicos')} className="administracao-button">Serviços</button>
          {/* Botão "Usuários" navega para a página de Lista de Usuários */}
          <button onClick={() => onNavigate('lista-usuarios')} className="administracao-button">Usuários</button>
        </div>
      </div>
    </div>
  );
};

export default Administracao;
