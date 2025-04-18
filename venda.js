// assets/js/vendas.js
document.addEventListener('DOMContentLoaded', function() {
  // Verificar autenticação
  if (!auth.verificarAutenticacao()) {
    window.location.href = 'index.html';
    return;
  }
  
  // Elementos DOM
  const buscaProdutoInput = document.getElementById('busca-produto');
  const filtroGrupoSelect = document.getElementById('filtro-grupo');
  const listaProdutos = document.getElementById('lista-produtos');
  const codigoBarrasInput = document.getElementById('codigo-barras');
  const btnBuscarCodigo = document.getElementById('btn-buscar-codigo');
  const resultadoScanner = document.getElementById('resultado-scanner');
  const carrinhoItens = document.getElementById('carrinho-itens');
  const carrinhoVazio = document.getElementById('carrinho-vazio');
  const subtotalEl = document.getElementById('subtotal');
  const descontoInput = document.getElementById('desconto');
  const totalEl = document.getElementById('total');
  const clienteSelect = document.getElementById('cliente');
  const formaPagamentoSelect = document.getElementById('forma-pagamento');
  const btnFinalizar = document.getElementById('btn-finalizar');
  
  // Tabs
  const tabProdutos = document.getElementById('tab-produtos');
  const tabScanner = document.getElementById('tab-scanner');
  const conteudoProdutos = document.getElementById('tab-conteudo-produtos');
  const conteudoScanner = document.getElementById('tab-conteudo-scanner');
  
  // Modal de recibo
  const modalRecibo = document.getElementById('modal-recibo');
  const reciboConteudo = document.getElementById('recibo-conteudo');
  const btnFecharRecibo = document.querySelector('.btn-close-recibo');
  const btnImprimir = document.getElementById('btn-imprimir');
  const btnNovaVenda = document.getElementById('btn-nova-venda');
  
  // Data atual
  const dataAtual = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('current-date').textContent = dataAtual.toLocaleDateString('pt-BR', options);
  
  // Carregar dados iniciais
  carregarGrupos();
  carregarProdutos();
  carregarClientes();
  carregarFormasPagamento();
  atualizarCarrinho();
  
  // Eventos
  
  // Busca de produtos
  buscaProdutoInput.addEventListener('input', function() {
    carregarProdutos();
  });
  
  // Filtro de grupo
  filtroGrupoSelect.addEventListener('change', function() {
    carregarProdutos();
  });
  
  // Tabs
  tabProdutos.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Ativar tab
    tabProdutos.classList.add('active');
    tabProdutos.style.color = 'var(--text-light)';
    tabProdutos.style.borderBottom = '2px solid var(--primary)';
    
    tabScanner.classList.remove('active');
    tabScanner.style.color = 'var(--text-muted)';
    tabScanner.style.borderBottom = '2px solid transparent';
    
    // Mostrar conteúdo
    conteudoProdutos.style.display = 'block';
    conteudoScanner.style.display = 'none';
  });
  
  tabScanner.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Ativar tab
    tabScanner.classList.add('active');
    tabScanner.style.color = 'var(--text-light)';
    tabScanner.style.borderBottom = '2px solid var(--primary)';
    
    tabProdutos.classList.remove('active');
    tabProdutos.style.color = 'var(--text-muted)';
    tabProdutos.style.borderBottom = '2px solid transparent';
    
    // Mostrar conteúdo
    conteudoProdutos.style.display = 'none';
    conteudoScanner.style.display = 'block';
    
    // Focar no input
    codigoBarrasInput.focus();
  });
  
  // Busca por código de barras
  btnBuscarCodigo.addEventListener('click', function() {
    buscarPorCodigoBarras();
  });
  
  codigoBarrasInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      buscarPorCodigoBarras();
    }
  });
  
  // Desconto
  descontoInput.addEventListener('input', function() {
    atualizarTotal();
  });
  
  // Finalização da venda
  btnFinalizar.addEventListener('click', function() {
    finalizarVenda();
  });
  
  // Modal de recibo
  btnFecharRecibo.addEventListener('click', function() {
    modalRecibo.style.display = 'none';
  });
  
  btnImprimir.addEventListener('click', function() {
    imprimirRecibo();
  });
  
  btnNovaVenda.addEventListener('click', function() {
    modalRecibo.style.display = 'none';
    reiniciarVenda();
  });
  
  // Funções
  
  function carregarGrupos() {
    const grupos = db.getGrupos();
    
    // Limpar opções existentes (exceto "Todos os Grupos")
    while (filtroGrupoSelect.options.length > 1) {
      filtroGrupoSelect.remove(1);
    }
    
    // Adicionar grupos
    grupos.forEach(grupo => {
      const option = document.createElement('option');
      option.value = grupo;
      option.textContent = grupo;
      filtroGrupoSelect.appendChild(option);
    });
  }
  
  function carregarProdutos() {
    const produtos = db.getProdutos();
    const termoBusca = buscaProdutoInput.value.toLowerCase();
    const grupoSelecionado = filtroGrupoSelect.value;
    
    // Limpar lista
    listaProdutos.innerHTML = '';
    
    // Filtrar produtos
    let produtosFiltrados = Object.values(produtos);
    
    if (termoBusca) {
      produtosFiltrados = produtosFiltrados.filter(produto => 
        produto.nome.toLowerCase().includes(termoBusca) || 
        produto.codigo_barras.includes(termoBusca)
      );
    }
    
    if (grupoSelecionado) {
      produtosFiltrados = produtosFiltrados.filter(produto => 
        produto.grupo === grupoSelecionado
      );
    }
    
    // Ordenar por nome
    produtosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));
    
    // Adicionar produtos à lista
    if (produtosFiltrados.length > 0) {
      produtosFiltrados.forEach(produto => {
        if (produto.estoque > 0) {
          const produtoCard = document.createElement('div');
          produtoCard.className = 'produto-card';
          produtoCard.setAttribute('data-id', produto.id);
          
          produtoCard.innerHTML = `
            <div class="produto-img">
              <img src="${produto.foto || 'assets/img/produto-default.png'}" alt="${produto.nome}">
            </div>
            <div class="produto-info">
              <div class="produto-nome" style="font-weight: 500; margin-bottom: 0.25rem;">${produto.nome}</div>
              <div class="produto-preco">R$ ${produto.preco.toFixed(2)}</div>
              <div class="produto-estoque">Estoque: ${produto.estoque}</div>
            </div>
          `;
          
          // Adicionar ao DOM
          listaProdutos.appendChild(produtoCard);
          
          // Evento de clique
          produtoCard.addEventListener('click', function() {
            adicionarAoCarrinho(produto);
          });
        }
      });
    } else {
      listaProdutos.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem 0; color: var(--text-muted);">
          <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem;"></i>
          <p>Nenhum produto encontrado</p>
        </div>
      `;
    }
  }
  
  function buscarPorCodigoBarras() {
    const codigo = codigoBarrasInput.value.trim();
    
    if (codigo) {
      const produto = db.getProdutoPorCodigoBarras(codigo);
      
      if (produto) {
        // Mostrar produto
        resultadoScanner.innerHTML = `
          <div class="card" style="margin-top: 1rem;">
            <div class="card-body">
              <div style="display: flex; gap: 1rem;">
                <div>
                  <img src="${produto.foto || 'assets/img/produto-default.png'}" alt="${produto.nome}" style="width: 100px; height: 100px; object-fit: contain;">
                </div>
                <div style="flex: 1;">
                  <h4>${produto.nome}</h4>
                  <p style="margin: 0; color: var(--text-muted);">Código: ${produto.codigo_barras}</p>
                  <p style="margin: 0; color: var(--primary); font-size: 1.25rem; font-weight: 600;">R$ ${produto.preco.toFixed(2)}</p>
                  <p style="margin: 0; color: var(--text-muted);">Estoque: ${produto.estoque}</p>
                  
                  <div style="margin-top: 1rem;">
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                      <label for="quantidade-scanner" class="form-label" style="margin: 0;">Quantidade:</label>
                      <input type="number" id="quantidade-scanner" class="form-control" value="1" min="1" max="${produto.estoque}" style="width: 80px;">
                      <button id="btn-adicionar-scanner" class="btn btn-primary">
                        <i class="fas fa-cart-plus"></i> Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        
        // Evento para adicionar ao carrinho
        document.getElementById('btn-adicionar-scanner').addEventListener('click', function() {
          const quantidade = parseInt(document.getElementById('quantidade-scanner').value);
          
          if (quantidade > 0 && quantidade <= produto.estoque) {
            adicionarAoCarrinho(produto, quantidade);
            
            // Limpar campo
            codigoBarrasInput.value = '';
            resultadoScanner.innerHTML = `
              <div class="alert" style="background-color: rgba(67, 160, 71, 0.1); border: 1px solid rgba(67, 160, 71, 0.3); color: var(--success); border-radius: var(--border-radius); padding: 1rem; margin-top: 1rem;">
                <i class="fas fa-check-circle"></i> Produto adicionado ao carrinho!
              </div>
            `;
            
            // Focar no campo de código
            setTimeout(() => {
              codigoBarrasInput.focus();
            }, 500);
          } else {
            alert('Quantidade inválida');
          }
        });
      } else {
        // Produto não encontrado
        resultadoScanner.innerHTML = `
          <div class="alert" style="background-color: rgba(229, 57, 53, 0.1); border: 1px solid rgba(229, 57, 53, 0.3); color: var(--danger); border-radius: var(--border-radius); padding: 1rem; margin-top: 1rem;">
            <i class="fas fa-exclamation-circle"></i> Produto não encontrado
          </div>
        `;
      }
    }
  }
  
  function carregarClientes() {
    const clientes = db.getClientes
      function carregarClientes() {
    const clientes = db.getClientes();
    
    // Limpar opções existentes
    clienteSelect.innerHTML = '';
    
    // Adicionar opções
    clientes.forEach(cliente => {
      const option = document.createElement('option');
      option.value = cliente.id;
      option.textContent = cliente.nome;
      clienteSelect.appendChild(option);
    });
  }
  
  function carregarFormasPagamento() {
    const formasPagamento = db.getFormasPagamento();
    
    // Limpar opções existentes
    formaPagamentoSelect.innerHTML = '';
    
    // Adicionar opções
    formasPagamento.forEach(forma => {
      const option = document.createElement('option');
      option.value = forma;
      option.textContent = forma;
      formaPagamentoSelect.appendChild(option);
    });
  }
  
  function adicionarAoCarrinho(produto, quantidade = 1) {
    // Verificar se a quantidade é válida
    if (quantidade > produto.estoque) {
      alert(`Quantidade indisponível. Estoque atual: ${produto.estoque}`);
      return;
    }
    
    // Criar item do carrinho
    const item = {
      produto_id: produto.id,
      produto_nome: produto.nome,
      codigo_barras: produto.codigo_barras,
      quantidade: quantidade,
      preco_unitario: produto.preco,
      subtotal: quantidade * produto.preco,
      foto: produto.foto
    };
    
    // Adicionar ao banco de dados
    db.adicionarItemCarrinho(item);
    
    // Atualizar interface
    atualizarCarrinho();
  }
  
  function atualizarCarrinho() {
    const carrinho = db.getCarrinho();
    
    // Verificar se o carrinho está vazio
    if (carrinho.length === 0) {
      carrinhoVazio.style.display = 'block';
      carrinhoItens.innerHTML = '';
      subtotalEl.textContent = 'R$ 0,00';
      totalEl.textContent = 'R$ 0,00';
      btnFinalizar.disabled = true;
      return;
    }
    
    // Ocultar mensagem de carrinho vazio
    carrinhoVazio.style.display = 'none';
    
    // Limpar itens
    carrinhoItens.innerHTML = '';
    
    // Adicionar itens ao carrinho
    let subtotal = 0;
    
    carrinho.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'carrinho-item';
      
      itemEl.innerHTML = `
        <div class="carrinho-img">
          <img src="${item.foto || 'assets/img/produto-default.png'}" alt="${item.produto_nome}">
        </div>
        <div class="carrinho-info">
          <div class="carrinho-nome">${item.produto_nome}</div>
          <div class="carrinho-detalhes">
            <span>${item.quantidade}x R$ ${item.preco_unitario.toFixed(2)}</span>
            <span>R$ ${item.subtotal.toFixed(2)}</span>
          </div>
        </div>
        <button class="btn-remover" data-index="${index}"
        <button class="btn-remover" data-index="${index}" style="background: none; border: none; color: var(--danger); cursor: pointer;">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      // Adicionar ao DOM
      carrinhoItens.appendChild(itemEl);
      
      // Evento para remover item
      itemEl.querySelector('.btn-remover').addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        removerDoCarrinho(index);
      });
      
      // Somar ao subtotal
      subtotal += item.subtotal;
    });
    
    // Atualizar subtotal
    subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
    
    // Atualizar total
    atualizarTotal();
    
    // Habilitar botão de finalizar
    btnFinalizar.disabled = false;
  }
  
  function removerDoCarrinho(index) {
    // Remover do banco de dados
    db.removerItemCarrinho(index);
    
    // Atualizar interface
    atualizarCarrinho();
  }
  
  function atualizarTotal() {
    const carrinho = db.getCarrinho();
    
    // Calcular subtotal
    const subtotal = carrinho.reduce((acc, item) => acc + item.subtotal, 0);
    
    // Calcular desconto
    const percentualDesconto = parseFloat(descontoInput.value) || 0;
    const valorDesconto = (subtotal * percentualDesconto) / 100;
    
    // Calcular total
    const total = subtotal - valorDesconto;
    
    // Atualizar interface
    totalEl.textContent = `R$ ${total.toFixed(2)}`;
  }
  
  function finalizarVenda() {
    const carrinho = db.getCarrinho();
    
    if (carrinho.length === 0) {
      alert('O carrinho está vazio');
      return;
    }
    
    // Obter dados da venda
    const clienteId = clienteSelect.value;
    const clienteNome = clienteSelect.options[clienteSelect.selectedIndex].text;
    const formaPagamento = formaPagamentoSelect.value;
    const subtotal = carrinho.reduce((acc, item) => acc + item.subtotal, 0);
    const percentualDesconto = parseFloat(descontoInput.value) || 0;
    const valorDesconto = (subtotal * percentualDesconto) / 100;
    const total = subtotal - valorDesconto;
    
    // Criar objeto da venda
    const venda = {
      id: null, // Será gerado pelo banco de dados
      data: null, // Será gerado pelo banco de dados
      cliente_id: clienteId,
      cliente_nome: clienteNome,
      forma_pagamento: formaPagamento,
      itens: carrinho,
      subtotal: subtotal,
      desconto: valorDesconto,
      total: total,
      usuario: auth.getUsuarioAtual().username
    };
    
    // Salvar venda
    const vendaFinalizada = db.salvarVenda(venda);
    
    // Exibir recibo
    exibirRecibo(vendaFinalizada);
  }
  
  function exibirRecibo(venda) {
    // Obter dados da empresa
    const config = db.getConfig();
    
    // Formatar data
    const data = new Date(venda.data);
    const dataFormatada = data.toLocaleDateString('pt-BR') + ' ' + 
                         data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    // Criar HTML do recibo
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 100%; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">${config.nome_empresa || 'ORION PDV'}</h2>
          <p style="margin: 5px 0;">${config.slogan || 'Sistema de Gestão de Vendas'}</p>
          <p style="margin: 5px 0;">${config.endereco || ''} ${config.cidade || ''}</p>
          <p style="margin: 5px 0; color: var(--text-muted);">${config.cnpj || ''}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <table style="width: 100%; border-spacing: 0;">
            <tr>
              <td style="width: 50%;"><strong>Venda #:</strong> ${venda.id}</td>
              <td style="width: 50%; text-align: right;"><strong>Data:</strong> ${dataFormatada}</td>
            </tr>
            <tr>
              <td><strong>Cliente:</strong> ${venda.cliente_nome}</td>
              <td style="text-align: right;"><strong>Pagamento:</strong> ${venda.forma_pagamento}</td>
            </tr>
            <tr>
              <td><strong>Atendente:</strong> ${auth.getUsuarioAtual().nome}</td>
              <td></td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: var(--dark-lighter); color: var(--text-light);">
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Produto</th>
                <th style="padding: 8px; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Qtde</th>
                <th style="padding: 8px; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Preço</th>
                <th style="padding: 8px; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">Total</th>
              </tr>
            </thead>
            <tbody>
              ${venda.itens.map(item => `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">${item.produto_nome}</td>
                  <td style="padding: 8px; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">${item.quantidade}</td>
                  <td style="padding: 8px; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">R$ ${item.preco_unitario.toFixed(2)}</td>
                  <td style="padding: 8px; text-align: right; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">R$ ${item.subtotal.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div style="margin-bottom: 20px; text-align: right;">
          <table style="width: 250px; margin-left: auto; border-spacing: 0;">
            <tr>
              <td style="padding: 5px 0;"><strong>Subtotal:</strong></td>
              <td style="padding: 5px 0; text-align: right;">R$ ${venda.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Desconto:</strong></td>
              <td style="padding: 5px 0; text-align: right;">R$ ${venda.desconto.toFixed(2)}</td>
            </tr>
            <tr style="font-size: 1.2em;">
              <td style="padding: 10px 0; border-top: 1px solid rgba(255, 255, 255, 0.1);"><strong>Total:</strong></td>
              <td style="padding: 10px 0; text-align: right; border-top: 1px solid rgba(255, 255, 255, 0.1);"><strong>R$ ${venda.total.toFixed(2)}</strong></td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: var(--text-muted);">
          <p style="margin: 5px 0;">Obrigado pela preferência!</p>
          <p style="margin: 5px 0;">Volte sempre</p>
          <p style="margin: 5px 0; font-size: 0.8em;">ORION PDV - ADM. JESUS MARTINS O. JR.</p>
        </div>
      </div>
    `;
    
    // Exibir no modal
    reciboConteudo.innerHTML = html;
    modalRecibo.style.display = 'flex';
  }
  
  function imprimirRecibo() {
    const conteudo = reciboConteudo.innerHTML;
    
    // Criar janela para impressão
    const janela = window.open('', '_blank');
    
    // Escrever conteúdo
    janela.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Recibo de Venda</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
            background-color: white;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        ${conteudo}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `);
  }
  
  function reiniciarVenda() {
    // Limpar campos
    buscaProdutoInput.value = '';
    codigoBarrasInput.value = '';
    descontoInput.value = '0';
    clienteSelect.value = '1'; // Consumidor Final
    
    // Carregar produtos
    carregarProdutos();
  }
});
        
        
