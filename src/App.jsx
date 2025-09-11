// src/App.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase-config'; // Importa 'auth' e 'db' do seu arquivo de configuração
import { onAuthStateChanged } from 'firebase/auth'; // Importa a função para monitorar o estado da autenticação
import { doc, getDoc } from 'firebase/firestore'; // Importa doc e getDoc para buscar dados do usuário

import Login from './components/Login';         // Componente da tela de Login
import Dashboard from './components/Dashboard'; // Componente do Painel de Controle
import Clientes from './components/Clientes';   // Componente da tela de Cadastro de Clientes
import ListaClientes from './components/ListaClientes'; // Componente da Lista de Clientes
import Administracao from './components/Administracao'; // Componente da página de Administração
import CadastroUsuario from './components/CadastroUsuario'; // Componente da página de Cadastro de Usuário
import ListaUsuarios from './components/ListaUsuarios'; // Componente da página de Lista de Usuários
import CadastroServico from './components/CadastroServico'; // Componente da página de Cadastro de Serviço
import ListaServicos from './components/ListaServicos';     // Componente da página de Lista de Serviços
import NovoPedido from './components/NovoPedido';     // Componente da página de Novo Pedido
import ListaPedidos from './components/ListaPedidos'; // Componente da página de Lista de Pedidos

import './styles/App.css';       // Estilos globais da aplicação
import './styles/Dashboard.css'; // Estilos do Dashboard
import './styles/Clientes.css';  // Estilos da tela de Cadastro de Clientes
import './styles/ListaClientes.css'; // Estilos da Lista de Clientes
import './styles/Administracao.css'; // Estilos da página de Administração
import './styles/CadastroUsuario.css'; // Estilos da página de Cadastro de Usuário
import './styles/ListaUsuarios.css'; // Estilos da página de Lista de Usuários
import './styles/CadastroServico.css'; // Estilos da página de Cadastro de Serviço
import './styles/ListaServicos.css';     // Estilos da página de Lista de Serviços
import './styles/NovoPedido.css';     // Estilos da página de Novo Pedido
import './styles/ListaPedidos.css'; // Estilos da página de Lista de Pedidos

function App() {
  const [user, setUser] = useState(null); // Estado para armazenar o usuário logado (Firebase User object)
  const [userRole, setUserRole] = useState(null); // Estado para armazenar o tipo de usuário (adm, costureira, recepcao)
  const [loadingUserRole, setLoadingUserRole] = useState(true); // Estado para indicar carregamento do papel do usuário
  const [currentPage, setCurrentPage] = useState('login');

  // useEffect para monitorar o estado de autenticação do Firebase e buscar o papel do usuário
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser); // Atualiza o estado 'user'
      if (currentUser) {
        // Se houver um usuário logado, tenta buscar o papel dele no Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserRole(userDocSnap.data().userType); // Define o papel do usuário
          } else {
            console.warn("Documento do usuário não encontrado no Firestore para UID:", currentUser.uid);
            setUserRole(null); // Define como nulo se não encontrar o documento
          }
        } catch (error) {
          console.error("Erro ao buscar papel do usuário:", error);
          setUserRole(null);
        } finally {
          setLoadingUserRole(false); // Finaliza o carregamento do papel
          setCurrentPage('dashboard'); // Redireciona para o dashboard após autenticar e carregar papel
        }
      } else {
        // Se não houver usuário logado, reseta os estados e vai para a tela de login
        setUserRole(null);
        setLoadingUserRole(false);
        setCurrentPage('login');
      }
    });

    return () => unsubscribeAuth();
  }, []); // O array vazio [] garante que este useEffect seja executado apenas uma vez (no montagem)

  // Função para renderizar a página correta com base no estado 'currentPage', 'user' e 'userRole'
  const renderPage = () => {
    // Se ainda estiver carregando o papel do usuário ou não houver usuário, exibe o Login
    if (loadingUserRole || !user) {
      return <Login />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} userRole={userRole} />; // Passa userRole para o Dashboard
      case 'clientes':
        return <Clientes onNavigate={setCurrentPage} />;
      case 'lista-clientes':
        return <ListaClientes onNavigate={setCurrentPage} />;
      case 'administracao':
        // Somente renderiza a Administração se o userRole for 'adm'
        if (userRole === 'adm') {
          return <Administracao onNavigate={setCurrentPage} />;
        } else {
          alert('Acesso negado. Somente administradores podem acessar esta área.');
          setCurrentPage('dashboard'); // Redireciona para o dashboard se não for admin
          return <Dashboard onNavigate={setCurrentPage} userRole={userRole} />;
        }
      case 'cadastro-usuario':
        // Somente renderiza o Cadastro de Usuário se o userRole for 'adm'
        if (userRole === 'adm') {
          return <CadastroUsuario onNavigate={setCurrentPage} />;
        } else {
          alert('Acesso negado. Somente administradores podem cadastrar usuários.');
          setCurrentPage('dashboard');
          return <Dashboard onNavigate={setCurrentPage} userRole={userRole} />;
        }
      case 'lista-usuarios':
        // Somente renderiza a Lista de Usuários se o userRole for 'adm'
        if (userRole === 'adm') {
          return <ListaUsuarios onNavigate={setCurrentPage} />;
        } else {
          alert('Acesso negado. Somente administradores podem ver a lista de usuários.');
          setCurrentPage('dashboard');
          return <Dashboard onNavigate={setCurrentPage} userRole={userRole} />;
        }
      case 'cadastro-servico':
        // Somente renderiza o Cadastro de Serviço se o userRole for 'adm'
        if (userRole === 'adm') {
          return <CadastroServico onNavigate={setCurrentPage} />;
        } else {
          alert('Acesso negado. Somente administradores podem cadastrar serviços.');
          setCurrentPage('dashboard');
          return <Dashboard onNavigate={setCurrentPage} userRole={userRole} />;
        }
      case 'lista-servicos':
        // Somente renderiza a Lista de Serviços se o userRole for 'adm'
        if (userRole === 'adm') {
          return <ListaServicos onNavigate={setCurrentPage} />;
        } else {
          alert('Acesso negado. Somente administradores podem ver a lista de serviços.');
          setCurrentPage('dashboard');
          return <Dashboard onNavigate={setCurrentPage} userRole={userRole} />;
        }
      case 'novo-pedido':
        return <NovoPedido onNavigate={setCurrentPage} />;
      case 'lista-pedidos':
        return <ListaPedidos onNavigate={setCurrentPage} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} userRole={userRole} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;
