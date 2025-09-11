// src/components/Dashboard.jsx

import React from 'react';
import { auth } from '../firebase-config'; // Importa a instância de autenticação do Firebase
import { signOut } from 'firebase/auth'; // Importa a função para deslogar o usuário
import '../styles/Dashboard.css'; // Importa os estilos CSS para o Dashboard
import logo from '../assets/logo-raphietro.png'; // Importa a imagem do logo

// O componente Dashboard recebe 'onNavigate' e 'userRole' como props
const Dashboard = ({ onNavigate, userRole }) => {
  // Função assíncrona para lidar com o logout do usuário
  const handleLogout = async () => {
    try {
      await signOut(auth); // Chama a função signOut do Firebase para deslogar
      console.log('Usuário deslogado com sucesso!');
      // O onAuthStateChanged em App.jsx detectará o logout e redirecionará para a tela de login
    } catch (error) {
      console.error('Erro ao deslogar:', error.message);
      alert(`Erro ao deslogar: ${error.message}`); // Exibe um alerta em caso de erro
    }
  };

  return (
    <div className="dashboard-container">
      {/* Cabeçalho do Dashboard: Contém o logo e o botão de Sair */}
      <header className="dashboard-header">
        {/*
          Div vazia para ajudar no alinhamento.
          Ela ocupa o espaço aproximado do botão 'Sair' para centralizar visualmente a logo
          quando 'justify-content: space-between;' é usado no CSS do header.
          A largura pode precisar de ajustes finos dependendo do tamanho exato do botão.
        */}
        <div style={{ width: '83px' }}></div> {/* Largura aproximada do botão Sair */}
        <img src={logo} alt="Raphietro Atelier Logo" className="dashboard-logo" />
        <button onClick={handleLogout} className="logout-button">Sair</button>
      </header>

      {/* Conteúdo principal do Dashboard: Contém os botões de navegação */}
      <div className="dashboard-content">
        {/* Botão para a página de Pedidos */}
        <button onClick={() => onNavigate('lista-pedidos')} className="dashboard-button">Pedidos</button>
        {/* Botão "Clientes" navega para a lista de clientes */}
        <button onClick={() => onNavigate('lista-clientes')} className="dashboard-button">Clientes</button>
        {/* Botão para a página de Relatórios (ainda não criada) */}
        <button className="dashboard-button">Relatórios</button>
        {/* Botão para a página de Administração, visível apenas para 'adm' */}
        {userRole === 'adm' && (
          <button onClick={() => onNavigate('administracao')} className="dashboard-button">Administração</button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
