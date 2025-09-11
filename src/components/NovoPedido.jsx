// src/components/NovoPedido.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, addDoc, query, where, getDocs, onSnapshot, or } from 'firebase/firestore'; 
import '../styles/NovoPedido.css';
import logo from '../assets/logo-raphietro.png';

const NovoPedido = ({ onNavigate }) => {
  // Data do Pedido: Definida automaticamente para a data atual e não editável
  const [dataPedido, setDataPedido] = useState(new Date().toLocaleString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }));
  
  const [clienteCpf, setClienteCpf] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(null); // Armazena o objeto do cliente selecionado

  const [costureiraId, setCostureiraId] = useState(''); // Manter para o valor selecionado no dropdown
  const [costureiraNome, setCostureiraNome] = useState('');
  const [selectedCostureira, setSelectedCostureira] = useState(null);
  const [allCostureiras, setAllCostureiras] = useState([]); // Lista de todas as costureiras

  const [servicosDisponiveis, setServicosDisponiveis] = useState([]);
  const [servicosSelecionados, setServicosSelecionados] = useState([]);

  const [observacoes, setObservacoes] = useState('');
  const [precoTotal, setPrecoTotal] = useState(0);

  const pedidosCollectionRef = collection(db, 'pedidos');
  const clientesCollectionRef = collection(db, 'clientes');
  const usersCollectionRef = collection(db, 'users');
  const servicosCollectionRef = collection(db, 'servicos');

  // Efeito para carregar serviços disponíveis
  useEffect(() => {
    const unsubscribeServicos = onSnapshot(query(servicosCollectionRef), (snapshot) => {
      const servicosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        preco: parseFloat(doc.data().preco) || 0
      }));
      setServicosDisponiveis(servicosData);
    });
    return () => unsubscribeServicos();
  // CORRIGIDO: Adicionado servicosCollectionRef como dependência
  }, [servicosCollectionRef]);

  // Efeito para carregar costureiras e administradores marcados como ativos para o dropdown
  useEffect(() => {
    // CORRIGIDO: Usa 'or' para buscar usuários que são 'costureira' OU 'adm'
    const q = query(usersCollectionRef, 
      or(
        where('userType', '==', 'costureira'),
        where('userType', '==', 'adm')
      )
    );
    const unsubscribeCostureiras = onSnapshot(q, (snapshot) => {
      const costureirasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllCostureiras(costureirasData);
    }, (error) => {
      console.error('Erro ao buscar costureiras:', error);
      alert('Erro ao carregar a lista de costureiras.');
    });
    return () => unsubscribeCostureiras();
  // CORRIGIDO: Adicionado usersCollectionRef como dependência
  }, [usersCollectionRef]);

  // Efeito para calcular o preço total sempre que os serviços selecionados mudam
  useEffect(() => {
    const total = servicosSelecionados.reduce((sum, servico) => sum + (servico.preco * servico.quantidade), 0);
    setPrecoTotal(total);
  }, [servicosSelecionados]);

  const handleClienteCpfChange = async (e) => {
    const cpf = e.target.value.replace(/\D/g, '');
    setClienteCpf(cpf);
    if (cpf.length === 11) {
      const q = query(clientesCollectionRef, where('cpf', '==', cpf));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const clienteData = querySnapshot.docs[0].data();
        setSelectedCliente({ id: querySnapshot.docs[0].id, ...clienteData });
        setClienteNome(clienteData.nome);
        alert(`Cliente encontrado: ${clienteData.nome}`);
      } else {
        setSelectedCliente(null);
        setClienteNome('');
        alert('Cliente não encontrado com este CPF.');
      }
    } else {
      setSelectedCliente(null);
      setClienteNome('');
    }
  };

  const handleSelectCostureira = (e) => {
    const selectedUid = e.target.value;
    setCostureiraId(selectedUid);
    const costureira = allCostureiras.find(c => c.id === selectedUid);
    if (costureira) {
      setSelectedCostureira(costureira);
      setCostureiraNome(costureira.nome);
    } else {
      setSelectedCostureira(null);
      setCostureiraNome('');
    }
  };

  const handleAddServico = (servicoId) => {
    const servico = servicosDisponiveis.find(s => s.id === servicoId);
    if (servico) {
      const parsedPreco = parseFloat(servico.preco) || 0; 
      if (isNaN(parsedPreco)) {
        alert('Preço do serviço inválido. Por favor, verifique o cadastro do serviço.');
        return;
      }

      if (!servicosSelecionados.some(s => s.id === servicoId)) {
        setServicosSelecionados([...servicosSelecionados, { ...servico, preco: parsedPreco, quantidade: 1 }]);
      } else {
        setServicosSelecionados(servicosSelecionados.map(s =>
          s.id === servicoId ? { ...s, quantidade: s.quantidade + 1 } : s
        ));
      }
    }
  };

  const handleRemoveServico = (servicoId) => {
    setServicosSelecionados(servicosSelecionados.filter(s => s.id !== servicoId));
  };

  const handleQuantidadeChange = (servicoId, quantidade) => {
    setServicosSelecionados(servicosSelecionados.map(s =>
      s.id === servicoId ? { ...s, quantidade: parseInt(quantidade) || 1 } : s
    ));
  };

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
        .print-status-history { margin-top: 10px; font-size: 0.8em; }
        .print-status-history ul { list-style: none; padding: 0; margin: 5px 0 0 0; }
        .print-status-history li { margin-bottom: 2px; }
      </style>
    `;

    const statusHistoryHtml = pedido.statusHistory && pedido.statusHistory.length > 0 ? `
      <div class="section-title">Histórico de Status</div>
      <div class="print-status-history">
        <ul>
          ${pedido.statusHistory.map(entry => `
            <li>
              ${entry.status} em ${new Date(entry.date.seconds * 1000).toLocaleString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })} por ${entry.changedBy ? entry.changedBy.split('@')[0] : 'Desconhecido'}
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
        <p>Data: ${pedido.dataPedido}</p>
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
      ${statusHistoryHtml}
    `;

    printContent += `<div class="receipt-page">
      ${commonDetails}
      <div class="copy-label">--- VIA DO CLIENTE ---</div>
    </div>`;

    printContent += `<div class="page-break"></div>
    <div class="receipt-page">
      ${commonDetails}
      <p class="info-item"><strong>Costureira:</strong> ${pedido.costureiraNome} (ID: ${pedido.costureiraEmployeeId})</p>
      <p class="info-item"><strong>Status Atual:</strong> ${pedido.status}</p>
      <div style="margin-top: 30px; text-align: center;">
        <p>__________________________</p>
        <p>Assinatura do Cliente</p>
      </div>
      <div class="copy-label">--- COMANDA DA EMPRESA ---</div>
    </div>`;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(printContent);
    iframeDoc.close();

    iframe.onload = () => {
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCliente) {
      alert('Por favor, selecione um cliente válido.');
      return;
    }
    if (!selectedCostureira) {
      alert('Por favor, selecione uma costureira válida.');
      return;
    }
    if (servicosSelecionados.length === 0) {
      alert('Por favor, adicione pelo menos um serviço.');
      return;
    }

    try {
      const newPedidoRef = await addDoc(pedidosCollectionRef, {
        dataPedido: dataPedido,
        clienteId: selectedCliente.id,
        clienteNome: selectedCliente.nome,
        clienteTelefone: selectedCliente.telefone,
        costureiraId: selectedCostureira.id,
        costureiraNome: selectedCostureira.nome,
        costureiraEmployeeId: selectedCostureira.employeeId,
        servicos: servicosSelecionados.map(s => ({
          id: s.id,
          tipo: s.tipo,
          peca: s.peca,
          precoUnitario: parseFloat(s.preco) || 0,
          quantidade: s.quantidade,
          subtotal: (parseFloat(s.preco) || 0) * s.quantidade
        })),
        observacoes: observacoes,
        precoTotal: precoTotal,
        status: 'Em Andamento',
        createdAt: new Date()
      });

      const pedidoParaImpressao = {
        id: newPedidoRef.id,
        dataPedido: dataPedido,
        clienteNome: selectedCliente.nome,
        clienteTelefone: selectedCliente.telefone,
        costureiraNome: selectedCostureira.nome,
        costureiraEmployeeId: selectedCostureira.employeeId,
        servicos: servicosSelecionados.map(s => ({
          ...s,
          precoUnitario: parseFloat(s.preco) || 0,
          subtotal: (parseFloat(s.preco) || 0) * s.quantidade
        })),
        observacoes: observacoes,
        precoTotal: precoTotal,
        status: 'Em Andamento',
        statusHistory: []
      };

      alert('Pedido cadastrado com sucesso! Preparando para impressão...');
      printReceipt(pedidoParaImpressao);
      setDataPedido(new Date().toLocaleString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }));
      setClienteCpf('');
      setClienteNome('');
      setSelectedCliente(null);
      setCostureiraId('');
      setCostureiraNome('');
      setSelectedCostureira(null);
      setServicosSelecionados([]);
      setObservacoes('');
      setPrecoTotal(0);

      onNavigate('lista-pedidos');
    } catch (error) {
      console.error('Erro ao cadastrar pedido:', error);
      alert(`Erro ao cadastrar pedido: ${error.message}`);
    }
  };

  return (
    <div className="novo-pedido-container">
      <header className="novo-pedido-header">
        <img src={logo} alt="Raphietro Atelier Logo" className="novo-pedido-logo" />
        <button onClick={() => onNavigate('lista-pedidos')} className="back-button">Voltar</button>
      </header>

      <div className="novo-pedido-content">
        <h2>Novo Pedido</h2>
        <form onSubmit={handleSubmit} className="novo-pedido-form">
          <label htmlFor="data-pedido">Data e Hora do Pedido</label>
          <input
            type="text"
            id="data-pedido"
            value={dataPedido}
            readOnly
          />

          <h3>Dados do Cliente</h3>
          <label htmlFor="cliente-cpf">CPF do Cliente</label>
          <input
            type="text"
            id="cliente-cpf"
            value={clienteCpf}
            onChange={handleClienteCpfChange}
            maxLength="11"
            placeholder="Digite o CPF do cliente"
            required
          />
          <label htmlFor="cliente-nome-display">Nome do Cliente</label>
          <input
            type="text"
            id="cliente-nome-display"
            value={clienteNome}
            readOnly
            className={selectedCliente ? 'found' : ''}
          />

          <h3>Dados da Costureira</h3>
          <label htmlFor="select-costureira">Selecionar Costureira</label>
          <select
            id="select-costureira"
            value={costureiraId}
            onChange={handleSelectCostureira}
            required
          >
            <option value="" disabled>Selecione uma costureira</option>
            {allCostureiras.map(costureira => (
              <option key={costureira.id} value={costureira.id}>
                {costureira.nome} ({costureira.employeeId})
              </option>
            ))}
          </select>
          <label htmlFor="costureira-nome-display">Nome da Costureira</label>
          <input
            type="text"
            id="costureira-nome-display"
            value={costureiraNome}
            readOnly
            className={selectedCostureira ? 'found' : ''}
          />

          <h3>Serviços do Pedido</h3>
          <div className="servicos-selecao">
            <label htmlFor="select-servico">Adicionar Serviço:</label>
            <select id="select-servico" onChange={(e) => handleAddServico(e.target.value)} value="">
              <option value="" disabled>Selecione um serviço</option>
              {servicosDisponiveis.map(servico => (
                <option key={servico.id} value={servico.id}>
                  {servico.tipo} - {servico.peca} (R$ {servico.preco.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {servicosSelecionados.length > 0 && (
            <div className="servicos-selecionados-list">
              <h4>Serviços Adicionados:</h4>
              {servicosSelecionados.map(servico => (
                <div key={servico.id} className="servico-item">
                  <span>{servico.tipo} - {servico.peca}</span>
                  <input
                    type="number"
                    min="1"
                    value={servico.quantidade}
                    onChange={(e) => handleQuantidadeChange(servico.id, e.target.value)}
                    className="servico-quantidade-input"
                  />
                  <span>x R$ {typeof servico.preco === 'number' ? servico.preco.toFixed(2) : '0.00'} = R$ {typeof servico.preco === 'number' ? (servico.preco * servico.quantidade).toFixed(2) : '0.00'}</span>
                  <button type="button" onClick={() => handleRemoveServico(servico.id)} className="remove-servico-button">Remover</button>
                </div>
              ))}
            </div>
          )}

          <label htmlFor="observacoes-pedido">Observações do Pedido</label>
          <textarea
            id="observacoes-pedido"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows="4"
          ></textarea>

          <div className="preco-total">
            <strong>Preço Total: R$ {precoTotal.toFixed(2)}</strong>
          </div>

          <button type="submit" className="novo-pedido-button">Cadastrar Pedido</button>
        </form>
      </div>
    </div>
  );
};

export default NovoPedido;
