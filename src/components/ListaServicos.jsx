// src/components/ListaServicos.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config'; // Importa a instância do Firestore
import { collection, onSnapshot, query } from 'firebase/firestore'; // Funções para coleções e leituras em tempo real
import '../styles/ListaServicos.css'; // Vamos criar este arquivo de estilo
import logo from '../assets/logo-raphietro.png'; // Importa a imagem do logo

const ListaServicos = ({ onNavigate }) => {
  const [servicos, setServicos] = useState([]); // Estado para armazenar a lista de serviços
  const [searchTerm, setSearchTerm] = useState(''); // Estado para o termo de pesquisa

  // useEffect para buscar os serviços do Firestore em tempo real
  useEffect(() => {
    const servicosCollectionRef = collection(db, 'servicos');
    const q = query(servicosCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServicos(servicosData);
    }, (error) => {
      console.error('Erro ao buscar serviços:', error);
      alert('Erro ao carregar a lista de serviços.');
    });

    return () => unsubscribe();
  }, []);

  // Função para lidar com o clique no botão de editar serviço
  const handleEdit = (servicoId) => {
    console.log('Editar serviço com ID:', servicoId);
    alert(`Funcionalidade de edição para o serviço ${servicoId} será implementada aqui!`);
  };

  // Filtra os serviços com base no termo de pesquisa
  const filteredServicos = servicos.filter(servico => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      servico.tipo.toLowerCase().includes(lowerCaseSearchTerm) ||
      servico.peca.toLowerCase().includes(lowerCaseSearchTerm) ||
      String(servico.preco).includes(lowerCaseSearchTerm)
    );
  });

  return (
    <div className="lista-servicos-container">
      <header className="lista-servicos-header">
        <div className="header-spacer"></div>
        <img src={logo} alt="Raphietro Atelier Logo" className="lista-servicos-logo" />
        <div className="header-buttons">
          {/* Botão para ir para a tela de Cadastro de Serviço */}
          <button onClick={() => onNavigate('cadastro-servico')} className="add-servico-button">Novo Serviço</button>
          <button onClick={() => onNavigate('administracao')} className="back-button">Voltar</button>
        </div>
      </header>

      <div className="lista-servicos-content">
        <h2>Lista de Serviços</h2>

        {/* Campo de pesquisa */}
        <input
          type="text"
          placeholder="Pesquisar serviço por tipo, peça ou preço..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {filteredServicos.length === 0 ? (
          <p>Nenhum serviço encontrado com o termo de pesquisa ou cadastrado ainda.</p>
        ) : (
          <div className="servicos-list-grid">
            {filteredServicos.map(servico => (
              <div key={servico.id} className="servico-card">
                <h3>{servico.tipo}</h3>
                <p><strong>Peça:</strong> {servico.peca}</p>
                <p><strong>Preço:</strong> R$ {servico.preco.toFixed(2)}</p>
                <button onClick={() => handleEdit(servico.id)} className="edit-button">Editar</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaServicos;
