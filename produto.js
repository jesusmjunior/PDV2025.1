// assets/js/produto.js
document.addEventListener('DOMContentLoaded', function() {
  // Verificar autenticação
  if (!auth.verificarAutenticacao()) {
    window.location.href = 'index.html';
    return;
  }
  
  // Elementos DOM
  const buscaProdutoInput = document.getElementById('busca-produto');
  const filtroGrupoSelect = document.getElementById('filtro-grupo');
  const tabelaProdutos = document.getElementById('tabela-produtos');
  const formProduto = document.getElementById('form-produto');
  const cardFormulario = document.getElementById('card-formulario');
  const formTitulo = document.getElementById('form-titulo');
  const produtoIdInput = document.getElementById('produto-id');
  const codigoBarrasInput = document.getElementById('codigo-barras');
  const nomeInput = document.getElementById('nome');
  const grupoSelect = document.getElementById('grupo');
  const marcaSelect = document.getElementById('marca');
  const precoInput = document.getElementById('preco');
  const estoqueInput = document.getElementById('estoque');
  const estoqueMinimoInput = document.getElementById('estoque-minimo');
  const fotoInput = document.getElementById('foto');
  const btnNovoGrupo = document.getElementById('btn-novo-grupo');
  const btnNovaMarca = document.getElementById('btn-nova-marca');
  const btnNovoProduto = document.getElementById('btn-novo-produto');
  const btnCancelar = document.getElementById('btn-cancelar');
  const btnGerarCodigo = document.getElementById('btn-gerar-codigo');
  const btnScannerCodigo = document.getElementById('btn-scanner-codigo');
  
  // Modal
  const modalAdicionar = document.getElementById('modal-adicionar');
  const modalTitulo = document.getElementById('modal-titulo');
  const modalLabel = document.getElementById('modal-label');
  const novoItemInput = document.getElementById('novo-item');
  const formModal = document.getElementById('form-modal');
  const btnCloseModal = document.querySelectorAll('.btn-close-modal');
  
  // Modal Scanner
  const modalScanner = document.getElementById('modal-scanner');
  const btnCloseScanner = document.querySelectorAll('.btn-close-scanner');
  const scannerVideo = document.getElementById('scanner-video');
  
  // Variáveis de controle
  let modoEdicao = false;
  let tipoModal = '';
  let scannerAtivo = false;
  let barcodeScanner = null;
  
  // Dados do usuário
  const user = auth.getUsuarioAtual();
  document.getElementById('user-name').textContent = user.nome;
  
  // Data atual
  const dataAtual = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('current-date').textContent = dataAtual.toLocaleDateString('pt-BR', options);
  
  // Inicializar scanner de código de barras
  initBarcodeScanner();
  
  // Carregar dados iniciais
  carregarGrupos();
  carregarMarcas();
  carregarProdutos();
  
  // Verificar se tem parâmetro na URL para edição de produto
  const urlParams = new URLSearchParams(window.location.search);
  const idProduto = urlParams.get('id');
  if (idProduto) {
    editarProduto(idProduto);
  }
  
  // Event Listeners
  buscaProdutoInput.addEventListener('input', carregarProdutos);
  filtroGrupoSelect.addEventListener('change', carregarProdutos);
  formProduto.addEventListener('submit', salvarProduto);
  btnNovoProduto.addEventListener('click', novoProduto);
  btnCancelar.addEventListener('click', cancelarFormulario);
  btnGerarCodigo.addEventListener('click', gerarCodigoBarras);
  
  // Scanner de código de barras
  if (btnScannerCodigo) {
    btnScannerCodigo.addEventListener('click', abrirScannerCodigo);
  }
  
  if (btnCloseScanner) {
    btnCloseScanner.forEach(btn => {
      btn.addEventListener('click', fecharScannerCodigo);
    });
  }
  
  btnNovoGrupo.addEventListener('click', function() {
    abrirModal('grupo');
  });
  
  btnNovaMarca.addEventListener('click', function() {
    abrirModal('marca');
  });
  
  btnCloseModal.forEach(btn => {
    btn.addEventListener('click', function() {
      modalAdicionar.style.display = 'none';
    });
  });
  
  formModal.addEventListener('submit', function(e) {
    e.preventDefault();
    salvarItemModal();
  });
  
  // Validação de código de barras
  codigoBarrasInput.addEventListener('blur', function() {
    validarCodigoBarras(this.value);
  });
  
  // Logout
  document.getElementById('btn-logout').addEventListener('click', function() {
    auth.fazerLogout();
    window.location.href = 'index.html';
  });
  
  // Função para inicializar o scanner de código de barras
  function initBarcodeScanner() {
    // Verificar se o elemento do scanner e a biblioteca Quagga existem
    if (!scannerVideo || typeof Quagga === 'undefined') {
      console.warn('Scanner de código de barras não disponível: elementos DOM ou biblioteca não encontrados');
      return;
    }
    
    // Criar instância do scanner
    barcodeScanner = {
      start: function() {
        if (scannerAtivo) return;
        
        scannerAtivo = true;
        
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
            exibirMensagem("Erro ao inicializar o scanner: " + err, "error");
            scannerAtivo = false;
            return;
          }
          
          console.log("Scanner inicializado com sucesso!");
          
          // Iniciar scanner
          Quagga.start();
          
          // Detectar código de barras
          Quagga.onDetected(function(result) {
            // Obter código lido
            const code = result.codeResult.code;
            
            // Parar scanner
            barcodeScanner.stop();
            
            // Preencher campo de código
            codigoBarrasInput.value = code;
            
            // Verificar se o produto já existe
            const produto = db.getProdutoPorCodigoBarras(code);
            if (produto) {
              // Se o produto já existe, carrega para edição
              editarProduto(produto.id);
              exibirMensagem(`Produto com código ${code} já cadastrado. Editando produto...`, 'info');
            } else {
              // Focar no campo de nome para continuar o cadastro
              nomeInput.focus();
            }
            
            // Fechar modal
            fecharScannerCodigo();
          });
        });
      },
      
      stop: function() {
        if (!scannerAtivo) return;
        
        Quagga.stop();
        scannerAtivo = false;
      }
    };
  }
  
  // Funções para manipular o scanner
  function abrirScannerCodigo() {
    if (!modalScanner) return;
    
    // Exibir modal
    modalScanner.style.display = 'flex';
    
    // Iniciar scanner
    if (barcodeScanner) {
      barcodeScanner.start();
    }
  }
  
  function fecharScannerCodigo() {
    if (!modalScanner) return;
    
    // Parar scanner
    if (barcodeScanner) {
      barcodeScanner.stop();
    }
    
    // Ocultar modal
    modalScanner.style.display = 'none';
  }
  
  // Funções para manipulação de dados
  function carregarGrupos() {
    const grupos = db.getGrupos();
    
    // Limpar opções existentes
    grupoSelect.innerHTML = '';
    
    // Adicionar grupos ao select do formulário
    grupos.forEach(grupo => {
      const option = document.createElement('option');
      option.value = grupo;
      option.textContent = grupo;
      grupoSelect.appendChild(option);
    });
    
    // Limpar opções do filtro (exceto "Todos os Grupos")
    while (filtroGrupoSelect.options.length > 1) {
      filtroGrupoSelect.remove(1);
    }
    
    // Adicionar grupos ao filtro
    grupos.forEach(grupo => {
      const option = document.createElement('option');
      option.value = grupo;
      option.textContent = grupo;
      filtroGrupoSelect.appendChild(option);
    });
  }
  
  function carregarMarcas() {
    const marcas = db.getMarcas();
    
    // Limpar opções existentes
    marcaSelect.innerHTML = '';
    
    // Adicionar opção em branco
    const optionVazia = document.createElement('option');
    optionVazia.value = '';
    optionVazia.textContent = 'Selecione uma marca';
    marcaSelect.appendChild(optionVazia);
    
    // Adicionar marcas
    marcas.forEach(marca => {
      const option = document.createElement('option');
      option.value = marca;
      option.textContent = marca;
      marcaSelect.appendChild(option);
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
      
      tr.innerHTML = `
        <td>${produto.codigo_barras}</td>
        <td>${produto.nome}</td>
        <td>${produto.grupo}</td>
        <td>R$ ${produto.preco.toFixed(2)}</td>
        <td>
          <span class="${produto.estoque <= produto.estoque_minimo ? 'text-danger' : ''}">
            ${produto.estoque}
          </span>
        </td>
        <td>
          <button class="btn btn-outline-primary btn-sm btn-editar" data-id="${produto.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm btn-excluir" data-id="${produto.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      
      tbody.appendChild(tr);
    });
    
    // Adicionar eventos aos botões
    document.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        editarProduto(id);
      });
    });
    
    document.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        excluirProduto(id);
      });
    });
  }
  
  function novoProduto() {
    // Limpar formulário
    formProduto.reset();
    produtoIdInput.value = '';
    
    // Configurar modo
    modoEdicao = false;
    formTitulo.textContent = 'Novo Produto';
    
    // Valores padrão
    estoqueMinimoInput.value = '5';
  }
  
  function editarProduto(id) {
    const produto = db.getProduto(id);
    
    if (produto) {
      // Preencher formulário
      produtoIdInput.value = produto.id;
      codigoBarrasInput.value = produto.codigo_barras;
      nomeInput.value = produto.nome;
      grupoSelect.value = produto.grupo;
      marcaSelect.value = produto.marca || '';
      precoInput.value = produto.preco;
      estoqueInput.value = produto.estoque;
      estoqueMinimoInput.value = produto.estoque_minimo;
      fotoInput.value = produto.foto || '';
      
      // Configurar modo
      modoEdicao = true;
      formTitulo.textContent = 'Editar Produto';
      
      // Scroll até o formulário em dispositivos móveis
      if (window.innerWidth < 768) {
        cardFormulario.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
  
  function excluirProduto(id) {
    const produto = db.getProduto(id);
    
    if (produto) {
      const confirmar = confirm(`Deseja realmente excluir o produto "${produto.nome}"?`);
      
      if (confirmar) {
        try {
          db.deletarProduto(id);
          carregarProdutos();
          exibirMensagem('Produto excluído com sucesso', 'success');
        } catch (erro) {
          exibirMensagem('Erro ao excluir produto: ' + erro, 'error');
        }
      }
    }
  }
  
  function salvarProduto(e) {
    e.preventDefault();
    
    // Validar código de barras
    if (!validarCodigoBarras(codigoBarrasInput.value)) {
      return;
    }
    
    // Obter dados do formulário
    const produto = {
      id: produtoIdInput.value,
      codigo_barras: codigoBarrasInput.value,
      nome: nomeInput.value,
      grupo: grupoSelect.value,
      marca: marcaSelect.value,
      preco: parseFloat(precoInput.value),
      estoque: parseInt(estoqueInput.value),
      estoque_minimo: parseInt(estoqueMinimoInput.value),
      foto: fotoInput.value
    };
    
    try {
      // Verificar se já existe um produto com o mesmo código de barras (exceto o próprio produto em edição)
      if (!modoEdicao) {
        const produtoExistente = db.getProdutoPorCodigoBarras(produto.codigo_barras);
        if (produtoExistente) {
          exibirMensagem(`Já existe um produto cadastrado com este código de barras: ${produtoExistente.nome}`, 'warning');
          codigoBarrasInput.focus();
          return;
        }
      }
      
      // Salvar produto
      db.salvarProduto(produto);
      
      // Atualizar tabela
      carregarProdutos();
      
      // Limpar formulário
      formProduto.reset();
      produtoIdInput.value = '';
      
      // Resetar modo
      modoEdicao = false;
      formTitulo.textContent = 'Novo Produto';
      
      // Mensagem de sucesso
      exibirMensagem('Produto salvo com sucesso', 'success');
    } catch (erro) {
      exibirMensagem('Erro ao salvar produto: ' + erro, 'error');
    }
  }
  
  function cancelarFormulario() {
    // Limpar formulário
    formProduto.reset();
    produtoIdInput.value = '';
    
    // Resetar modo
    modoEdicao = false;
    formTitulo.textContent = 'Novo Produto';
  }
  
  // Função para gerar código de barras EAN-13 válido
  function gerarCodigoBarras() {
    // Gerar código de 13 dígitos (EAN-13)
    let codigo = '789';  // Prefixo Brasil
    
    // Gerar mais 9 dígitos
    for (let i = 0; i < 9; i++) {
      codigo += Math.floor(Math.random() * 10);
    }
    
    // Calcular dígito verificador
    let soma = 0;
    for (let i = 0; i < 12; i++) {
      soma += parseInt(codigo[i]) * (i % 2 === 0 ? 1 : 3);
    }
    
    const digitoVerificador = (10 - (soma % 10)) % 10;
    
    // Adicionar dígito verificador
    codigo += digitoVerificador;
    
    // Atualizar campo
    codigoBarrasInput.value = codigo;
  }
  
  // Função para validar código de barras EAN
  function validarCodigoBarras(codigo) {
    if (!codigo) return true; // Campo vazio é permitido
    
    // Verificar se contém apenas dígitos
    if (!/^\d+$/.test(codigo)) {
      exibirMensagem('Código de barras deve conter apenas números', 'warning');
      return false;
    }
    
    // Verificar comprimento
    if (codigo.length !== 8 && codigo.length !== 13) {
      exibirMensagem('Código de barras deve ter 8 ou 13 dígitos (EAN-8 ou EAN-13)', 'warning');
      return false;
    }
    
    // Calcular dígito verificador
    const digitosBase = codigo.slice(0, -1);
    const digitoVerificador = parseInt(codigo.slice(-1));
    
    let soma = 0;
    for (let i = 0; i < digitosBase.length; i++) {
      soma += parseInt(digitosBase[i]) * (i % 2 === 0 ? 1 : 3);
    }
    
    const digitoCalculado = (10 - (soma % 10)) % 10;
    
    // Validar dígito verificador
    if (digitoVerificador !== digitoCalculado) {
      exibirMensagem('Código de barras inválido. Dígito verificador incorreto.', 'warning');
      return false;
    }
    
    return true;
  }
  
  function abrirModal(tipo) {
    tipoModal = tipo;
    
    // Configurar modal
    if (tipo === 'grupo') {
      modalTitulo.textContent = 'Adicionar Novo Grupo';
      modalLabel.textContent = 'Nome do Grupo';
    } else {
      modalTitulo.textContent = 'Adicionar Nova Marca';
      modalLabel.textContent = 'Nome da Marca';
    }
    
    // Limpar input
    novoItemInput.value = '';
    
    // Exibir modal
    modalAdicionar.style.display = 'flex';
    
    // Focar no input
    setTimeout(() => {
      novoItemInput.focus();
    }, 100);
  }
  
  function salvarItemModal() {
    const novoItem = novoItemInput.value.trim();
    
    if (novoItem) {
      try {
        if (tipoModal === 'grupo') {
          // Obter grupos atuais
          const grupos = db.getGrupos();
          
          // Verificar se já existe
          if (grupos.includes(novoItem)) {
            exibirMensagem('Este grupo já existe', 'warning');
            return;
          }
          
          // Adicionar novo grupo
          grupos.push(novoItem);
          db.salvarDadosAuxiliares('grupos', grupos);
          
          // Atualizar selects
          carregarGrupos();
          
          // Selecionar o novo grupo
          grupoSelect.value = novoItem;
        } else {
          // Obter marcas atuais
          const marcas = db.getMarcas();
          
          // Verificar se já existe
          if (marcas.includes(novoItem)) {
            exibirMensagem('Esta marca já existe', 'warning');
            return;
          }
          
          // Adicionar nova marca
          marcas.push(novoItem);
          db.salvarDadosAuxiliares('marcas', marcas);
          
          // Atualizar selects
          carregarMarcas();
          
          // Selecionar a nova marca
          marcaSelect.value = novoItem;
        }
        
        // Fechar modal
        modalAdicionar.style.display = 'none';
        
        // Mensagem de sucesso
        exibirMensagem(`${tipoModal === 'grupo' ? 'Grupo' : 'Marca'} adicionado com sucesso`, 'success');
      } catch (erro) {
        exibirMensagem(`Erro ao adicionar ${tipoModal}: ${erro}`, 'error');
      }
    }
  }
  
  function exibirMensagem(mensagem, tipo) {
    // Criar toast
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${tipo}`;
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'warning' ? 'exclamation-circle' : tipo === 'info' ? 'info-circle' : 'times-circle'}"></i>
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
});
