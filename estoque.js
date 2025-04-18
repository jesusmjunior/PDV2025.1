// assets/js/estoque.js
document.addEventListener('DOMContentLoaded', function() {
  // Verificar autenticação
  if (!auth.verificarAutenticacao()) {
    window.location.href = 'index.html';
    return;
  }
  
  // Elementos DOM - Abas
  const tabListagem = document.getElementById('tab-listagem');
  const tabMovimentacoes = document.getElementById('tab-movimentacoes');
  const tabScanner = document.getElementById('tab-scanner');
  
  const contentListagem = document.getElementById('content-listagem');
  const contentMovimentacoes = document.getElementById('content-movimentacoes');
  const contentScanner = document.getElementById('content-scanner');
  
  // Elementos DOM - Listagem
  const buscaProdutoInput = document.getElementById('busca-produto');
  const filtroGrupoSelect = document.getElementById('filtro-grupo');
  const tabelaProdutos = document.getElementById('tabela-produtos');
  const btnExportar = document.getElementById('btn-exportar');
  
  // Elementos DOM - Movimentações
  const tabelaMovimentacoes = document.getElementById('tabela-movimentacoes');
  const btnNovaMovimentacao = document.getElementById('btn-nova-movimentacao');
  
  // Elementos DOM - Scanner
  const codigoBarrasInput = document.getElementById('codigo-barras');
  const btnBuscarCodigo = document.getElementById('btn-buscar-codigo');
  const btnEscanear = document.getElementById('btn-escanear');
  const btnCancelarScan = document.getElementById('btn-cancelar-scan');
  const cameraContainer = document.getElementById('camera-container');
  const scannerVideo = document.getElementById('scanner-video');
  const resultadoScanner = document.getElementById('resultado-scanner');
  
  // Elementos DOM - Modal
  const modalEstoque = document.getElementById('modal-estoque');
  const modalTitulo = document.getElementById('modal-titulo');
  const formEstoque = document.getElementById('form-estoque');
  const produtoIdSelect = document.getElementById('produto-id');
  const tipoMovimentacaoSelect = document.getElementById('tipo-movimentacao');
  const quantidadeInput = document.getElementById('quantidade');
  const motivoSelect = document.getElementById('motivo');
  const outroMotivoContainer = document.getElementById('outro-motivo-container');
  const outroMotivoInput = document.getElementById('outro-motivo');
  const observacaoInput = document.getElementById('observacao');
  const btnCloseModal = document.querySelectorAll('.btn-close-modal');
  
  // Variáveis de controle
  let scanner = null;
  
  // Dados do usuário
  const user = auth.getUsuarioAtual();
  document.getElementById('user-name').textContent = user.nome;
  
  // Data atual
  const dataAtual = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('current-date').textContent = dataAtual.toLocaleDateString('pt-BR', options);
  
  // Carregar dados iniciais
  carregarGrupos();
  carregarProdutos();
  carregarMovimentacoes();
  carregarProdutosSelect();
  
  // Event Listeners - Abas
  tabListagem.addEventListener('click', function(e) {
    e.preventDefault();
    ativarAba('listagem');
  });
  
  tabMovimentacoes.addEventListener('click', function(e) {
    e.preventDefault();
    ativarAba('movimentacoes');
  });
  
  tabScanner.addEventListener('click', function(e) {
    e.preventDefault();
    ativarAba('scanner');
  });
  
  // Event Listeners - Listagem
  buscaProdutoInput.addEventListener('input', carregarProdutos);
  filtroGrupoSelect.addEventListener('change', carregarProdutos);
  btnExportar.addEventListener('click', exportarEstoque);
  
  // Event Listeners - Movimentações
  btnNovaMovimentacao.addEventListener('click', abrirModalMovimentacao);
  
  // Event Listeners - Scanner
  btnBuscarCodigo.addEventListener('click', buscarPorCodigoBarras);
  btnEscanear.addEventListener('click', iniciarScanner);
  btnCancelarScan.addEventListener('click', pararScanner);
  
  codigoBarrasInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      buscarPorCodigoBarras();
    }
  });
  
  // Event Listeners - Modal
  formEstoque.addEventListener('submit', function(e) {
    e.preventDefault();
    salvarMovimentacao();
  });
  
  motivoSelect.addEventListener('change', function() {
    if (this.value === 'outro') {
      outroMotivoContainer.style.display = 'block';
      outroMotivoInput.required = true;
    } else {
      outroMotivoContainer.style.display = 'none';
      outroMotivoInput.required = false;
    }
  });
  
  btnCloseModal.forEach(btn => {
    btn.addEventListener('click', function() {
      modalEstoque.style.display = 'none';
    });
  });
  
  // Logout
  document.getElementById('btn-logout').addEventListener('click', function() {
    auth.fazerLogout();
    window.location.href = 'index.html';
  });
  
  // Funções - Abas
  function ativarAba(aba) {
    // Desativar todas as abas
    tabListagem.classList.remove('active');
    tabListagem.style.color = 'var(--text-muted)';
    tabListagem.style.borderBottom = '2px solid transparent';
    
    tabMovimentacoes.classList.remove('active');
    tabMovimentacoes.style.color = 'var(--text-muted)';
    tabMovimentacoes.style.borderBottom = '2px solid transparent';
    
    tabScanner.classList.remove('active');
    tabScanner.style.color = 'var(--text-muted)';
    tabScanner.style.borderBottom = '2px solid transparent';
    
    // Ocultar todos os conteúdos
    contentListagem.style.display = 'none';
    contentMovimentacoes.style.display = 'none';
    contentScanner.style.display = 'none';
    
    // Ativar aba selecionada
    if (aba === 'listagem') {
      tabListagem.classList.add('active');
      tabListagem.style.color = 'var(--text-light)';
      tabListagem.style.borderBottom = '2px solid var(--primary)';
      contentListagem.style.display = 'block';
    } else if (aba === 'movimentacoes') {
      tabMovimentacoes.classList.add('active');
      tabMovimentacoes.style.color = 'var(--text-light)';
      tabMovimentacoes.style.borderBottom = '2px solid var(--primary)';
      contentMovimentacoes.style.display = 'block';
    } else if (aba === 'scanner') {
      tabScanner.classList.add('active');
      tabScanner.style.color = 'var(--text-light)';
      tabScanner.style.borderBottom = '2px solid var(--primary)';
      contentScanner.style.display = 'block';
    }
    
    // Parar scanner se sair da aba
    if (aba !== 'scanner' && scanner) {
      pararScanner();
    }
  }
  
  // Funções - Carregamento de dados
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
    
    // Limpar tabela
    const tbody = tabelaProdutos.querySelector('tbody');
    tbody.innerHTML = '';
    
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
    
    // Adicionar à tabela
    produtosFiltrados.forEach(produto => {
      const tr = document.createElement('tr');
      
      // Definir status
      let status = '';
      let statusClass = '';
      
      if (produto.estoque <= 0) {
        status = 'Sem estoque';
        statusClass = 'danger';
      } else if (produto.estoque <= produto.estoque_minimo) {
        status = 'Baixo';
        statusClass = 'warning';
      } else {
        status = 'Normal';
        statusClass = 'success';
      }
      
      tr.innerHTML = `
        <td>${produto.codigo_barras}</td>
        <td>${produto.nome}</td>
        <td>${produto.grupo}</td>
        <td>R$ ${produto.preco.toFixed(2)}</td>
        <td>${produto.estoque}</td>
        <td>${produto.estoque_minimo}</td>
        <td><span class="badge bg-${statusClass}">${status}</span></td>
        <td>
          <button class="btn btn-outline-primary btn-sm btn-adicionar" data-id="${produto.id}" title="Adicionar Estoque">
            <i class="fas fa-plus"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm btn-subtrair" data-id="${produto.id}" title="Remover Estoque">
            <i class="fas fa-minus"></i>
          </button>
          <button class="btn btn-outline-info btn-sm btn-ajustar" data-id="${produto.id}" title="Ajustar Estoque">
            <i class="fas fa-sync-alt"></i>
          </button>
        </td>
      `;
      
      tbody.appendChild(tr);
    });
    
    // Adicionar eventos aos botões
    document.querySelectorAll('.btn-adicionar').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        abrirModalMovimentacao('entrada', id);
      });
    });
    
    document.querySelectorAll('.btn-subtrair').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        abrirModalMovimentacao('saida', id);
      });
    });
    
    document.querySelectorAll('.btn-ajustar').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        abrirModalMovimentacao('ajuste', id);
      });
    });
  }
  
  function carregarMovimentacoes() {
    // Obter movimentações do banco de dados
    const movimentacoes = db.getMovimentacoesEstoque ? db.getMovimentacoesEstoque() : [];
    
    const tbody = tabelaMovimentacoes.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Ordenar por data (mais recentes primeiro)
    const movimentacoesOrdenadas = [...movimentacoes].sort((a, b) => 
      new Date(b.data) - new Date(a.data)
    );
    
    // Adicionar à tabela
    if (movimentacoesOrdenadas.length > 0) {
      movimentacoesOrdenadas.forEach(mov => {
        const tr = document.createElement('tr');
        
        // Formatar data
        const data = new Date(mov.data);
        const dataFormatada = data.toLocaleDateString('pt-BR') + ' ' + 
                              data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Formatar tipo
        let tipoFormatado = '';
        let tipoClass = '';
        
        if (mov.tipo === 'entrada') {
          tipoFormatado = 'Entrada';
          tipoClass = 'success';
        } else if (mov.tipo === 'saida') {
          tipoFormatado = 'Saída';
          tipoClass = 'danger';
        } else {
          tipoFormatado = 'Ajuste';
          tipoClass = 'warning';
        }
        
        tr.innerHTML = `
          <td>${dataFormatada}</td>
          <td>${mov.produto_nome}</td>
          <td><span class="badge bg-${tipoClass}">${tipoFormatado}</span></td>
          <td>${mov.quantidade}</td>
          <td>${mov.motivo}</td>
          <td>${mov.usuario}</td>
        `;
        
        tbody.appendChild(tr);
      });
    } else {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center;">Nenhuma movimentação de estoque registrada</td>
        </tr>
      `;
    }
  }
  
  function carregarProdutosSelect() {
    const produtos = db.getProdutos();
    
    // Limpar opções existentes
    produtoIdSelect.innerHTML = '';
    
    // Adicionar opção vazia
    const optionVazia = document.createElement('option');
    optionVazia.value = '';
    optionVazia.textContent = 'Selecione um produto';
    produtoIdSelect.appendChild(optionVazia);
    
    // Ordenar por nome
    const produtosOrdenados = Object.values(produtos).sort((a, b) => 
      a.nome.localeCompare(b.nome)
    );
    
    // Adicionar produtos
    produtosOrdenados.forEach(produto => {
      const option = document.createElement('option');
      option.value = produto.id;
      option.textContent = `${produto.nome} (${produto.codigo_barras}) - Est: ${produto.estoque}`;
      produtoIdSelect.appendChild(option);
    });
  }
  
  // Funções - Scanner
  function buscarPorCodigoBarras() {
    const codigo = codigoBarrasInput.value.trim();
    
    if (codigo) {
      const produto = db.getProdutoPorCodigoBarras(codigo);
      
      if (produto) {
        // Mostrar produto
        resultadoScanner.innerHTML = `
          <div class="card">
            <div class="card-header">
              <i class="fas fa-box"></i> Produto Encontrado
            </div>
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
                      <button class="btn btn-outline-primary btn-sm" onclick="window.location.href='produto.html?id=${produto.id}'">
                        <i class="fas fa-edit"></i> Editar Produto
                      </button>
                      <button class="btn btn-primary btn-sm btn-adicionar-scanner" data-id="${produto.id}">
                        <i class="fas fa-plus"></i> Adicionar Estoque
                      </button>
                      <button class="btn btn-outline-danger btn-sm btn-subtrair-scanner" data-id="${produto.id}">
                        <i class="fas fa-minus"></i> Remover Estoque
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        
        // Adicionar eventos aos botões
        document.querySelector('.btn-adicionar-scanner').addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          abrirModalMovimentacao('entrada', id);
        });
        
        document.querySelector('.btn-subtrair-scanner').addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          abrirModalMovimentacao('saida', id);
        });
      } else {
        // Produto não encontrado
        resultadoScanner.innerHTML = `
          <div class="alert" style="background-color: rgba(229, 57, 53, 0.1); border: 1px solid rgba(229, 57, 53, 0.3); color: var(--danger); border-radius: var(--border-radius); padding: 1rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <i class="fas fa-exclamation-circle" style="font-size: 2rem;"></i>
              <div>
                <h4 style="margin-top: 0;">Produto não encontrado</h4>
                <p style="margin-bottom: 0;">O código de barras "${codigo}" não está cadastrado no sistema.</p>
                <a href="produto.html" class="btn btn-outline-primary btn-sm" style="margin-top: 0.5rem;">
                  <i class="fas fa-plus"></i> Cadastrar Novo Produto
                </a>
              </div>
            </div>
          </div>
        `;
      }
    }
  }
  
  // Esta função será substituída pela implementação em barcode-integration.js
  function iniciarScanner() {
    // Mostrar container da câmera
    cameraContainer.style.display = 'block';
    
    // Inicializar scanner Quagga
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: scannerVideo,
        constraints: {
          width: 480,
          height: 320,
          facingMode: "environment"
        },
      },
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader"
        ]
      },
    }, function(err) {
      if (err) {
        console.error(err);
        alert("Erro ao inicializar o scanner: " + err);
        return;
      }
      
      console.log("Quagga inicializado!");
      
      // Iniciar scanner
      Quagga.start();
      
      // Detectar código de barras
      Quagga.onDetected(function(result) {
        // Obter código lido
        const code = result.codeResult.code;
        
        // Parar scanner
        pararScanner();
        
        // Preencher campo de código
        codigoBarrasInput.value = code;
        
        // Buscar produto
        buscarPorCodigoBarras();
      });
    });
    
    scanner = true;
  }
  
  // Esta função será substituída pela implementação em barcode-integration.js
  function pararScanner() {
    if (scanner) {
      Quagga.stop();
      cameraContainer.style.display = 'none';
      scanner = false;
    }
  }
  
  // Funções - Modal e Movimentações
  function abrirModalMovimentacao(tipo = 'entrada', produtoId = '') {
    // Configurar modal
    tipoMovimentacaoSelect.value = tipo || 'entrada';
    
    if (produtoId) {
      produtoIdSelect.value = produtoId;
      produtoIdSelect.disabled = true;
    } else {
      produtoIdSelect.disabled = false;
    }
    
    // Resetar outros campos
    quantidadeInput.value = '1';
    motivoSelect.value = 'compra';
    observacaoInput.value = '';
    outroMotivoInput.value = '';
    outroMotivoContainer.style.display = 'none';
    
    // Definir título
    if (tipo === 'entrada') {
      modalTitulo.textContent = 'Entrada de Estoque';
    } else if (tipo === 'saida') {
      modalTitulo.textContent = 'Saída de Estoque';
      motivoSelect.value = 'venda';
    } else {
      modalTitulo.textContent = 'Ajuste de Estoque';
      motivoSelect.value = 'ajuste';
    }
    
    // Exibir modal
    modalEstoque.style.display = 'flex';
    
    // Focar no primeiro campo
    if (!produtoId) {
      setTimeout(() => produtoIdSelect.focus(), 100);
    } else {
      setTimeout(() => quantidadeInput.focus(), 100);
    }
  }
  
  function salvarMovimentacao() {
    // Obter dados do formulário
    const produtoId = produtoIdSelect.value;
    const tipo = tipoMovimentacaoSelect.value;
    const quantidade = parseInt(quantidadeInput.value);
    const motivo = motivoSelect.value === 'outro' ? outroMotivoInput.value : motivoSelect.value;
    const observacao = observacaoInput.value;
    
    // Validações
    if (!produtoId) {
      alert('Selecione um produto');
      return;
    }
    
    if (!quantidade || quantidade <= 0) {
      alert('Informe uma quantidade válida');
      return;
    }
    
    // Obter produto
    const produto = db.getProduto(produtoId);
    
    if (!produto) {
      alert('Produto não encontrado');
      return;
    }
    
    // Verificar estoque para saída
    if (tipo === 'saida' && quantidade > produto.estoque) {
      alert(`Quantidade inválida. O estoque atual é de ${produto.estoque} unidades.`);
      return;
    }
    
    // Criar objeto de movimentação
    const movimentacao = {
      id: null, // Será gerado pelo banco de dados
      data: new Date().toISOString(),
      produto_id: produtoId,
      produto_nome: produto.nome,
      tipo: tipo,
      quantidade: quantidade,
      motivo: motivo,
      observacao: observacao,
      usuario: auth.getUsuarioAtual().username
    };
    
    // Atualizar estoque do produto
    if (tipo === 'entrada') {
      // Entrada: adicionar ao estoque
      db.atualizarEstoqueProduto(produtoId, quantidade);
    } else if (tipo === 'saida') {
      // Saída: subtrair do estoque
      db.atualizarEstoqueProduto(produtoId, -quantidade);
    } else {
      // Ajuste: definir valor específico
      const novoEstoque = quantidade;
      const diferenca = novoEstoque - produto.estoque;
      db.atualizarEstoqueProduto(produtoId, diferenca);
      
      // Atualizar quantidade na movimentação para a diferença
      movimentacao.quantidade = Math.abs(diferenca);
      movimentacao.tipo = diferenca >= 0 ? 'entrada' : 'saida';
    }
    
    // Salvar movimentação
    try {
      if (typeof db.salvarMovimentacaoEstoque === 'function') {
        db.salvarMovimentacaoEstoque(movimentacao);
      } else {
        console.warn('Função db.salvarMovimentacaoEstoque não implementada');
        // Implementar fallback ou alerta para usuário
      }
      
      // Fechar modal
      modalEstoque.style.display = 'none';
      
      // Atualizar tabelas
      carregarProdutos();
      carregarMovimentacoes();
      carregarProdutosSelect();
      
      // Exibir mensagem de sucesso
      exibirMensagem('Movimentação de estoque registrada com sucesso', 'success');
    } catch (erro) {
      alert('Erro ao registrar movimentação: ' + erro);
    }
  }
  
  function exportarEstoque() {
    const produtos = db.getProdutos();
    
    // Transformar para formato tabular
    const dados = Object.values(produtos).map(produto => ({
      'Código de Barras': produto.codigo_barras,
      'Nome': produto.nome,
      'Grupo': produto.grupo,
      'Marca': produto.marca || '',
      'Preço': produto.preco.toFixed(2),
      'Estoque Atual': produto.estoque,
      'Estoque Mínimo': produto.estoque_minimo,
      'Status': produto.estoque <= 0 ? 'Sem estoque' : (produto.estoque <= produto.estoque_minimo ? 'Estoque baixo' : 'Normal')
    }));
    
    // Nome do arquivo
    const dataAtual = new Date().toISOString().split('T')[0];
    const nomeArquivo = `estoque_${dataAtual}.csv`;
    
    // Exportar CSV
    try {
      db.exportarCSV(dados, nomeArquivo);
      exibirMensagem('Relatório de estoque exportado com sucesso', 'success');
    } catch (erro) {
      alert('Erro ao exportar estoque: ' + erro);
    }
  }
  
  // Função para exibir mensagens toast
  function exibirMensagem(mensagem, tipo) {
    // Criar toast
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${tipo}`;
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'warning' ? 'exclamation-circle' : 'times-circle'}"></i>
        <span>${mensagem}</span>
      </div>
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(toast);
    
    // Exibir com animação
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
  
  // Tornar funções importantes acessíveis globalmente para integração com barcode-integration.js
  window.buscarPorCodigoBarras = buscarPorCodigoBarras;
  window.iniciarScanner = iniciarScanner;
  window.pararScanner = pararScanner;
});
