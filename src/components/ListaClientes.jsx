// src/components/ListaClientes.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config'; // Importa a instância do Firestore
import { collection, onSnapshot, query } from 'firebase/firestore'; // Importa funções para coleções e leituras em tempo real
import '../styles/ListaClientes.css'; // Importa os estilos CSS para a lista de clientes
import logo from '../assets/logo-raphietro.png'; // Importa a imagem do logo

const ListaClientes = ({ onNavigate }) => {
  const [clientes, setClientes] = useState([]); // Estado para armazenar a lista completa de clientes
  const [searchTerm, setSearchTerm] = useState(''); // Estado para o termo de pesquisa

  // useEffect para buscar os clientes do Firestore em tempo real
  useEffect(() => {
    const clientesCollectionRef = collection(db, 'clientes');
    const q = query(clientesCollectionRef); // Cria uma query para a coleção de clientes

    // onSnapshot cria um listener em tempo real para a coleção 'clientes'
    // Ele é acionado sempre que há uma mudança nos dados da coleção
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientesData = snapshot.docs.map(doc => ({
        id: doc.id, // O ID do documento gerado pelo Firestore (necessário para editar/excluir)
        ...doc.data() // Todos os outros dados do documento (nome, telefone, etc.)
      }));
      setClientes(clientesData); // Atualiza o estado com os dados mais recentes dos clientes
    }, (error) => {
      console.error('Erro ao buscar clientes:', error);
      alert('Erro ao carregar a lista de clientes. Por favor, tente novamente.');
    });

    // Retorna uma função de limpeza para desinscrever o listener
    // Isso é crucial para evitar vazamentos de memória quando o componente é desmontado
    return () => unsubscribe();
  }, []); // Array de dependências vazio para que o useEffect seja executado apenas uma vez (no montagem)

  // Função para lidar com o clique no botão de editar cliente
  const handleEdit = (clienteId) => {
    console.log('Editar cliente com ID:', clienteId);
    // Futuramente, esta função navegará para uma tela de edição
    // e passará o ID do cliente para que seus dados possam ser carregados e editados.
    alert(`Funcionalidade de edição para o cliente ${clienteId} será implementada aqui!`);
  };

  // Filtra os clientes com base no termo de pesquisa
  const filteredClientes = clientes.filter(cliente => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      cliente.nome.toLowerCase().includes(lowerCaseSearchTerm) ||
      cliente.telefone.includes(lowerCaseSearchTerm) ||
      cliente.cpf.includes(lowerCaseSearchTerm)
    );
  });

  return (
    <div className="lista-clientes-container">
      <header className="lista-clientes-header">
        {/* Div vazia para balancear o espaço à esquerda do logo */}
        <div className="header-spacer"></div>
        <img src={logo} alt="Raphietro Atelier Logo" className="lista-clientes-logo" />
        {/* Grupo de botões à direita */}
        <div className="header-buttons">
          {/* Botão para ir para a tela de Cadastro de Clientes */}
          <button onClick={() => onNavigate('clientes')} className="add-cliente-button">Novo Cliente</button>
          <button onClick={() => onNavigate('dashboard')} className="back-button">Voltar</button>
        </div>
      </header>

      <div className="lista-clientes-content">
        <h2>Lista de Clientes</h2>

        {/* Campo de pesquisa */}
        <input
          type="text"
          placeholder="Pesquisar cliente por nome, telefone ou CPF..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {filteredClientes.length === 0 ? (
          <p>Nenhum cliente encontrado com o termo de pesquisa ou cadastrado ainda.</p>
        ) : (
          <div className="clientes-list-grid">
            {filteredClientes.map(cliente => ( // Usa filteredClientes para renderizar
              <div key={cliente.id} className="cliente-card">
                <h3>{cliente.nome}</h3>
                <p><strong>Telefone:</strong> {cliente.telefone}</p>
                <p><strong>CPF:</strong> {cliente.cpf}</p>
                <p><strong>Endereço:</strong> {cliente.endereco}, {cliente.numeroCasa}</p>
                <button onClick={() => handleEdit(cliente.id)} className="edit-button">Editar</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaClientes;
