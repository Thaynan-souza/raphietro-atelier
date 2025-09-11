// src/components/ListaUsuarios.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config'; // Importa a instância do Firestore
import { collection, onSnapshot, query } from 'firebase/firestore'; // Importa funções para coleções e leituras em tempo real
import '../styles/ListaUsuarios.css'; // Importa os estilos CSS
import logo from '../assets/logo-raphietro.png'; // Importa a imagem do logo

const ListaUsuarios = ({ onNavigate }) => {
  const [usuarios, setUsuarios] = useState([]); // Estado para armazenar a lista completa de usuários
  const [searchTerm, setSearchTerm] = useState(''); // Estado para o termo de pesquisa

  // useEffect para buscar os usuários do Firestore em tempo real
  useEffect(() => {
    const usuariosCollectionRef = collection(db, 'users'); // Coleção 'users'
    const q = query(usuariosCollectionRef); // Cria uma query para a coleção de usuários

    // onSnapshot cria um listener em tempo real para a coleção 'users'
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usuariosData = snapshot.docs.map(doc => ({
        id: doc.id, // O UID do usuário do Firebase Auth
        ...doc.data() // Todos os outros dados do documento (nome, email, userType, employeeId)
      }));
      setUsuarios(usuariosData); // Atualiza o estado com os dados mais recentes dos usuários
    }, (error) => {
      console.error('Erro ao buscar usuários:', error);
      alert('Erro ao carregar a lista de usuários. Por favor, tente novamente.');
    });

    // Retorna uma função de limpeza para desinscrever o listener
    return () => unsubscribe();
  }, []); // Array de dependências vazio para que o useEffect seja executado apenas uma vez

  // Função para lidar com o clique no botão de editar usuário
  const handleEdit = (userId) => {
    console.log('Editar usuário com ID:', userId);
    alert(`Funcionalidade de edição para o usuário ${userId} será implementada aqui!`);
  };

  // Filtra os usuários com base no termo de pesquisa
  const filteredUsuarios = usuarios.filter(usuario => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      usuario.nome.toLowerCase().includes(lowerCaseSearchTerm) ||
      usuario.email.toLowerCase().includes(lowerCaseSearchTerm) ||
      usuario.userType.toLowerCase().includes(lowerCaseSearchTerm) ||
      (usuario.employeeId && usuario.employeeId.toLowerCase().includes(lowerCaseSearchTerm)) // Pesquisa por employeeId
    );
  });

  return (
    <div className="lista-usuarios-container">
      <header className="lista-usuarios-header">
        {/* Div vazia para balancear o espaço à esquerda do logo */}
        <div className="header-spacer"></div>
        <img src={logo} alt="Raphietro Atelier Logo" className="lista-usuarios-logo" />
        {/* Grupo de botões à direita */}
        <div className="header-buttons">
          {/* Botão para ir para a tela de Cadastro de Usuário */}
          <button onClick={() => onNavigate('cadastro-usuario')} className="add-usuario-button">Novo Usuário</button>
          <button onClick={() => onNavigate('administracao')} className="back-button">Voltar</button>
        </div>
      </header>

      <div className="lista-usuarios-content">
        <h2>Lista de Usuários</h2>

        {/* Campo de pesquisa */}
        <input
          type="text"
          placeholder="Pesquisar usuário por nome, e-mail, tipo ou ID..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {filteredUsuarios.length === 0 ? (
          <p>Nenhum usuário encontrado com o termo de pesquisa ou cadastrado ainda.</p>
        ) : (
          <div className="usuarios-list-grid"> {/* Contêiner para o estilo de lista/grid */}
            {filteredUsuarios.map(usuario => (
              <div key={usuario.id} className="usuario-card"> {/* Card para cada usuário */}
                <h3>{usuario.nome}</h3>
                <p><strong>ID:</strong> {usuario.employeeId}</p>
                <p><strong>E-mail:</strong> {usuario.email}</p>
                <p><strong>Tipo:</strong> {usuario.userType}</p>
                <button onClick={() => handleEdit(usuario.id)} className="edit-button">Editar</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaUsuarios;
