// assets/js/payment.js
class OrionPayment {
  constructor() {
    this.FORMAS_PAGAMENTO = [
      { id: 'dinheiro', nome: 'Dinheiro', icon: 'fa-money-bill' },
      { id: 'pix', nome: 'PIX', icon: 'fa-qrcode' },
      { id: 'cartao_credito', nome: 'Cartão de Crédito', icon: 'fa-credit-card' },
      { id: 'cartao_debito', nome: 'Cartão de Débito', icon: 'fa-credit-card' },
      { id: 'transferencia', nome: 'Transferência', icon: 'fa-exchange-alt' },
      { id: 'boleto', nome: 'Boleto', icon: 'fa-file-invoice' },
      { id: 'cheque', nome: 'Cheque', icon: 'fa-money-check' },
      { id: 'crediario', nome: 'Crediário', icon: 'fa-calendar-alt' },
      { id: 'multiplo', nome: 'Pagamento Múltiplo', icon: 'fa-layer-group' }
    ];
  }

  // Obter lista de formas de pagamento
  getFormasPagamento() {
    return this.FORMAS_PAGAMENTO;
  }

  // Obter informações de uma forma de pagamento específica
  getFormaPagamento(id) {
    return this.FORMAS_PAGAMENTO.find(forma => forma.id === id);
  }

  // Processar pagamento com base na forma selecionada
  processarPagamento(venda, formaPagamento, valorPago = 0) {
    // Verificar se a venda é válida
    if (!venda || !venda.total) {
      throw new Error('Venda inválida');
    }

    // Verificar se a forma de pagamento é válida
    if (!this.getFormaPagamento(formaPagamento)) {
      throw new Error('Forma de pagamento inválida');
    }

    // Processar pagamento com base na forma selecionada
    switch (formaPagamento) {
      case 'dinheiro':
        return this.processarDinheiro(venda, valorPago);
      case 'pix':
        return this.processarPix(venda);
      case 'cartao_credito':
      case 'cartao_debito':
        return this.processarCartao(venda, formaPagamento);
      case 'transferencia':
        return this.processarTransferencia(venda);
      case 'boleto':
        return this.processarBoleto(venda);
      case 'cheque':
        return this.processarCheque(venda);
      case 'crediario':
        return this.processarCrediario(venda);
      case 'multiplo':
        throw new Error('Pagamento múltiplo deve ser processado pelo método processarPagamentoMultiplo()');
      default:
        throw new Error(`Forma de pagamento '${formaPagamento}' não implementada`);
    }
  }

  // Processar pagamento em dinheiro
  processarDinheiro(venda, valorPago) {
    if (valorPago < venda.total) {
      throw new Error('Valor pago é menor que o total da venda');
    }

    const troco = valorPago - venda.total;
    
    return {
      sucesso: true,
      forma_pagamento: 'dinheiro',
      forma_pagamento_nome: 'Dinheiro',
      valor_pago: valorPago,
      troco,
      data_processamento: new Date().toISOString(),
      transacao_id: this.gerarTransacaoId(),
      detalhes: {
        valor_pago: valorPago,
        troco
      }
    };
  }

  // Processar pagamento via PIX
  processarPix(venda) {
    // Simular processamento de PIX
    // Em um ambiente real, você se conectaria a um PSP (Provedor de Serviços de Pagamento)

    // Gerar QR Code para PIX
    const pixQrCode = this.gerarQrCodePix(venda);

    return {
      sucesso: true,
      forma_pagamento: 'pix',
      forma_pagamento_nome: 'PIX',
      valor_pago: venda.total,
      troco: 0,
      data_processamento: new Date().toISOString(),
      transacao_id: this.gerarTransacaoId(),
      detalhes: {
        qr_code: pixQrCode,
        chave_pix: 'orionpdv@exemplo.com.br'
      }
    };
  }

  // Processar pagamento com cartão
  processarCartao(venda, tipoCartao) {
    // Simular processamento de cartão
    // Em um ambiente real, você se conectaria a uma maquininha ou gateway de pagamento

    const nomeTipo = tipoCartao === 'cartao_credito' ? 'Cartão de Crédito' : 'Cartão de Débito';
    
    return {
      sucesso: true,
      forma_pagamento: tipoCartao,
      forma_pagamento_nome: nomeTipo,
      valor_pago: venda.total,
      troco: 0,
      data_processamento: new Date().toISOString(),
      transacao_id: this.gerarTransacaoId(),
      detalhes: {
        tipo_cartao: tipoCartao === 'cartao_credito' ? 'credito' : 'debito',
        bandeira: 'simulada',
        parcelas: tipoCartao === 'cartao_credito' ? 1 : null,
        autorizacao: this.gerarCodigoAutorizacao()
      }
    };
  }

  // Processar transferência bancária
  processarTransferencia(venda) {
    return {
      sucesso: true,
      forma_pagamento: 'transferencia',
      forma_pagamento_nome: 'Transferência',
      valor_pago: venda.total,
      troco: 0,
      data_processamento: new Date().toISOString(),
      transacao_id: this.gerarTransacaoId(),
      detalhes: {
        banco: 'Banco Simulado',
        agencia: '0001',
        conta: '12345-6',
        favorecido: 'ORION PDV LTDA'
      }
    };
  }

  // Processar boleto
  processarBoleto(venda) {
    return {
      sucesso: true,
      forma_pagamento: 'boleto',
      forma_pagamento_nome: 'Boleto',
      valor_pago: venda.total,
      troco: 0,
      data_processamento: new Date().toISOString(),
      transacao_id: this.gerarTransacaoId(),
      detalhes: {
        codigo_barras: this.gerarCodigoBarrasBoleto(),
        data_vencimento: this.adicionarDias(new Date(), 3).toISOString().split('T')[0],
        link_boleto: 'https://exemplo.com/boleto/12345'
      }
    };
  }

  // Processar cheque
  processarCheque(venda) {
    return {
      sucesso: true,
      forma_pagamento: 'cheque',
      forma_pagamento_nome: 'Cheque',
      valor_pago: venda.total,
      troco: 0,
      data_processamento: new Date().toISOString(),
      transacao_id: this.gerarTransacaoId(),
      detalhes: {
        banco: 'Banco Simulado',
        numero_cheque: Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
        data_deposito: new Date().toISOString().split('T')[0]
      }
    };
  }

  // Processar crediário (fiado)
  processarCrediario(venda) {
    return {
      sucesso: true,
      forma_pagamento: 'crediario',
      forma_pagamento_nome: 'Crediário',
      valor_pago: 0, // Nada foi pago no momento
      troco: 0,
      data_processamento: new Date().toISOString(),
      transacao_id: this.gerarTransacaoId(),
      detalhes: {
        cliente_id: venda.cliente_id,
        parcelas: 1,
        vencimento: this.adicionarDias(new Date(), 30).toISOString().split('T')[0]
      }
    };
  }

  // Processar pagamento com múltiplas formas
  processarPagamentoMultiplo(venda, pagamentos) {
    // Verificar se a lista de pagamentos é válida
    if (!Array.isArray(pagamentos) || pagamentos.length === 0) {
      throw new Error('Lista de pagamentos inválida');
    }

    // Calcular valor total pago
    const valorTotalPago = pagamentos.reduce((total, pag) => total + pag.valor, 0);

    // Verificar se o valor total pago é suficiente
    if (valorTotalPago < venda.total) {
      throw new Error('Valor total pago é menor que o total da venda');
    }

    // Processar cada forma de pagamento
    const detalhesFormas = [];
    for (const pag of pagamentos) {
      if (!pag.forma || !pag.valor || pag.valor <= 0) {
        throw new Error('Dados de pagamento inválidos');
      }

      // Processar forma de pagamento individual
      const formaPagamento = this.getFormaPagamento(pag.forma);
      if (!formaPagamento) {
        throw new Error(`Forma de pagamento '${pag.forma}' inválida`);
      }

      // Adicionar aos detalhes
      detalhesFormas.push({
        forma: pag.forma,
        nome: formaPagamento.nome,
        valor: pag.valor,
        detalhes: pag.detalhes || {}
      });
    }

    // Calcular troco (apenas se dinheiro for uma das formas)
    const troco = valorTotalPago - venda.total;

    return {
      sucesso: true,
      forma_pagamento: 'multiplo',
      forma_pagamento_nome: 'Pagamento Múltiplo',
      valor_pago: valorTotalPago,
      troco,
      data_processamento: new Date().toISOString(),
      transacao_id: this.gerarTransacaoId(),
      detalhes: {
        formas: detalhesFormas
      }
    };
  }

  // Funções auxiliares
  gerarTransacaoId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  gerarCodigoAutorizacao() {
    return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  }

  gerarCodigoBarrasBoleto() {
    let codigo = '';
    for (let i = 0; i < 48; i++) {
      codigo += Math.floor(Math.random() * 10);
    }
    return codigo;
  }

  gerarQrCodePix(venda) {
    // Em um ambiente real, você geraria um QR Code dinâmico seguindo 
    // as especificações do Banco Central
    // Para fins de demonstração, vamos simular um texto de QR Code
    
    const config = JSON.parse(localStorage.getItem('orion_config') || '{}');
    const chave = config.chave_pix || 'orionpdv@exemplo.com.br';
    const beneficiario = config.nome_empresa || 'ORION PDV';
    const cidade = config.cidade || 'São Paulo';
    
    // Formatar um texto que represente o QR Code
    return [
      `00020126`,
      `2604${chave.length.toString().padStart(2, '0')}${chave}`,
      `5204000053039865802BR5914${beneficiario}6006${cidade}62070503***63041234`,
      `6304${this.calcularCRC16(`BR.GOV.BCB.PIX2571${chave}`)}`
    ].join('');
  }

  calcularCRC16(texto) {
    // Implementação simplificada de CRC16
    // Em um ambiente real, você usaria uma biblioteca para isso
    return '1234'; // Simulação simplificada
  }

  adicionarDias(data, dias) {
    const novaData = new Date(data);
    novaData.setDate(novaData.getDate() + dias);
    return novaData;
  }

  // Gerar recibo de venda
  gerarReciboHTML(venda, dadosPagamento) {
    // Obter dados da empresa
    const config = JSON.parse(localStorage.getItem('orion_config') || '{}');
    
    // Formatar data
    const data = new Date(venda.data);
    const dataFormatada = data.toLocaleDateString('pt-BR');
    const horaFormatada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    // Verificar se temos o template de recibo
    let template = localStorage.getItem('orion_template_recibo');
    
    // Se não tiver, usar template padrão
    if (!template) {
      template = this.getTemplateReciboPadrao();
    }
    
    // Criar linhas dos itens
    let linhasItens = '';
    venda.itens.forEach((item, index) => {
      linhasItens += `
        <tr>
          <td>${index + 1}. ${item.produto_nome}</td>
          <td>${item.quantidade}x</td>
          <td>R$ ${item.preco_unitario.toFixed(2)}</td>
          <td class="right">R$ ${item.subtotal.toFixed(2)}</td>
        </tr>
      `;
    });
    
    // Processar QR Code para PIX se aplicável
    let qrCodeHtml = '';
    if (dadosPagamento.forma_pagamento === 'pix' && dadosPagamento.detalhes.qr_code) {
      qrCodeHtml = `
        <div style="text-align: center; margin: 10px 0;">
          <p>Escaneie o QR Code abaixo para pagar:</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(dadosPagamento.detalhes.qr_code)}" alt="QR Code PIX" style="max-width: 150px; height: auto;">
          <p style="font-size: 10px; margin-top: 5px;">Chave PIX: ${dadosPagamento.detalhes.chave_pix}</p>
        </div>
      `;
    }
    
    // Substituir placeholders no template
    let html = template
      .replace(/{{NOME_EMPRESA}}/g, config.nome_empresa || 'ORION PDV')
      .replace(/{{ENDERECO}}/g, config.endereco || '')
      .replace(/{{CIDADE}}/g, config.cidade || '')
      .replace(/{{CNPJ}}/g, config.cnpj || '')
      .replace(/{{TEL}}/g, config.telefone || '')
      .replace(/{{ID_VENDA}}/g, venda.id)
      .replace(/{{DATA_VENDA}}/g, `${dataFormatada} ${horaFormatada}`)
      .replace(/{{CLIENTE}}/g, venda.cliente_nome)
      .replace(/{{OPERADOR}}/g, venda.usuario)
      .replace(/{{ITEMS}}/g, linhasItens)
      .replace(/{{SUBTOTAL}}/g, `R$ ${venda.subtotal.toFixed(2)}`)
      .replace(/{{DESCONTO}}/g, `R$ ${venda.desconto.toFixed(2)}`)
      .replace(/{{TOTAL}}/g, `R$ ${venda.total.toFixed(2)}`)
      .replace(/{{FORMA_PAGAMENTO}}/g, dadosPagamento.forma_pagamento_nome)
      .replace(/{{VALOR_PAGO}}/g, `R$ ${dadosPagamento.valor_pago.toFixed(2)}`)
      .replace(/{{TROCO}}/g, `R$ ${dadosPagamento.troco.toFixed(2)}`)
      .replace(/{{DATA_HORA}}/g, `${dataFormatada} ${horaFormatada}`)
      .replace(/{{QR_CODE}}/g, qrCodeHtml);
    
    return html;
  }

  getTemplateReciboPadrao() {
    // Template básico de recibo como fallback
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Recibo de Venda</title>
  <style>
    body { font-family: monospace; font-size: 12px; margin: 0; padding: 20px; }
    .header { text-align: center; margin-bottom: 10px; }
    .items { width: 100%; border-collapse: collapse; }
    .items th, .items td { text-align: left; padding: 3px 0; }
    .right { text-align: right; }
    .footer { text-align: center; margin-top: 20px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{NOME_EMPRESA}}</h1>
    <p>{{ENDERECO}}</p>
    <p>{{CIDADE}}</p>
    <p>{{CNPJ}}</p>
  </div>
  
  <p><b>Venda:</b> {{ID_VENDA}}</p>
  <p><b>Data:</b> {{DATA_VENDA}}</p>
  <p><b>Cliente:</b> {{CLIENTE}}</p>
  
  <table class="items">
    <thead>
      <tr>
        <th>Item</th>
        <th>Qtd</th>
        <th>Valor</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      {{ITEMS}}
    </tbody>
  </table>
  
  <p class="right"><b>Subtotal:</b> {{SUBTOTAL}}</p>
  <p class="right"><b>Desconto:</b> {{DESCONTO}}</p>
  <p class="right"><b>TOTAL:</b> {{TOTAL}}</p>
  <p><b>Forma de pagamento:</b> {{FORMA_PAGAMENTO}}</p>
  <p><b>Valor recebido:</b> {{VALOR_PAGO}}</p>
  <p><b>Troco:</b> {{TROCO}}</p>
  
  <div class="footer">
    <p>{{NOME_EMPRESA}} - Obrigado pela preferência!</p>
    <p>{{DATA_HORA}}</p>
  </div>
  
  {{QR_CODE}}
  
  <script>
    window.onload = function() { if (window.opener) { window.print(); } };
  </script>
</body>
</html>`;
  }
}

// Instanciar globalmente
const pagamento = new OrionPayment();
