// assets/js/database.js
class OrionDatabase {
    constructor() {
        this.VERSION = '1.0.0';
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

        // Salvar no localStorage
        localStorage.setItem('orion_usuarios', JSON.stringify(usuarios));
        localStorage.setItem('orion_produtos', JSON.stringify(produtos));
        localStorage.setItem('orion_grupos', JSON.stringify(grupos));
        localStorage.setItem('orion_marcas', JSON.stringify(marcas));
        localStorage.setItem('orion_formas_pagamento', JSON.stringify(formasPagamento));
        localStorage.setItem('orion_clientes', JSON.stringify(clientes));
        localStorage.setItem('orion_vendas', JSON.stringify(vendas));
        localStorage.setItem('orion_carrinho', JSON.stringify([]));
        
        // Configurações da loja
        const config = {
            nome_empresa: "ORION PDV",
            slogan: "Gestão Inteligente de Vendas",
            cnpj: "00.000.000/0001-00",
            telefone: "(11) 1234-5678",
            email: "contato@orionpdv.com",
            endereco: "Av. Paulista, 1000",
            cidade: "São Paulo - SP",
            logo_url: "assets/img/logo.svg",
            tema: "dark", // dark ou light
            cor_primaria: "#0B3D91",
            cor_secundaria: "#1E88E5"
        };
        
        localStorage.setItem('orion_config', JSON.stringify(config));
    }

    // Atualização estrutural do banco para novas versões
    updateDatabaseStructure(oldVersion) {
        console.log(`Atualizando banco de dados da versão ${oldVersion} para ${this.VERSION}`);
        // Implementar migrações quando necessário
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
            produtos[id].estoque += quantidade;
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
        
        // Limpar carrinho após finalizar venda
        this.limparCarrinho();
        
        return venda;
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
}

// Inicialização global
const db = new OrionDatabase();
