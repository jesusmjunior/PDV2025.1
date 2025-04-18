// assets/js/database.js
class OrionDatabase {
    constructor() {
        this.VERSION = '1.1.0';
        this.initialize();
        console.log('ORION Database System Initialized');
    }

    // Inicialização e verificação de estruturas
    initialize() {
        if (!localStorage.getItem('orion_initialized')) {
            this.resetDatabase();
            localStorage.setItem('orion_initialized', 'true');
        }
        
        // Verificar versão e atualizar se necessário
        const dbVersion = localStorage.getItem('orion_version');
        if (dbVersion !== this.VERSION) {
            this.updateDatabaseStructure(dbVersion);
            localStorage.setItem('orion_version', this.VERSION);
        }
    }

    // Dados iniciais para o sistema
    resetDatabase() {
        // Usuários
        const usuarios = {
            "admjesus": {
                "nome": "ADM Jesus",
                "cargo": "Administrador",
                "email": "admin@orionpdv.com",
                "senha_hash": this.hashPassword("senha123"),
                "ultimo_acesso": null,
                "perfil": "admin"
            }
        };
        
        // Produtos de exemplo
        const produtos = {
            '7891000315507': {
                id: '7891000315507',
                nome: 'Leite Integral',
                codigo_barras: '7891000315507',
                grupo: 'Laticínios',
                marca: 'Ninho',
                preco: 5.99,
                estoque: 50,
                estoque_minimo: 10,
                data_cadastro: new Date().toISOString(),
                foto: "https://www.nestleprofessional.com.br/sites/default/files/styles/np_product_detail/public/2022-09/leite-em-po-ninho-integral-lata-400g.png"
            },
            '7891910000197': {
                id: '7891910000197',
                nome: 'Arroz',
                codigo_barras: '7891910000197',
                grupo: 'Grãos',
                marca: 'Tio João',
                preco: 22.90,
                estoque: 35,
                estoque_minimo: 5,
                data_cadastro: new Date().toISOString(),
                foto: "https://m.media-amazon.com/images/I/61l6ojQQtDL._AC_UF894,1000_QL80_.jpg"
            },
            '7891149410116': {
                id: '7891149410116',
                nome: 'Café',
                codigo_barras: '7891149410116',
                grupo: 'Bebidas',
                marca: 'Pilão',
                preco: 15.75,
                estoque: 28,
                estoque_minimo: 8,
                data_cadastro: new Date().toISOString(),
                foto: "https://m.media-amazon.com/images/I/51xq5MnKz4L._AC_UF894,1000_QL80_.jpg"
            }
        };
        
        // Grupos de produtos
        const grupos = ["Alimentos", "Bebidas", "Limpeza", "Higiene", "Laticínios", "Grãos", "Diversos"];
        
        // Marcas
        const marcas = ["Nestlé", "Unilever", "P&G", "Ambev", "Tio João", "Pilão", "Outras"];
        
        // Formas de pagamento
        const formasPagamento = ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Pix", "Transferência"];
        
        // Cliente padrão e outros iniciais
        const clientes = [
            {
                id: "1",
                nome: "Consumidor Final",
                documento: "",
                telefone: "",
                email: "",
                endereco: "",
                cidade: "",
                data_cadastro: new Date().toISOString()
            },
            {
                id: "2",
                nome: "Maria Silva",
                documento: "123.456.789-00",
                telefone: "(11) 98765-4321",
                email: "maria@example.com",
                endereco: "Rua das Flores, 123",
                cidade: "São Paulo",
                data_cadastro: new Date().toISOString()
            }
        ];

        // Venda de exemplo
        const vendas = [{
            id: "ABC123",
            data: new Date().toISOString(),
            cliente_id: "1",
            cliente_nome: "Consumidor Final",
            forma_pagamento: "Dinheiro",
            itens: [{
                produto_id: "7891000315507",
                produto_nome: "Leite Integral",
                quantidade: 1,
                preco_unitario: 5.99,
                subtotal: 5.99
            }],
            subtotal: 5.99,
            desconto: 0,
            total: 5.99,
            usuario: "admjesus"
        }];

        // Registrar movimentações de estoque
        const movimentacoesEstoque = [{
            id: this.generateId(),
            data: new Date().toISOString(),
            produto_id: "7891000315507",
            produto_nome: "Leite Integral",
            tipo: "saida",
            quantidade: 1,
            motivo: "venda",
            observacao: "Venda inicial",
            usuario: "admjesus"
        }];

        // Salvar no localStorage
        localStorage.setItem('orion_usuarios', JSON.stringify(usuarios));
        localStorage.setItem('orion_produtos', JSON.stringify(produtos));
        localStorage.setItem('orion_grupos', JSON.stringify(grupos));
        localStorage.setItem('orion_marcas', JSON.stringify(marcas));
        localStorage.setItem('orion_formas_pagamento', JSON.stringify(formasPagamento));
        localStorage.setItem('orion_clientes', JSON.stringify(clientes));
        localStorage.setItem('orion_vendas', JSON.stringify(vendas));
        localStorage.setItem('orion_carrinho', JSON.stringify([]));
        localStorage.setItem('orion_movimentacoes_estoque', JSON.stringify(movimentacoesEstoque));
        
        // Configurações da loja
        const config = {
            nome_empresa: "ORION PDV",
            slogan: "Gestão Inteligente de Vendas",
            cnpj: "00.000.000/0001-00",
            telefone: "(11) 1234-5678",
            email: "contato@orionpdv.com",
            endereco: "Av. Paulista, 1000",
            cidade: "São Paulo - SP",
            logo_url: "assets/img/logo.png",
            tema: "dark", // dark ou light
            cor_primaria: "#0B3D91",
            cor_secundaria: "#1E88E5",
            chave_pix: "orionpdv@example.com"
        };
        
        localStorage.setItem('orion_config', JSON.stringify(config));
    }

    // Atualização estrutural do banco para novas versões
    updateDatabaseStructure(oldVersion) {
        console.log(`Atualizando banco de dados da versão ${oldVersion} para ${this.VERSION}`);
        
        // Implementar migrações quando necessário
        if (oldVersion === '1.0.0') {
            // Criar tabela de movimentações de estoque se não existir
            if (!localStorage.getItem('orion_movimentacoes_estoque')) {
                localStorage.setItem('orion_movimentacoes_estoque', JSON.stringify([]));
            }
            
            // Atualizar configurações para incluir chave PIX
            const config = this.getConfig();
            if (!config.chave_pix) {
                config.chave_pix = "orionpdv@example.com";
                this.salvarConfig(config);
            }
        }
    }

    // Utilidades
    hashPassword(password) {
        // Usando CryptoJS para SHA-256 (em produção usar bcrypt ou similar)
        return CryptoJS.SHA256(password).toString();
    }

    generateId() {
        return Math.random().toString(36).substring(2, 9);
    }

    // MÉTODOS DE ACESSO AOS DADOS

    // Usuários
    getUsuarios() {
        return JSON.parse(localStorage.getItem('orion_usuarios') || '{}');
    }

    getUsuario(username) {
        const usuarios = this.getUsuarios();
        return usuarios[username];
    }

    adicionarUsuario(usuario) {
        const usuarios = this.getUsuarios();
        usuarios[usuario.username] = usuario;
        localStorage.setItem('orion_usuarios', JSON.stringify(usuarios));
    }

    // Produtos
    getProdutos() {
        return JSON.parse(localStorage.getItem('orion_produtos') || '{}');
    }

    getProduto(id) {
        const produtos = this.getProdutos();
        return produtos[id];
    }

    getProdutoPorCodigoBarras(codigo) {
        const produtos = this.getProdutos();
        return Object.values(produtos).find(p => p.codigo_barras === codigo);
    }

    salvarProduto(produto) {
        const produtos = this.getProdutos();
        
        // Gerar ID se for novo produto
        if (!produto.id) {
            produto.id = produto.codigo_barras || this.generateId();
            produto.data_cadastro = new Date().toISOString();
        }
        
        produtos[produto.id] = produto;
        localStorage.setItem('orion_produtos', JSON.stringify(produtos));
        return produto;
    }

    atualizarEstoqueProduto(id, quantidade) {
        const produtos = this.getProdutos();
        if (produtos[id]) {
            const estoqueAnterior = produtos[id].estoque;
            produtos[id].estoque += quantidade;
            localStorage.setItem('orion_produtos', JSON.stringify(produtos));
            
            // Registrar movimentação
            const tipo = quantidade > 0 ? 'entrada' : 'saida';
            const motivo = quantidade > 0 ? 'ajuste' : 'ajuste';
            
            this.salvarMovimentacaoEstoque({
                produto_id: id,
                produto_nome: produtos[id].nome,
                tipo: tipo,
                quantidade: Math.abs(quantidade),
                motivo: motivo,
                observacao: `Ajuste de estoque de ${estoqueAnterior} para ${produtos[id].estoque}`,
                usuario: auth.getUsuarioAtual()?.username || 'sistema'
            });
            
            return true;
        }
        return false;
    }

    deletarProduto(id) {
        const produtos = this.getProdutos();
        if (produtos[id]) {
            delete produtos[id];
            localStorage.setItem('orion_produtos', JSON.stringify(produtos));
            return true;
        }
        return false;
    }

    // Clientes
    getClientes() {
        return JSON.parse(localStorage.getItem('orion_clientes') || '[]');
    }

    getCliente(id) {
        return this.getClientes().find(c => c.id === id);
    }

    salvarCliente(cliente) {
        const clientes = this.getClientes();
        
        if (!cliente.id) {
            cliente.id = this.generateId();
            cliente.data_cadastro = new Date().toISOString();
        } else {
            // Remover cliente existente para atualização
            const index = clientes.findIndex(c => c.id === cliente.id);
            if (index !== -1) {
                clientes.splice(index, 1);
            }
        }
        
        clientes.push(cliente);
        localStorage.setItem('orion_clientes', JSON.stringify(clientes));
        return cliente;
    }

    deletarCliente(id) {
        const clientes = this.getClientes();
        const index = clientes.findIndex(c => c.id === id);
        
        if (index !== -1) {
            clientes.splice(index, 1);
            localStorage.setItem('orion_clientes', JSON.stringify(clientes));
            return true;
        }
        
        return false;
    }

    // Vendas
    getVendas() {
        return JSON.parse(localStorage.getItem('orion_vendas') || '[]');
    }

    getVenda(id) {
        return this.getVendas().find(v => v.id === id);
    }

    salvarVenda(venda) {
        const vendas = this.getVendas();
        
        if (!venda.id) {
            venda.id = this.generateId();
        }
        
        if (!venda.data) {
            venda.data = new Date().toISOString();
        }
        
        vendas.push(venda);
        localStorage.setItem('orion_vendas', JSON.stringify(vendas));
        
        // Registrar movimentações de estoque
        venda.itens.forEach(item => {
            this.salvarMovimentacaoEstoque({
                produto_id: item.produto_id,
                produto_nome: item.produto_nome,
                tipo: 'saida',
                quantidade: item.quantidade,
                motivo: 'venda',
                observacao: `Venda #${venda.id}`,
                usuario: venda.usuario
            });
        });
        
        // Limpar carrinho após finalizar venda
        this.limparCarrinho();
        
        return venda;
    }

    // Movimentações de Estoque
    getMovimentacoesEstoque() {
        return JSON.parse(localStorage.getItem('orion_movimentacoes_estoque') || '[]');
    }

    salvarMovimentacaoEstoque(movimentacao) {
        const movimentacoes = this.getMovimentacoesEstoque();
        
        if (!movimentacao.id) {
            movimentacao.id = this.generateId();
        }
        
        if (!movimentacao.data) {
            movimentacao.data = new Date().toISOString();
        }
        
        movimentacoes.push(movimentacao);
        localStorage.setItem('orion_movimentacoes_estoque', JSON.stringify(movimentacoes));
        
        return movimentacao;
    }

    // Carrinho
    getCarrinho() {
        return JSON.parse(localStorage.getItem('orion_carrinho') || '[]');
    }

    adicionarItemCarrinho(item) {
        const carrinho = this.getCarrinho();
        
        // Verificar se o produto já está no carrinho
        const indexExistente = carrinho.findIndex(i => i.produto_id === item.produto_id);
        
        if (indexExistente !== -1) {
            // Atualizar quantidade e subtotal
            carrinho[indexExistente].quantidade += item.quantidade;
            carrinho[indexExistente].subtotal = carrinho[indexExistente].quantidade * carrinho[indexExistente].preco_unitario;
        } else {
            // Adicionar novo item
            carrinho.push(item);
        }
        
        localStorage.setItem('orion_carrinho', JSON.stringify(carrinho));
        
        // Atualizar estoque temporariamente
        this.atualizarEstoqueProduto(item.produto_id, -item.quantidade);
        
        return carrinho;
    }

    removerItemCarrinho(index) {
        const carrinho = this.getCarrinho();
        
        if (index >= 0 && index < carrinho.length) {
            const item = carrinho[index];
            
            // Devolver ao estoque
            this.atualizarEstoqueProduto(item.produto_id, item.quantidade);
            
            // Remover do carrinho
            carrinho.splice(index, 1);
            localStorage.setItem('orion_carrinho', JSON.stringify(carrinho));
        }
        
        return carrinho;
    }

    limparCarrinho() {
        localStorage.setItem('orion_carrinho', JSON.stringify([]));
    }

    // Dados auxiliares
    getGrupos() {
        return JSON.parse(localStorage.getItem('orion_grupos') || '[]');
    }

    getMarcas() {
        return JSON.parse(localStorage.getItem('orion_marcas') || '[]');
    }

    getFormasPagamento() {
        return JSON.parse(localStorage.getItem('orion_formas_pagamento') || '[]');
    }

    salvarDadosAuxiliares(tipo, dados) {
        localStorage.setItem(`orion_${tipo}`, JSON.stringify(dados));
        return dados;
    }

    // Configurações
    getConfig() {
        return JSON.parse(localStorage.getItem('orion_config') || '{}');
    }

    salvarConfig(config) {
        localStorage.setItem('orion_config', JSON.stringify(config));
        return config;
    }

    // RELATÓRIOS E EXPORTAÇÃO

    // Exportar para CSV
    exportarCSV(dados, nomeArquivo) {
        if (!dados || !dados.length) return null;
        
        // Obter cabeçalho com base na primeira linha
        const cabecalhos = Object.keys(dados[0]);
        
        // Criar conteúdo CSV
        let csv = cabecalhos.join(',') + '\n';
        
        // Adicionar linhas
        for (const linha of dados) {
            const valores = cabecalhos.map(header => {
                const valor = linha[header];
                // Tratar valores com vírgulas
                if (typeof valor === 'string' && valor.includes(',')) {
                    return `"${valor.replace(/"/g, '""')}"`;
                }
                return valor === null || valor === undefined ? '' : valor;
            });
            csv += valores.join(',') + '\n';
        }
        
        // Criar blob e download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', nomeArquivo);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
    }

    // Relatório de vendas com filtros
    gerarRelatorioVendas(filtros = {}) {
        const vendas = this.getVendas();
        let vendasFiltradas = [...vendas];
        
        // Aplicar filtros
        if (filtros.dataInicio) {
            const dataInicio = new Date(filtros.dataInicio);
            vendasFiltradas = vendasFiltradas.filter(v => new Date(v.data) >= dataInicio);
        }
        
        if (filtros.dataFim) {
            const dataFim = new Date(filtros.dataFim);
            dataFim.setHours(23, 59, 59, 999);
            vendasFiltradas = vendasFiltradas.filter(v => new Date(v.data) <= dataFim);
        }
        
        if (filtros.cliente) {
            vendasFiltradas = vendasFiltradas.filter(v => v.cliente_id === filtros.cliente);
        }
        
        if (filtros.formaPagamento) {
            vendasFiltradas = vendasFiltradas.filter(v => v.forma_pagamento === filtros.formaPagamento);
        }
        
        // Calcular métricas
        const totalVendas = vendasFiltradas.length;
        const valorTotal = vendasFiltradas.reduce((sum, v) => sum + v.total, 0);
        const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0;
        const totalDescontos = vendasFiltradas.reduce((sum, v) => sum + (v.desconto || 0), 0);
        
        // Agrupar por data
        const vendasPorData = {};
        vendasFiltradas.forEach(v => {
            const data = v.data.split('T')[0];
            if (!vendasPorData[data]) {
                vendasPorData[data] = { total: 0, quantidade: 0 };
            }
            vendasPorData[data].total += v.total;
            vendasPorData[data].quantidade += 1;
        });
        
        // Agrupar por forma de pagamento
        const vendasPorFormaPagamento = {};
        vendasFiltradas.forEach(v => {
            if (!vendasPorFormaPagamento[v.forma_pagamento]) {
                vendasPorFormaPagamento[v.forma_pagamento] = { total: 0, quantidade: 0 };
            }
            vendasPorFormaPagamento[v.forma_pagamento].total += v.total;
            vendasPorFormaPagamento[v.forma_pagamento].quantidade += 1;
        });
        
        return {
            vendas: vendasFiltradas,
            totalVendas,
            valorTotal,
            ticketMedio,
            totalDescontos,
            vendasPorData,
            vendasPorFormaPagamento
        };
    }

    // Backup e recuperação
    gerarBackup() {
        const dados = {
            timestamp: new Date().toISOString(),
            version: this.VERSION,
            usuarios: this.getUsuarios(),
            produtos: this.getProdutos(),
            clientes: this.getClientes(),
            vendas: this.getVendas(),
            grupos: this.getGrupos(),
            marcas: this.getMarcas(),
            formasPagamento: this.getFormasPagamento(),
            movimentacoesEstoque: this.getMovimentacoesEstoque(),
            config: this.getConfig()
        };
        
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `orion_backup_${new Date().toISOString().slice(0,10)}.json`);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    restaurarBackup(jsonContent) {
        try {
            const dados = JSON.parse(jsonContent);
            
            // Validação básica
            if (!dados.version || !dados.produtos || !dados.usuarios) {
                throw new Error("Arquivo de backup inválido");
            }
            
            // Restaurar dados
            localStorage.setItem('orion_usuarios', JSON.stringify(dados.usuarios));
            localStorage.setItem('orion_produtos', JSON.stringify(dados.produtos));
            localStorage.setItem('orion_clientes', JSON.stringify(dados.clientes));
            localStorage.setItem('orion_vendas', JSON.stringify(dados.vendas));
            localStorage.setItem('orion_grupos', JSON.stringify(dados.grupos));
            localStorage.setItem('orion_marcas', JSON.stringify(dados.marcas));
            localStorage.setItem('orion_formas_pagamento', JSON.stringify(dados.formasPagamento));
            localStorage.setItem('orion_config', JSON.stringify(dados.config));
            
            // Restaurar movimentações de estoque se existirem
            if (dados.movimentacoesEstoque) {
                localStorage.setItem('orion_movimentacoes_estoque', JSON.stringify(dados.movimentacoesEstoque));
            }
            
            // Atualizar versão
            localStorage.setItem('orion_version', this.VERSION);
            
            return {
                sucesso: true,
                mensagem: `Backup restaurado com sucesso. Data do backup: ${new Date(dados.timestamp).toLocaleString()}`
            };
        } catch (erro) {
            return {
                sucesso: false,
                mensagem: `Erro ao restaurar backup: ${erro.message}`
            };
        }
    }
    
    // Gerar recibo HTML
    gerarReciboHTML(venda) {
        // Obter dados da empresa
        const config = this.getConfig();
        
        // Formatar data
        const data = new Date(venda.data);
        const dataFormatada = data.toLocaleDateString('pt-BR');
        const horaFormatada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
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
        
        // Criar HTML do recibo
        const html = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Recibo de Venda - ${config.nome_empresa}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Courier New', Courier, monospace;
                        font-size: 12px;
                        line-height: 1.4;
                        color: #000;
                        background-color: #fff;
                        padding: 20px;
                        max-width: 80mm; /* Largura padrão de impressora térmica */
                        margin: 0 auto;
                    }
                    
                    .recibo-header {
                        text-align: center;
                        margin-bottom: 15px;
                        border-bottom: 1px dashed #000;
                        padding-bottom: 10px;
                    }
                    
                    .recibo-header h1 {
                        font-size: 16px;
                        font-weight: bold;
                        margin-bottom: 5px;
                        text-transform: uppercase;
                    }
                    
                    .recibo-header p {
                        font-size: 12px;
                        margin-bottom: 3px;
                    }
                    
                    .recibo-info {
                        margin-bottom: 15px;
                    }
                    
                    .recibo-info p {
                        margin-bottom: 5px;
                    }
                    
                    .recibo-items {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 15px;
                    }
                    
                    .recibo-items th {
                        text-align: left;
                        border-bottom: 1px dashed #000;
                        padding: 3px 0;
                    }
                    
                    .recibo-items td {
                        padding: 3px 0;
                    }
                    
                    .recibo-items .right {
                        text-align: right;
                    }
                    
                    .recibo-totais {
                        border-top: 1px dashed #000;
                        padding-top: 10px;
                        margin-bottom: 15px;
                    }
                    
                    .recibo-total {
                        font-weight: bold;
                        font-size: 14px;
                        margin-top: 5px;
                    }
                    
                    .recibo-pagamento {
                        border-top: 1px dashed #000;
                        padding-top: 10px;
                        margin-bottom: 15px;
                    }
                    
                    .recibo-footer {
                        text-align: center;
                        border-top: 1px dashed #000;
                        padding-top: 10px;
                        margin-bottom: 15px;
                    }
                    
                    .text-center {
                        text-align: center;
                    }
                    
                    .text-right {
                        text-align: right;
                    }
                    
                    .font-bold {
                        font-weight: bold;
                    }
                    
                    .no-print {
                        display: none;
                    }
                    
                    @media print {
                        body {
                            padding: 0;
                        }
                        
                        .no-print {
                            display: none !important;
                        }
                        
                        @page {
                            margin: 0;
                            size: 80mm;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="recibo-header">
                    <h1>${config.nome_empresa}</h1>
                    <p>${config.endereco}</p>
                    <p>${config.cidade}</p>
                    <p>CNPJ: ${config.cnpj}</p>
                    <p>${config.telefone}</p>
                </div>
                
                <div class="recibo-info">
                    <p><span class="font-bold">CUPOM NÃO FISCAL</span></p>
                    <p><span class="font-bold">Venda:</span> ${venda.id}</p>
                    <p><span class="font-bold">Data:</span> ${dataFormatada} ${horaFormatada}</p>
                    <p><span class="font-bold">Cliente:</span> ${venda.cliente_nome}</p>
                    <p><span class="font-bold">Operador:</span> ${venda.usuario}</p>
                </div>
                
                <table class="recibo-items">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qtd</th>// assets/js/database.js
class OrionDatabase {
    constructor() {
        this.VERSION = '1.1.0';
        this.initialize();
        console.log('ORION Database System Initialized');
    }

    // Inicialização e verificação de estruturas
    initialize() {
        if (!localStorage.getItem('orion_initialized')) {
            this.resetDatabase();
            localStorage.setItem('orion_initialized', 'true');
        }
        
        // Verificar versão e atualizar se necessário
        const dbVersion = localStorage.getItem('orion_version');
        if (dbVersion !== this.VERSION) {
            this.updateDatabaseStructure(dbVersion);
            localStorage.setItem('orion_version', this.VERSION);
        }
    }

    // Dados iniciais para o sistema
    resetDatabase() {
        // Usuários
        const usuarios = {
            "admjesus": {
                "nome": "ADM Jesus",
                "cargo": "Administrador",
                "email": "admin@orionpdv.com",
                "senha_hash": this.hashPassword("senha123"),
                "ultimo_acesso": null,
                "perfil": "admin"
            }
        };
        
        // Produtos de exemplo
        const produtos = {
            '7891000315507': {
                id: '7891000315507',
                nome: 'Leite Integral',
                codigo_barras: '7891000315507',
                grupo: 'Laticínios',
                marca: 'Ninho',
                preco: 5.99,
                estoque: 50,
                estoque_minimo: 10,
                data_cadastro: new Date().toISOString(),
                foto: "https://www.nestleprofessional.com.br/sites/default/files/styles/np_product_detail/public/2022-09/leite-em-po-ninho-integral-lata-400g.png"
            },
            '7891910000197': {
                id: '7891910000197',
                nome: 'Arroz',
                codigo_barras: '7891910000197',
                grupo: 'Grãos',
                marca: 'Tio João',
                preco: 22.90,
                estoque: 35,
                estoque_minimo: 5,
                data_cadastro: new Date().toISOString(),
                foto: "https://m.media-amazon.com/images/I/61l6ojQQtDL._AC_UF894,1000_QL80_.jpg"
            },
            '7891149410116': {
                id: '7891149410116',
                nome: 'Café',
                codigo_barras: '7891149410116',
                grupo: 'Bebidas',
                marca: 'Pilão',
                preco: 15.75,
                estoque: 28,
                estoque_minimo: 8,
                data_cadastro: new Date().toISOString(),
                foto: "https://m.media-amazon.com/images/I/51xq5MnKz4L._AC_UF894,1000_QL80_.jpg"
            }
        };
        
        // Grupos de produtos
        const grupos = ["Alimentos", "Bebidas", "Limpeza", "Higiene", "Laticínios", "Grãos", "Diversos"];
        
        // Marcas
        const marcas = ["Nestlé", "Unilever", "P&G", "Ambev", "Tio João", "Pilão", "Outras"];
        
        // Formas de pagamento
        const formasPagamento = ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Pix", "Transferência"];
        
        // Cliente padrão e outros iniciais
        const clientes = [
            {
                id: "1",
                nome: "Consumidor Final",
                documento: "",
                telefone: "",
                email: "",
                endereco: "",
                cidade: "",
                data_cadastro: new Date().toISOString()
            },
            {
                id: "2",
                nome: "Maria Silva",
                documento: "123.456.789-00",
                telefone: "(11) 98765-4321",
                email: "maria@example.com",
                endereco: "Rua das Flores, 123",
                cidade: "São Paulo",
                data_cadastro: new Date().toISOString()
            }
        ];

        // Venda de exemplo
        const vendas = [{
            id: "ABC123",
            data: new Date().toISOString(),
            cliente_id: "1",
            cliente_nome: "Consumidor Final",
            forma_pagamento: "Dinheiro",
            itens: [{
                produto_id: "7891000315507",
                produto_nome: "Leite Integral",
                quantidade: 1,
                preco_unitario: 5.99,
                subtotal: 5.99
            }],
            subtotal: 5.99,
            desconto: 0,
            total: 5.99,
            usuario: "admjesus"
        }];

        // Registrar movimentações de estoque
        const movimentacoesEstoque = [{
            id: this.generateId(),
            data: new Date().toISOString(),
            produto_id: "7891000315507",
            produto_nome: "Leite Integral",
            tipo: "saida",
            quantidade: 1,
            motivo: "venda",
            observacao: "Venda inicial",
            usuario: "admjesus"
        }];

        // Salvar no localStorage
        localStorage.setItem('orion_usuarios', JSON.stringify(usuarios));
        localStorage.setItem('orion_produtos', JSON.stringify(produtos));
        localStorage.setItem('orion_grupos', JSON.stringify(grupos));
        localStorage.setItem('orion_marcas', JSON.stringify(marcas));
        localStorage.setItem('orion_formas_pagamento', JSON.stringify(formasPagamento));
        localStorage.setItem('orion_clientes', JSON.stringify(clientes));
        localStorage.setItem('orion_vendas', JSON.stringify(vendas));
        localStorage.setItem('orion_carrinho', JSON.stringify([]));
        localStorage.setItem('orion_movimentacoes_estoque', JSON.stringify(movimentacoesEstoque));
        
        // Configurações da loja
        const config = {
            nome_empresa: "ORION PDV",
            slogan: "Gestão Inteligente de Vendas",
            cnpj: "00.000.000/0001-00",
            telefone: "(11) 1234-5678",
            email: "contato@orionpdv.com",
            endereco: "Av. Paulista, 1000",
            cidade: "São Paulo - SP",
            logo_url: "assets/img/logo.png",
            tema: "dark", // dark ou light
            cor_primaria: "#0B3D91",
            cor_secundaria: "#1E88E5",
            chave_pix: "orionpdv@example.com"
        };
        
        localStorage.setItem('orion_config', JSON.stringify(config));
    }

    // Atualização estrutural do banco para novas versões
    updateDatabaseStructure(oldVersion) {
        console.log(`Atualizando banco de dados da versão ${oldVersion} para ${this.VERSION}`);
        
        // Implementar migrações quando necessário
        if (oldVersion === '1.0.0') {
            // Criar tabela de movimentações de estoque se não existir
            if (!localStorage.getItem('orion_movimentacoes_estoque')) {
                localStorage.setItem('orion_movimentacoes_estoque', JSON.stringify([]));
            }
            
            // Atualizar configurações para incluir chave PIX
            const config = this.getConfig();
            if (!config.chave_pix) {
                config.chave_pix = "orionpdv@example.com";
                this.salvarConfig(config);
            }
        }
    }

    // Utilidades
    hashPassword(password) {
        // Usando CryptoJS para SHA-256 (em produção usar bcrypt ou similar)
        return CryptoJS.SHA256(password).toString();
    }

    generateId() {
        return Math.random().toString(36).substring(2, 9);
    }

    // MÉTODOS DE ACESSO AOS DADOS

    // Usuários
    getUsuarios() {
        return JSON.parse(localStorage.getItem('orion_usuarios') || '{}');
    }

    getUsuario(username) {
        const usuarios = this.getUsuarios();
        return usuarios[username];
    }

    adicionarUsuario(usuario) {
        const usuarios = this.getUsuarios();
        usuarios[usuario.username] = usuario;
        localStorage.setItem('orion_usuarios', JSON.stringify(usuarios));
    }

    // Produtos
    getProdutos() {
        return JSON.parse(localStorage.getItem('orion_produtos') || '{}');
    }

    getProduto(id) {
        const produtos = this.getProdutos();
        return produtos[id];
    }

    getProdutoPorCodigoBarras(codigo) {
        const produtos = this.getProdutos();
        return Object.values(produtos).find(p => p.codigo_barras === codigo);
    }

    salvarProduto(produto) {
        const produtos = this.getProdutos();
        
        // Gerar ID se for novo produto
        if (!produto.id) {
            produto.id = produto.codigo_barras || this.generateId();
            produto.data_cadastro = new Date().toISOString();
        }
        
        produtos[produto.id] = produto;
        localStorage.setItem('orion_produtos', JSON.stringify(produtos));
        return produto;
    }

    atualizarEstoqueProduto(id, quantidade) {
        const produtos = this.getProdutos();
        if (produtos[id]) {
            const estoqueAnterior = produtos[id].estoque;
            produtos[id].estoque += quantidade;
            localStorage.setItem('orion_produtos', JSON.stringify(produtos));
            
            // Registrar movimentação
            const tipo = quantidade > 0 ? 'entrada' : 'saida';
            const motivo = quantidade > 0 ? 'ajuste' : 'ajuste';
            
            this.salvarMovimentacaoEstoque({
                produto_id: id,
                produto_nome: produtos[id].nome,
                tipo: tipo,
                quantidade: Math.abs(quantidade),
                motivo: motivo,
                observacao: `Ajuste de estoque de ${estoqueAnterior} para ${produtos[id].estoque}`,
                usuario: auth.getUsuarioAtual()?.username || 'sistema'
            });
            
            return true;
        }
        return false;
    }

    deletarProduto(id) {
        const produtos = this.getProdutos();
        if (produtos[id]) {
            delete produtos[id];
            localStorage.setItem('orion_produtos', JSON.stringify(produtos));
            return true;
        }
        return false;
    }

    // Clientes
    getClientes() {
        return JSON.parse(localStorage.getItem('orion_clientes') || '[]');
    }

    getCliente(id) {
        return this.getClientes().find(c => c.id === id);
    }

    salvarCliente(cliente) {
        const clientes = this.getClientes();
        
        if (!cliente.id) {
            cliente.id = this.generateId();
            cliente.data_cadastro = new Date().toISOString();
        } else {
            // Remover cliente existente para atualização
            const index = clientes.findIndex(c => c.id === cliente.id);
            if (index !== -1) {
                clientes.splice(index, 1);
            }
        }
        
        clientes.push(cliente);
        localStorage.setItem('orion_clientes', JSON.stringify(clientes));
        return cliente;
    }

    deletarCliente(id) {
        const clientes = this.getClientes();
        const index = clientes.findIndex(c => c.id === id);
        
        if (index !== -1) {
            clientes.splice(index, 1);
            localStorage.setItem('orion_clientes', JSON.stringify(clientes));
            return true;
        }
        
        return false;
    }

    // Vendas
    getVendas() {
        return JSON.parse(localStorage.getItem('orion_vendas') || '[]');
    }

    getVenda(id) {
        return this.getVendas().find(v => v.id === id);
    }

    salvarVenda(venda) {
        const vendas = this.getVendas();
        
        if (!venda.id) {
            venda.id = this.generateId();
        }
        
        if (!venda.data) {
            venda.data = new Date().toISOString();
        }
        
        vendas.push(venda);
        localStorage.setItem('orion_vendas', JSON.stringify(vendas));
        
        // Registrar movimentações de estoque
        venda.itens.forEach(item => {
            this.salvarMovimentacaoEstoque({
                produto_id: item.produto_id,
                produto_nome: item.produto_nome,
                tipo: 'saida',
                quantidade: item.quantidade,
                motivo: 'venda',
                observacao: `Venda #${venda.id}`,
                usuario: venda.usuario
            });
        });
        
        // Limpar carrinho após finalizar venda
        this.limparCarrinho();
        
        return venda;
    }

    // Movimentações de Estoque
    getMovimentacoesEstoque() {
        return JSON.parse(localStorage.getItem('orion_movimentacoes_estoque') || '[]');
    }

    salvarMovimentacaoEstoque(movimentacao) {
        const movimentacoes = this.getMovimentacoesEstoque();
        
        if (!movimentacao.id) {
            movimentacao.id = this.generateId();
        }
        
        if (!movimentacao.data) {
            movimentacao.data = new Date().toISOString();
        }
        
        movimentacoes.push(movimentacao);
        localStorage.setItem('orion_movimentacoes_estoque', JSON.stringify(movimentacoes));
        
        return movimentacao;
    }

    // Carrinho
    getCarrinho() {
        return JSON.parse(localStorage.getItem('orion_carrinho') || '[]');
    }

    adicionarItemCarrinho(item) {
        const carrinho = this.getCarrinho();
        
        // Verificar se o produto já está no carrinho
        const indexExistente = carrinho.findIndex(i => i.produto_id === item.produto_id);
        
        if (indexExistente !== -1) {
            // Atualizar quantidade e subtotal
            carrinho[indexExistente].quantidade += item.quantidade;
            carrinho[indexExistente].subtotal = carrinho[indexExistente].quantidade * carrinho[indexExistente].preco_unitario;
        } else {
            // Adicionar novo item
            carrinho.push(item);
        }
        
        localStorage.setItem('orion_carrinho', JSON.stringify(carrinho));
        
        // Atualizar estoque temporariamente
        this.atualizarEstoqueProduto(item.produto_id, -item.quantidade);
        
        return carrinho;
    }

    removerItemCarrinho(index) {
        const carrinho = this.getCarrinho();
        
        if (index >= 0 && index < carrinho.length) {
            const item = carrinho[index];
            
            // Devolver ao estoque
            this.atualizarEstoqueProduto(item.produto_id, item.quantidade);
            
            // Remover do carrinho
            carrinho.splice(index, 1);
            localStorage.setItem('orion_carrinho', JSON.stringify(carrinho));
        }
        
        return carrinho;
    }

    limparCarrinho() {
        localStorage.setItem('orion_carrinho', JSON.stringify([]));
    }

    // Dados auxiliares
    getGrupos() {
        return JSON.parse(localStorage.getItem('orion_grupos') || '[]');
    }

    getMarcas() {
        return JSON.parse(localStorage.getItem('orion_marcas') || '[]');
    }

    getFormasPagamento() {
        return JSON.parse(localStorage.getItem('orion_formas_pagamento') || '[]');
    }

    salvarDadosAuxiliares(tipo, dados) {
        localStorage.setItem(`orion_${tipo}`, JSON.stringify(dados));
        return dados;
    }

    // Configurações
    getConfig() {
        return JSON.parse(localStorage.getItem('orion_config') || '{}');
    }

    salvarConfig(config) {
        localStorage.setItem('orion_config', JSON.stringify(config));
        return config;
    }

    // RELATÓRIOS E EXPORTAÇÃO

    // Exportar para CSV
    exportarCSV(dados, nomeArquivo) {
        if (!dados || !dados.length) return null;
        
        // Obter cabeçalho com base na primeira linha
        const cabecalhos = Object.keys(dados[0]);
        
        // Criar conteúdo CSV
        let csv = cabecalhos.join(',') + '\n';
        
        // Adicionar linhas
        for (const linha of dados) {
            const valores = cabecalhos.map(header => {
                const valor = linha[header];
                // Tratar valores com vírgulas
                if (typeof valor === 'string' && valor.includes(',')) {
                    return `"${valor.replace(/"/g, '""')}"`;
                }
                return valor === null || valor === undefined ? '' : valor;
            });
            csv += valores.join(',') + '\n';
        }
        
        // Criar blob e download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', nomeArquivo);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
    }

    // Relatório de vendas com filtros
    gerarRelatorioVendas(filtros = {}) {
        const vendas = this.getVendas();
        let vendasFiltradas = [...vendas];
        
        // Aplicar filtros
        if (filtros.dataInicio) {
            const dataInicio = new Date(filtros.dataInicio);
            vendasFiltradas = vendasFiltradas.filter(v => new Date(v.data) >= dataInicio);
        }
        
        if (filtros.dataFim) {
            const dataFim = new Date(filtros.dataFim);
            dataFim.setHours(23, 59, 59, 999);
            vendasFiltradas = vendasFiltradas.filter(v => new Date(v.data) <= dataFim);
        }
        
        if (filtros.cliente) {
            vendasFiltradas = vendasFiltradas.filter(v => v.cliente_id === filtros.cliente);
        }
        
        if (filtros.formaPagamento) {
            vendasFiltradas = vendasFiltradas.filter(v => v.forma_pagamento === filtros.formaPagamento);
        }
        
        // Calcular métricas
        const totalVendas = vendasFiltradas.length;
        const valorTotal = vendasFiltradas.reduce((sum, v) => sum + v.total, 0);
        const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0;
        const totalDescontos = vendasFiltradas.reduce((sum, v) => sum + (v.desconto || 0), 0);
        
        // Agrupar por data
        const vendasPorData = {};
        vendasFiltradas.forEach(v => {
            const data = v.data.split('T')[0];
            if (!vendasPorData[data]) {
                vendasPorData[data] = { total: 0, quantidade: 0 };
            }
            vendasPorData[data].total += v.total;
            vendasPorData[data].quantidade += 1;
        });
        
        // Agrupar por forma de pagamento
        const vendasPorFormaPagamento = {};
        vendasFiltradas.forEach(v => {
            if (!vendasPorFormaPagamento[v.forma_pagamento]) {
                vendasPorFormaPagamento[v.forma_pagamento] = { total: 0, quantidade: 0 };
            }
            vendasPorFormaPagamento[v.forma_pagamento].total += v.total;
            vendasPorFormaPagamento[v.forma_pagamento].quantidade += 1;
        });
        
        return {
            vendas: vendasFiltradas,
            totalVendas,
            valorTotal,
            ticketMedio,
            totalDescontos,
            vendasPorData,
            vendasPorFormaPagamento
        };
    }

    // Backup e recuperação
    gerarBackup() {
        const dados = {
            timestamp: new Date().toISOString(),
            version: this.VERSION,
            usuarios: this.getUsuarios(),
            produtos: this.getProdutos(),
            clientes: this.getClientes(),
            vendas: this.getVendas(),
            grupos: this.getGrupos(),
            marcas: this.getMarcas(),
            formasPagamento: this.getFormasPagamento(),
            movimentacoesEstoque: this.getMovimentacoesEstoque(),
            config: this.getConfig()
        };
        
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `orion_backup_${new Date().toISOString().slice(0,10)}.json`);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    restaurarBackup(jsonContent) {
        try {
            const dados = JSON.parse(jsonContent);
            
            // Validação básica
            if (!dados.version || !dados.produtos || !dados.usuarios) {
                throw new Error("Arquivo de backup inválido");
            }
            
            // Restaurar dados
            localStorage.setItem('orion_usuarios', JSON.stringify(dados.usuarios));
            localStorage.setItem('orion_produtos', JSON.stringify(dados.produtos));
            localStorage.setItem('orion_clientes', JSON.stringify(dados.clientes));
            localStorage.setItem('orion_vendas', JSON.stringify(dados.vendas));
            localStorage.setItem('orion_grupos', JSON.stringify(dados.grupos));
            localStorage.setItem('orion_marcas', JSON.stringify(dados.marcas));
            localStorage.setItem('orion_formas_pagamento', JSON.stringify(dados.formasPagamento));
            localStorage.setItem('orion_config', JSON.stringify(dados.config));
            
            // Restaurar movimentações de estoque se existirem
            if (dados.movimentacoesEstoque) {
                localStorage.setItem('orion_movimentacoes_estoque', JSON.stringify(dados.movimentacoesEstoque));
            }
            
            // Atualizar versão
            localStorage.setItem('orion_version', this.VERSION);
            
            return {
                sucesso: true,
                mensagem: `Backup restaurado com sucesso. Data do backup: ${new Date(dados.timestamp).toLocaleString()}`
            };
        } catch (erro) {
            return {
                sucesso: false,
                mensagem: `Erro ao restaurar backup: ${erro.message}`
            };
        }
    }
    
    // Gerar recibo HTML
    gerarReciboHTML(venda) {
        // Obter dados da empresa
        const config = this.getConfig();
        
        // Formatar data
        const data = new Date(venda.data);
        const dataFormatada = data.toLocaleDateString('pt-BR');
        const horaFormatada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
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
        
        // Criar HTML do recibo
        const html = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Recibo de Venda - ${config.nome_empresa}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Courier New', Courier, monospace;
                        font-size: 12px;
                        line-height: 1.4;
                        color: #000;
                        background-color: #fff;
                        padding: 20px;
                        max-width: 80mm; /* Largura padrão de impressora térmica */
                        margin: 0 auto;
                    }
                    
                    .recibo-header {
                        text-align: center;
                        margin-bottom: 15px;
                        border-bottom: 1px dashed #000;
                        padding-bottom: 10px;
                    }
                    
                    .recibo-header h1 {
                        font-size: 16px;
                        font-weight: bold;
                        margin-bottom: 5px;
                        text-transform: uppercase;
                    }
                    
                    .recibo-header p {
                        font-size: 12px;
                        margin-bottom: 3px;
                    }
                    
                    .recibo-info {
                        margin-bottom: 15px;
                    }
                    
                    .recibo-info p {
                        margin-bottom: 5px;
                    }
                    
                    .recibo-items {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 15px;
                    }
                    
                    .recibo-items th {
                        text-align: left;
                        border-bottom: 1px dashed #000;
                        padding: 3px 0;
                    }
                    
                    .recibo-items td {
                        padding: 3px 0;
                    }
                    
                    .recibo-items .right {
                        text-align: right;
                    }
                    
                    .recibo-totais {
                        border-top: 1px dashed #000;
                        padding-top: 10px;
                        margin-bottom: 15px;
                    }
                    
                    .recibo-total {
                        font-weight: bold;
                        font-size: 14px;
                        margin-top: 5px;
                    }
                    
                    .recibo-pagamento {
                        border-top: 1px dashed #000;
                        padding-top: 10px;
                        margin-bottom: 15px;
                    }
                    
                    .recibo-footer {
                        text-align: center;
                        border-top: 1px dashed #000;
                        padding-top: 10px;
                        margin-bottom: 15px;
                    }
                    
                    .text-center {
                        text-align: center;
                    }
                    
                    .text-right {
                        text-align: right;
                    }
                    
                    .font-bold {
                        font-weight: bold;
                    }
                    
                    .no-print {
                        display: none;
                    }
                    
                    @media print {
                        body {
                            padding: 0;
                        }
                        
                        .no-print {
                            display: none !important;
                        }
                        
                        @page {
                            margin: 0;
                            size: 80mm;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="recibo-header">
                    <h1>${config.nome_empresa}</h1>
                    <p>${config.endereco}</p>
                    <p>${config.cidade}</p>
                    <p>CNPJ: ${config.cnpj}</p>
                    <p>${config.telefone}</p>
                </div>
                
                <div class="recibo-info">
                    <p><span class="font-bold">CUPOM NÃO FISCAL</span></p>
                    <p><span class="font-bold">Venda:</span> ${venda.id}</p>
                    <p><span class="font-bold">Data:</span> ${dataFormatada} ${horaFormatada}</p>
                    <p><span class="font-bold">Cliente:</span> ${venda.cliente_nome}</p>
                    <p><span class="font-bold">Operador:</span> ${venda.usuario}</p>
                </div>
                
                <table class="recibo-items">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qtd</th>
                            <th>Valor</th>
                            <th class="right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${linhasItens}
                    </tbody>
                </table>
                
                <div class="recibo-totais">
                    <p class="text-right"><span class="font-bold">Subtotal:</span> R$ ${venda.subtotal.toFixed(2)}</p>
                    <p class="text-right"><span class="font-bold">Desconto:</span> R$ ${venda.desconto.toFixed(2)}</p>
                    <p class="recibo-total text-right">TOTAL: R$ ${venda.total.toFixed(2)}</p>
                </div>
                
                <div class="recibo-pagamento">
                    <p><span class="font-bold">Forma de pagamento:</span> ${venda.forma_pagamento}</p>
                    <p><span class="font-bold">Valor recebido:</span> R$ ${venda.total.toFixed(2)}</p>
                    <p><span class="font-bold">Troco:</span> R$ 0.00</p>
                </div>
                
                <div class="recibo-footer">
                    <p>${config.nome_empresa} - Sistema de Gestão de Vendas</p>
                    <p>${dataFormatada} ${horaFormatada}</p>
                    <p class="font-bold">OBRIGADO PELA PREFERÊNCIA!</p>
                    <p>Volte Sempre</p>
                </div>
                
                <div class="no-print" style="position: fixed; bottom: 20px; left: 0; width: 100%; text-align: center; padding: 10px; background-color: #f5f5f5;">
                    <button onclick="window.print();" style="padding: 10px 20px; background-color: #0B3D91; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                        <i style="margin-right: 5px;">🖨️</i> Imprimir Recibo
                    </button>
                    &nbsp;
                    <button onclick="window.close();" style="padding: 10px 20px; background-color: #555; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Fechar
                    </button>
                </div>
                
                <script>
                    // Auto-imprimir quando aberto em nova janela
                    window.onload = function() {
                        // Se foi aberto como pop-up, imprimir automaticamente
                        if (window.opener) {
                            setTimeout(function() {
                                window.print();
                            }, 500);
                        }
                    };
                </script>
            </body>
            </html>
        `;
        
        return html;
    }
}

// Inicialização global
const db = new OrionDatabase();
