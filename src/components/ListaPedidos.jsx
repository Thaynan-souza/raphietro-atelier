// src/components/ListaPedidos.jsx

import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase-config'; // Importa 'auth' para obter o usuário logado
import { collection, onSnapshot, query, orderBy, updateDoc, doc, arrayUnion } from 'firebase/firestore'; // Importa updateDoc e arrayUnion
import { onAuthStateChanged } from 'firebase/auth'; // Para obter o usuário logado
import '../styles/ListaPedidos.css'; // Importa os estilos CSS
import logo from '../assets/logo-raphietro.png'; // Importa a imagem do logo

const ListaPedidos = ({ onNavigate }) => {
  const [pedidos, setPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(''); // Estado para o status selecionado
  const [itemsPerPage, setItemsPerPage] = useState('10'); // Estado para o número de itens por página
  const [currentUser, setCurrentUser] = useState(null); // Estado para o usuário logado

  // Efeito para obter o usuário logado (necessário para o histórico de status)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // Efeito para buscar os pedidos do Firestore em tempo real
  useEffect(() => {
    const pedidosCollectionRef = collection(db, 'pedidos');
    // Ordena os pedidos pela data de criação em ordem decrescente
    const q = query(pedidosCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pedidosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPedidos(pedidosData);
    }, (error) => {
      console.error('Erro ao buscar pedidos:', error);
      alert('Erro ao carregar a lista de pedidos.');
    });

    return () => unsubscribe();
  }, []);

  // Função para formatar a data para exibição (DD/MM/YYYY)
  const formatarData = (timestamp) => {
    if (!timestamp) return 'N/A';
    let date;
    if (timestamp.toDate) { // Se for um Timestamp do Firebase
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string') { // Se for uma string como "DD/MM/YYYY, HH:MM"
      // Tenta parsear a string no formato DD/MM/YYYY, HH:MM
      const parts = timestamp.match(/(\d{2})\/(\d{2})\/(\d{4}),? (\d{2}):(\d{2})/);
      if (parts) {
        // Constrói a data no formato YYYY-MM-DDTHH:MM para criar um objeto Date
        date = new Date(`${parts[3]}-${parts[2]}-${parts[1]}T${parts[4]}:${parts[5]}:00`);
      } else {
        // Tenta parsear apenas a parte da data se a hora não estiver presente ou o formato for diferente
        const dateOnlyParts = timestamp.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (dateOnlyParts) {
          date = new Date(parseInt(dateOnlyParts[3]), parseInt(dateOnlyParts[2]) - 1, parseInt(dateOnlyParts[1]));
        } else {
          date = new Date(timestamp); // Tenta o construtor padrão como último recurso
        }
      }
    } else { // Se for um objeto Date nativo ou outro tipo
      date = new Date(timestamp);
    }
    // Verifica se a data é válida antes de formatar
    if (isNaN(date.getTime())) {
      return 'Data Inválida';
    }
    return date.toLocaleDateString('pt-BR');
  };

  // Função para formatar data E HORA para exibição (DD/MM/YYYY HH:MM)
  const formatarDataHora = (timestamp) => {
    if (!timestamp) return 'N/A';
    let date;
    if (timestamp.toDate) { // Se for um Timestamp do Firebase
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string') { // Se for uma string como "DD/MM/YYYY, HH:MM"
      // Tenta parsear a string no formato DD/MM/YYYY, HH:MM
      const parts = timestamp.match(/(\d{2})\/(\d{2})\/(\d{4}),? (\d{2}):(\d{2})/);
      if (parts) {
        // Constrói a data no formato YYYY-MM-DDTHH:MM para criar um objeto Date
        date = new Date(`${parts[3]}-${parts[2]}-${parts[1]}T${parts[4]}:${parts[5]}:00`);
      } else {
        // Tenta parsear apenas a parte da data se a hora não estiver presente ou o formato for diferente
        const dateOnlyParts = timestamp.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (dateOnlyParts) {
          date = new Date(parseInt(dateOnlyParts[3]), parseInt(dateOnlyParts[2]) - 1, parseInt(dateOnlyParts[1]));
        } else {
          date = new Date(timestamp); // Tenta o construtor padrão como último recurso
        }
      }
    } else { // Se for um objeto Date nativo ou outro tipo
      date = new Date(timestamp);
    }
    // Verifica se a data é válida antes de formatar
    if (isNaN(date.getTime())) {
      return 'Data Inválida';
    }
    return date.toLocaleString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };


  // Função para lidar com a mudança de status do pedido
  const handleStatusChange = async (pedidoId, newStatus) => {
    if (!currentUser) {
      alert('Você precisa estar logado para alterar o status de um pedido.');
      return;
    }

    const pedidoRef = doc(db, 'pedidos', pedidoId);
    let observation = '';

    // Solicita observação se o status for 'Reaberto'
    if (newStatus === 'Reaberto') {
      observation = prompt('Por favor, insira uma observação para a reabertura do pedido:');
      if (observation === null) { // Se o usuário cancelar o prompt
        return; // Cancela a mudança de status
      }
    }

    const statusHistoryEntry = {
      status: newStatus,
      date: new Date(),
      changedBy: currentUser.email, // Ou currentUser.uid, se preferir
      observation: observation // Adiciona a observação ao histórico
    };

    try {
      await updateDoc(pedidoRef, {
        status: newStatus,
        statusHistory: arrayUnion(statusHistoryEntry) // Adiciona ao array de histórico
      });
      alert(`Status do pedido ${pedidoId.substring(0, 6)} alterado para "${newStatus}" com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar o status do pedido.');
    }
  };

  // Função para gerar e imprimir a "notinha" (copiada do NovoPedido.jsx)
  const printReceipt = (pedido) => {
    let printContent = `
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; color: #333; }
        .receipt-page { width: 80mm; margin: 0 auto; border: 1px solid #ccc; padding: 10mm; box-sizing: border-box; }
        .receipt-header { text-align: center; margin-bottom: 15px; }
        .receipt-header h2 { margin: 0; color: #700052; }
        .receipt-header p { margin: 2px 0; font-size: 0.9em; }
        .section-title { font-weight: bold; margin-top: 15px; margin-bottom: 5px; border-bottom: 1px dashed #ccc; padding-bottom: 3px; }
        .info-item { font-size: 0.9em; margin-bottom: 3px; }
        .info-item strong { color: #700052; }
        .service-list { list-style: none; padding: 0; margin: 10px 0; }
        .service-list li { font-size: 0.9em; margin-bottom: 5px; border-bottom: 1px dotted #eee; padding-bottom: 3px; }
        .total { font-size: 1.1em; font-weight: bold; text-align: right; margin-top: 15px; color: #700052; }
        .observacoes { font-size: 0.85em; margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 10px; }
        .copy-label { text-align: center; font-size: 0.8em; margin-top: 20px; padding-top: 10px; border-top: 1px dashed #ccc; }
        .page-break { page-break-after: always; }
        /* Estilo para o histórico de status na impressão */
        .print-status-history { margin-top: 10px; font-size: 0.8em; }
        .print-status-history ul { list-style: none; padding: 0; margin: 5px 0 0 0; }
        .print-status-history li { margin-bottom: 2px; }
      </style>
    `;

    // Prepara o HTML para o histórico de status na impressão
    const statusHistoryHtml = pedido.statusHistory && pedido.statusHistory.length > 0 ? `
      <div class="section-title">Histórico de Status</div>
      <div class="print-status-history">
        <ul>
          ${pedido.statusHistory.map(entry => `
            <li>
              ${entry.status} em ${formatarDataHora(entry.date)} por ${entry.changedBy ? entry.changedBy.split('@')[0] : 'Desconhecido'}
              ${entry.observation ? ` (Obs: ${entry.observation})` : ''}
            </li>
          `).join('')}
        </ul>
      </div>
    ` : '';

    const commonDetails = `
      <div class="receipt-header">
        <h2>Raphietro Atelier</h2>
        <p>Seu estilo, nossa arte.</p>
        <p>Pedido #${pedido.id.substring(0, 6)}</p>
        <p>Data: ${formatarDataHora(pedido.dataPedido)}</p>
      </div>
      <div class="section-title">Dados do Cliente</div>
      <p class="info-item"><strong>Nome:</strong> ${pedido.clienteNome}</p>
      <p class="info-item"><strong>Telefone:</strong> ${pedido.clienteTelefone}</p>
      <div class="section-title">Serviços</div>
      <ul class="service-list">
        ${pedido.servicos.map(s => {
          const precoFormatado = typeof s.precoUnitario === 'number' ? s.precoUnitario.toFixed(2) : '0.00';
          const subtotalFormatado = typeof s.precoUnitario === 'number' ? (s.precoUnitario * s.quantidade).toFixed(2) : '0.00';
          return `
            <li>
              ${s.tipo} - ${s.peca} (${s.quantidade}x) - R$ ${precoFormatado} = R$ ${subtotalFormatado}
            </li>
          `;
        }).join('')}
      </ul>
      <div class="total">Total: R$ ${pedido.precoTotal.toFixed(2)}</div>
      ${pedido.observacoes ? `<div class="observacoes"><strong>Obs:</strong> ${pedido.observacoes}</div>` : ''}
      ${statusHistoryHtml} <!-- Inclui o histórico de status aqui -->
    `;

    // Via do Cliente
    printContent += `<div class="receipt-page">
      ${commonDetails}
      <div class="copy-label">--- VIA DO CLIENTE ---</div>
    </div>`;

    // Comanda da Empresa (com dados extras)
    printContent += `<div class="page-break"></div>
    <div class="receipt-page">
      ${commonDetails}
      <p class="info-item"><strong>Costureira:</strong> ${pedido.costureiraNome} (ID: ${pedido.costureiraEmployeeId})</p>
      <p class="info-item"><strong>Status Atual:</strong> ${pedido.status}</p> <!-- Status atual na comanda -->
      <div style="margin-top: 30px; text-align: center;">
        <p>__________________________</p>
        <p>Assinatura do Cliente</p>
      </div>
      <div class="copy-label">--- COMANDA DA EMPRESA ---</div>
    </div>`;

    // Cria um iframe invisível para imprimir
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none'; // Torna o iframe invisível
    document.body.appendChild(iframe); // Adiciona o iframe ao corpo do documento

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(printContent);
    iframeDoc.close();

    // Espera o conteúdo carregar no iframe antes de imprimir
    iframe.onload = () => {
      iframe.contentWindow.print();
      document.body.removeChild(iframe); // Remove o iframe após a impressão
    };
  };

  // Função para lidar com o clique no botão de ver detalhes/editar pedido
  const handleViewOrEdit = (pedidoId) => {
    console.log('Ver/Editar pedido com ID:', pedidoId);
    alert(`Funcionalidade de ver/editar pedido ${pedidoId} será implementada aqui!`);
  };

  // Filtra os pedidos com base no termo de pesquisa E no status selecionado
  const filteredPedidos = pedidos.filter(pedido => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
    const matchesSearchTerm = (
      (pedido.clienteNome && pedido.clienteNome.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (pedido.costureiraNome && pedido.costureiraNome.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (pedido.status && pedido.status.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (pedido.dataPedido && pedido.dataPedido.toLowerCase().includes(lowerCaseSearchTerm))
    );

    // Filtra por status, se um status for selecionado
    const matchesStatus = selectedStatus ? (pedido.status === selectedStatus) : true;

    return matchesSearchTerm && matchesStatus;
  });

  // Aplica o limite de itens por página
  const limitedPedidos = itemsPerPage === 'all' ? filteredPedidos : filteredPedidos.slice(0, parseInt(itemsPerPage));


  return (
    <div className="lista-pedidos-container">
      <header className="lista-pedidos-header">
        <div className="header-spacer"></div>
        <img src={logo} alt="Raphietro Atelier Logo" className="lista-pedidos-logo" />
        <div className="header-buttons">
          <button onClick={() => onNavigate('novo-pedido')} className="add-pedido-button">Novo Pedido</button>
          <button onClick={() => onNavigate('dashboard')} className="back-button">Voltar</button>
        </div>
      </header>

      <div className="lista-pedidos-content">
        <h2>Lista de Pedidos</h2>

        {/* Controles de filtro (pesquisa e filtro de status) */}
        <div className="filter-controls">
          {/* Div para agrupar os dropdowns */}
          <div className="filter-dropdowns-group">
            {/* Dropdown para filtrar por status */}
            <select
              className="status-filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Todos os Status</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Pronto para Retirada">Pronto para Retirada</option>
              <option value="Entregue">Entregue</option>
              <option value="Reaberto">Reaberto</option>
            </select>

            {/* Dropdown para limitar itens por página */}
            <select
              className="items-per-page-select"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(e.target.value)}
            >
              <option value="10">Mostrar 10</option>
              <option value="15">Mostrar 15</option>
              <option value="20">Mostrar 20</option>
              <option value="all">Mostrar Todos</option>
            </select>
          </div>
          
          {/* Div para a barra de pesquisa */}
          <div className="filter-search-group">
            <input
              type="text"
              placeholder="Pesquisar pedido por cliente, costureira, status ou data..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {limitedPedidos.length === 0 ? (
          <p>Nenhum pedido encontrado com o termo de pesquisa ou status selecionado.</p>
        ) : (
          <div className="pedidos-list-grid">
            {limitedPedidos.map(pedido => (
              <div key={pedido.id} className="pedido-card">
                <h3>Pedido #{pedido.id.substring(0, 6)}</h3>
                <p><strong>Data:</strong> {formatarDataHora(pedido.dataPedido)}</p>
                <p><strong>Cliente:</strong> {pedido.clienteNome}</p>
                <p><strong>Costureira:</strong> {pedido.costureiraNome}</p>
                <p>
                  <strong>Status:</strong> 
                  <span className={`status-${pedido.status ? pedido.status.toLowerCase().replace(/\s/g, '-') : 'desconhecido'}`}>
                    {pedido.status || 'Desconhecido'}
                  </span>
                  {/* Dropdown para alterar status */}
                  <select
                    value={pedido.status || ''}
                    onChange={(e) => handleStatusChange(pedido.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Pronto para Retirada">Pronto para Retirada</option>
                    <option value="Entregue">Entregue</option>
                    <option value="Reaberto">Reaberto</option>
                  </select>
                </p>
                <p><strong>Total:</strong> R$ {typeof pedido.precoTotal === 'number' ? pedido.precoTotal.toFixed(2) : '0.00'}</p>
                <div className="servicos-resumo">
                  <strong>Serviços:</strong>
                  <ul>
                    {pedido.servicos && pedido.servicos.map((servico, index) => (
                      <li key={index}>{servico.tipo} ({servico.peca}) - {servico.quantidade}x</li>
                    ))}
                  </ul>
                </div>
                {/* Histórico de Status */}
                {pedido.statusHistory && pedido.statusHistory.length > 0 && (
                  <div className="status-history">
                    <strong>Histórico de Status:</strong>
                    <ul>
                      {pedido.statusHistory.map((entry, index) => (
                        <li key={index}>
                          {entry.status} em {formatarDataHora(entry.date)} por {entry.changedBy ? entry.changedBy.split('@')[0] : 'Desconhecido'}
                          {entry.observation && <span className="status-observation"> (Obs: {entry.observation})</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Botão de Imprimir Nota */}
                <button onClick={() => printReceipt(pedido)} className="print-receipt-button">Imprimir Nota</button>
                <button onClick={() => handleViewOrEdit(pedido.id)} className="view-edit-button">Ver Detalhes</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaPedidos;
