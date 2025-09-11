// src/components/CadastroServico.jsx

import React, { useState, useEffect } from 'react'; // Importa useEffect
import { db, auth } from '../firebase-config'; // Importa auth e db
import { collection, addDoc, doc, getDoc } from 'firebase/firestore'; // Importa doc e getDoc
import { onAuthStateChanged } from 'firebase/auth'; // Importa onAuthStateChanged

import '../styles/CadastroServico.css'; // Importa estilos
import logo from '../assets/logo-raphietro.png'; // Importa logo

const CadastroServico = ({ onNavigate }) => {
  const [tipo, setTipo] = useState('');
  const [peca, setPeca] = useState('');
  const [preco, setPreco] = useState('');
  const [userRole, setUserRole] = useState(null); // Estado para o papel do usuário
  const [loading, setLoading] = useState(true); // Estado para carregamento

  const servicosCollectionRef = collection(db, 'servicos');

  // Efeito para buscar o papel do usuário
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userRole !== 'adm') { // Bloqueia submissão se não for admin
      alert('Acesso negado. Somente administradores podem cadastrar serviços.');
      return;
    }
    try {
      await addDoc(servicosCollectionRef, {
        tipo: tipo,
        peca: peca,
        preco: parseFloat(preco),
        createdAt: new Date()
      });
      alert('Serviço cadastrado com sucesso!');
      setTipo('');
      setPeca('');
      setPreco('');
    } catch (error) {
      console.error('Erro ao cadastrar serviço:', error);
      alert(`Erro ao cadastrar serviço: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="cadastro-servico-container">
        <p>Carregando...</p>
      </div>
    );
  }

  // Se o usuário não for 'adm', exibe mensagem de acesso negado
  if (userRole !== 'adm') {
    return (
      <div className="cadastro-servico-container">
        <header className="cadastro-servico-header">
          <img src={logo} alt="Raphietro Atelier Logo" className="cadastro-servico-logo" />
          <button onClick={() => onNavigate('administracao')} className="back-button">Voltar</button>
        </header>
        <div className="cadastro-servico-content">
          <h2>Acesso Negado</h2>
          <p>Você não tem permissão para cadastrar serviços.</p>
          <button onClick={() => onNavigate('dashboard')} className="cadastro-servico-button">Voltar ao Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cadastro-servico-container">
      <header className="cadastro-servico-header">
        <img src={logo} alt="Raphietro Atelier Logo" className="cadastro-servico-logo" />
        <button onClick={() => onNavigate('lista-servicos')} className="back-button">Voltar</button>
      </header>

      <div className="cadastro-servico-content">
        <h2>Cadastro de Serviço</h2>
        <form onSubmit={handleSubmit} className="cadastro-servico-form">
          <label htmlFor="servico-tipo">Tipo de Serviço</label>
          <input
            type="text"
            id="servico-tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
          />

          <label htmlFor="servico-peca">Peça</label>
          <input
            type="text"
            id="servico-peca"
            value={peca}
            onChange={(e) => setPeca(e.target.value)}
            required
          />

          <label htmlFor="servico-preco">Preço (R$)</label>
          <input
            type="number"
            id="servico-preco"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            step="0.01"
            required
          />

          <button type="submit" className="cadastro-servico-button">Salvar Serviço</button>
        </form>
      </div>
    </div>
  );
};

export default CadastroServico;
