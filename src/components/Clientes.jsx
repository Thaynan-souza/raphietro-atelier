// src/components/Clientes.jsx

import React, { useState } from 'react';
import { db } from '../firebase-config'; // Importa a instância do Firestore
import { collection, addDoc } from 'firebase/firestore'; // Importa as funções para trabalhar com coleções e adicionar documentos
import '../styles/Clientes.css'; // Importa os estilos CSS para a tela de Clientes
import logo from '../assets/logo-raphietro.png'; // Importa a imagem do logo

// O componente Clientes recebe 'onNavigate' como uma prop para permitir a navegação
const Clientes = ({ onNavigate }) => {
  // Estados para armazenar os valores dos campos do formulário
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState(''); // Novo estado para o campo CEP
  const [endereco, setEndereco] = useState('');
  const [numeroCasa, setNumeroCasa] = useState(''); // NOVO ESTADO PARA O NÚMERO DA CASA

  // Referência à coleção 'clientes' no Cloud Firestore
  const clientesCollectionRef = collection(db, 'clientes');

  // Função assíncrona para buscar o endereço automaticamente pelo CEP
  const handleCepChange = async (e) => {
    const newCep = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos do CEP
    setCep(newCep); // Atualiza o estado do CEP

    // Se o CEP tiver 8 dígitos, tenta buscar o endereço
    if (newCep.length === 8) {
      try {
        // Faz uma requisição GET para a API ViaCEP
        const response = await fetch(`https://viacep.com.br/ws/${newCep}/json/`);
        const data = await response.json(); // Converte a resposta para JSON

        // Verifica se a API retornou um erro (CEP não encontrado)
        if (data.erro) {
          alert('CEP não encontrado. Por favor, verifique o CEP digitado.');
          setEndereco(''); // Limpa o campo de endereço se o CEP for inválido
        } else {
          // Preenche o campo de endereço com os dados retornados pela API
          setEndereco(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
          setNumeroCasa(''); // Limpa o número da casa para que o usuário insira
        }
      } catch (error) {
        // Captura e loga erros na requisição da API
        console.error('Erro ao buscar CEP:', error);
        alert('Erro ao buscar CEP. Tente novamente ou preencha o endereço manualmente.');
        setEndereco(''); // Limpa o endereço em caso de erro na requisição
        setNumeroCasa('');
      }
    } else {
      // Se o CEP estiver incompleto, limpa o campo de endereço e número da casa
      setEndereco('');
      setNumeroCasa('');
    }
  };

  // Função assíncrona para lidar com o envio do formulário de cadastro de cliente
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página
    try {
      // Adiciona um novo documento à coleção 'clientes' no Firestore
      await addDoc(clientesCollectionRef, {
        nome: nome,
        telefone: telefone,
        cpf: cpf,
        cep: cep, // Salva o CEP no banco de dados
        endereco: endereco,
        numeroCasa: numeroCasa, // NOVO: Salva o número da casa
        createdAt: new Date() // Adiciona um carimbo de data/hora da criação do cliente
      });
      alert('Cliente cadastrado com sucesso!'); // Alerta de sucesso
      // Limpa todos os campos do formulário após o cadastro bem-sucedido
      setNome('');
      setTelefone('');
      setCpf('');
      setCep('');
      setEndereco('');
      setNumeroCasa(''); // NOVO: Limpa o número da casa
    } catch (error) {
      // Captura e loga erros no processo de adição do documento no Firestore
      console.error('Erro ao adicionar cliente:', error);
      alert('Erro ao cadastrar cliente. Por favor, tente novamente.'); // Alerta de erro
    }
  };

  return (
    <div className="clientes-container">
      {/* Cabeçalho da página de clientes */}
      <header className="clientes-header">
        <img src={logo} alt="Raphietro Atelier Logo" className="clientes-logo" />
        {/* Botão para voltar ao Dashboard */}
        <button onClick={() => onNavigate('dashboard')} className="back-button">Voltar</button>
      </header>

      {/* Conteúdo principal com o formulário de cadastro */}
      <div className="clientes-content">
        <h2>Cadastro de Clientes</h2>
        <form onSubmit={handleSubmit} className="clientes-form">
          <label htmlFor="cliente-nome">Nome do Cliente</label>
          <input
            type="text"
            id="cliente-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required // Campo obrigatório
          />

          <label htmlFor="cliente-telefone">Telefone</label>
          <input
            type="tel"
            id="cliente-telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required // Campo obrigatório
          />

          <label htmlFor="cliente-cpf">CPF</label>
          <input
            type="text"
            id="cliente-cpf"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            maxLength="11" // Limita o CPF a 11 dígitos
            required // Campo obrigatório
          />

          <label htmlFor="cliente-cep">CEP</label>
          <input
            type="text"
            id="cliente-cep"
            value={cep}
            onChange={handleCepChange} // Chama a função para buscar o CEP
            maxLength="8" // Limita o CEP a 8 dígitos
          />

          <label htmlFor="cliente-endereco">Endereço (Rua, Bairro, Cidade - UF)</label>
          <input
            type="text"
            id="cliente-endereco"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            required // Campo obrigatório
          />

          {/* NOVO CAMPO PARA O NÚMERO DA CASA */}
          <label htmlFor="cliente-numero-casa">Número da Casa</label>
          <input
            type="text"
            id="cliente-numero-casa"
            value={numeroCasa}
            onChange={(e) => setNumeroCasa(e.target.value)}
            required // Campo obrigatório
          />

          {/* Botão para salvar o cliente */}
          <button type="submit" className="clientes-button">Salvar Cliente</button>
        </form>
      </div>
    </div>
  );
};

export default Clientes;
