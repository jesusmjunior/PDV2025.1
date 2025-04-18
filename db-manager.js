// assets/js/db-manager.js
class OrionDatabaseManager {
    constructor() {
        this.DB_VERSION = 1;
        this.DB_NAME = 'orion_pdv_database';
        this.db = null;
        this.initialized = false;
        this.initPromise = this.initializeDatabase();
    }
    
    // Inicializa o banco de dados
    async initializeDatabase() {
        return new Promise((resolve, reject) => {
            if (this.initialized) {
                resolve(this.db);
                return;
            }
            
            if (!window.indexedDB) {
                console.error('Seu navegador não suporta IndexedDB. Algumas funcionalidades podem não funcionar corretamente.');
                reject('IndexedDB não suportado');
                return;
            }
            
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            
            request.onerror = (event) => {
                console.error('Erro ao abrir o banco de dados:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.initialized = true;
                console.log('Banco de dados inicializado com sucesso!');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Criar stores/tabelas do banco de dados
                
                // Usuários
                if (!db.objectStoreNames.contains('usuarios')) {
                    const usuariosStore = db.createObjectStore('usuarios', { keyPath: 'username' });
                    usuariosStore.createIndex('nome', 'nome', { unique: false });
                    usuariosStore.createIndex('perfil', 'perfil', { unique: false });
                }
                
                // Produtos
                if (!db.objectStoreNames.contains('produtos')) {
                    const produtosStore = db.createObjectStore('produtos', { keyPath: 'id' });
                    produtosStore.createIndex('codigo_barras', 'codigo_barras', { unique: true });
                    produtosStore.createIndex('nome', 'nome', { unique: false });
                    produtosStore.createIndex('grupo', 'grupo', { unique: false });
                    produtosStore.createIndex('estoque', 'estoque', { unique: false });
                }
                
                // Clientes
                if (!db.objectStoreNames.contains('clientes')) {
                    const clientesStore = db.createObjectStore('clientes', { keyPath: 'id' });
                    clientesStore.createIndex('nome', 'nome', { unique: false });
                    clientesStore.createIndex('documento', 'documento', { unique: false });
                }
                
                // Vendas
                if (!db.objectStoreNames.contains('vendas')) {
                    const vendasStore = db.createObjectStore('vendas', { keyPath: 'id' });
                    vendasStore.createIndex('data', 'data', { unique: false });
                    vendasStore.createIndex('cliente_id', 'cliente_id', { unique: false });
                    vendasStore.createIndex('usuario', 'usuario', { unique: false });
                }
                
                // Configurações
                if (!db.objectStoreNames.contains('configuracoes')) {
                    db.createObjectStore('configuracoes', { keyPath: 'id' });
                }
                
                // Dados auxiliares (grupos, marcas, formas de pagamento)
                if (!db.objectStoreNames.contains('auxiliares')) {
                    db.createObjectStore('auxiliares', { keyPath: 'id' });
                }
                
                // Carrinho temporário
                if (!db.objectStoreNames.contains('carrinho')) {
                    const carrinhoStore = db.createObjectStore('carrinho', { keyPath: 'id', autoIncrement: true });
                    carrinhoStore.createIndex('produto_id', 'produto_id', { unique: false });
                }
                
                // Inicializar dados padrão após criação das tabelas
                this.inicializarDadosPadrao(db);
            };
        });
    }
    
    // Inicializa dados padrão se o banco estiver vazio
    async inicializarDadosPadrao(db) {
        try {
            // Verificar se já existem dados
            const verificarUsuarios = await this.count('usuarios');
            
            if (verificarUsuarios === 0) {
                console.log('Inicializando dados padrão...');
                
                // Usuário admin
                const usuarioAdmin = {
                    username: "admjesus",
                    nome: "ADM Jesus",
                    cargo: "Administrador",
                    email: "admin@orionpdv.com",
                    senha_hash: this.hashSenha("senha123"),
                    ultimo_acesso: null,
                    perfil: "admin"
                };
                await this.add('usuarios', usuarioAdmin);
                
                // Produtos de exemplo
                const produtos = [
                    {
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
                    {
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
                    {
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
                ];
                
                for (const produto of produtos) {
                    await this.add('produtos', produto);
                }
                
                // Cliente padrão
                const clientePadrao = {
                    id: "1",
                    nome: "Consumidor Final",
                    documento: "",
                    telefone: "",
                    email: "",
                    endereco: "",
                    cidade: "",
                    data_cadastro: new Date().toISOString()
                };
                await this.add('clientes', clientePadrao);
                
                // Dados auxiliares
                const auxiliares = [
                    {
                        id: 'grupos',
                        dados: ["Alimentos", "Bebidas", "Limpeza", "Higiene", "Laticínios", "Grãos", "Diversos"]
                    },
                    {
                        id: 'marcas',
                        dados: ["Nestlé", "Unilever", "P&G", "Ambev", "Tio João", "Pilão", "Outras"]
                    },
                    {
                        id: 'formas_pagamento',
                        dados: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Pix", "Transferência"]
                    }
                ];
                
                for (const aux of auxiliares) {
                    await this.add('auxiliares', aux);
                }
                
                // Configurações iniciais
                const config = {
                    id: 'config',
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
                    cor_secundaria: "#1E88E5"
                };
                
                await this.add('configuracoes', config);
                
                console.log('Dados padrão inicializados com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao inicializar dados padrão:', error);
        }
    }
    
    // Métodos genéricos para operações no banco de dados
    
    async add(store, data) {
        await this.initPromise;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([store], 'readwrite');
            const objectStore = transaction.objectStore(store);
            const request = objectStore.add(data);
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    async put(store, data) {
        await this.initPromise;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([store], 'readwrite');
            const objectStore = transaction.objectStore(store);
            const request = objectStore.put(data);
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    async getAll(store) {
        await this.initPromise;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([store], 'readonly');
            const objectStore = transaction.objectStore(store);
            const request = objectStore.getAll();
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    async get(store, key) {
        await this.initPromise;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([store], 'readonly');
            const objectStore = transaction.objectStore(store);
            const request = objectStore.get(key);
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    async delete(store, key) {
        await this.initPromise;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([store], 'readwrite');
            const objectStore = transaction.objectStore(store);
            const request = objectStore.delete(key);
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    async clear(store) {
        await this.initPromise;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([store], 'readwrite');
            const objectStore = transaction.objectStore(store);
            const request = objectStore.clear();
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    async count(store) {
        await this.initPromise;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([store], 'readonly');
            const objectStore = transaction.objectStore(store);
            const request = objectStore.count();
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    async getByIndex(store, indexName, value) {
        await this.initPromise;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([store], 'readonly');
            const objectStore = transaction.objectStore(store);
            const index = objectStore.index(indexName);
            const request = index.getAll(value);
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    // Métodos específicos para o sistema
    
    hashSenha(senha) {
        // Usando CryptoJS
        if (typeof CryptoJS !== 'undefined') {
            return CryptoJS.SHA256(senha).toString();
        }
        
        // Fallback simples para hash (NÃO usar em produção real)
        let hash = 0;
        for (let i = 0; i < senha.length; i++) {
            const char = senha.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }
    
    async gerarId() {
        return Math.random().toString(36).substring(2, 9);
    }
    
    // Métodos específicos para cada entidade
    
    // Usuários
    async getUsuarios() {
        return this.getAll('usuarios');
    }
    
    async getUsuario(username) {
        return this.get('usuarios', username);
    }
    
    async salvarUsuario(usuario) {
        return this.put('usuarios', usuario);
    }
    
    async verificarLogin(username, senha) {
        const usuario = await this.getUsuario(username);
        
        if (usuario) {
            const senhaHash = this.hashSenha(senha);
            if (senhaHash === usuario.senha_hash) {
                return {
                    success: true,
                    usuario: {
                        username: usuario.username,
                        nome: usuario.nome,
                        perfil: usuario.perfil
                    }
                };
            }
        }
        
        return { success: false };
    }
    
    // Produtos
    async getProdutos() {
        return this.getAll('produtos');
    }
    
    async getProduto(id) {
        return this.get('produtos', id);
    }
    
    async getProdutoPorCodigoBarras(codigo) {
        const produtos = await this.getByIndex('produtos', 'codigo_barras', codigo);
        return produtos.length > 0 ? produtos[0] : null;
    }
    
    async salvarProduto(produto) {
        if (!produto.id) {
            produto.id = produto.codigo_barras || await this.gerarId();
            produto.data_cadastro = new Date().toISOString();
        }
        
        return this.put('produtos', produto);
    }
    
    async atualizarEstoqueProduto(id, quantidade) {
        const produto = await this.getProduto(id);
        
        if (produto) {
            produto.estoque += parseInt(quantidade);
            await this.salvarProduto(produto);
            return true;
        }
        
        return false;
    }
    
    async deletarProduto(id) {
        return this.delete('produtos', id);
    }
    
    // Clientes
    async getClientes() {
        return this.getAll('clientes');
    }
    
    async getCliente(id) {
        return this.get('clientes', id);
    }
    
    async salvarCliente(cliente) {
        if (!cliente.id) {
            cliente.id = await this.gerarId();
            cliente.data_cadastro = new Date().toISOString();
        }
        
        return this.put('clientes', cliente);
    }
    
    async deletarCliente(id) {
        return this.delete('clientes', id);
    }
    
    // Vendas
    async getVendas() {
        return this.getAll('vendas');
    }
    
    async getVenda(id) {
        return this.get('vendas', id);
    }
    
    async salvarVenda(venda) {
        if (!venda.id) {
            venda.id = await this.gerarId();
        }
        
        if (!venda.data) {
            venda.data = new Date().toISOString();
        }
        
        await this.put('vendas', venda);
        
        // Limpar carrinho
        await this.limparCarrinho();
        
        return venda;
    }
    
    // Carrinho
    async getCarrinho() {
        return this.getAll('carrinho');
    }
    
    async adicionarItemCarrinho(item) {
        const carrinho = await this.getCarrinho();
        
        // Verificar se o produto já está no carrinho
        const itemExistente = carrinho.find(i => i.produto_id === item.produto_id);
        
        if (itemExistente) {
            // Atualizar quantidade e subtotal
            itemExistente.quantidade += item.quantidade;
            itemExistente.subtotal = itemExistente.quantidade * itemExistente.preco_unitario;
            await this.put('carrinho', itemExistente);
        } else {
            // Adicionar novo item
            await this.add('carrinho', item);
        }
        
        // Atualizar estoque temporariamente
        await this.atualizarEstoqueProduto(item.produto_id, -item.quantidade);
        
        return this.getCarrinho();
    }
    
    async removerItemCarrinho(id) {
        const item = await this.get('carrinho', id);
        
        if (item) {
            // Devolver ao estoque
            await this.atualizarEstoqueProduto(item.produto_id, item.quantidade);
            
            // Remover do carrinho
            await this.delete('carrinho', id);
        }
        
        return this.getCarrinho();
    }
    
    async limparCarrinho() {
        return this.clear('carrinho');
    }
    
    // Configurações
    async getConfig() {
        return this.get('configuracoes', 'config');
    }
    
    async salvarConfig(config) {
        config.id = 'config';
        return this.put('configuracoes', config);
    }
    
    // Dados auxiliares
    async getGrupos() {
        const aux = await this.get('auxiliares', 'grupos');
        return aux ? aux.dados : [];
    }
    
    async getMarcas() {
        const aux = await this.get('auxiliares', 'marcas');
        return aux ? aux.dados : [];
    }
    
    async getFormasPagamento() {
        const aux = await this.get('auxiliares', 'formas_pagamento');
        return aux ? aux.dados : [];
    }
    
    async salvarDadosAuxiliares(id, dados) {
        return this.put('auxiliares', { id, dados });
    }
    
    // Backup e restauração
    async gerarBackup() {
        try {
            const dados = {
                timestamp: new Date().toISOString(),
                version: this.DB_VERSION,
                usuarios: await this.getUsuarios(),
                produtos: await this.getProdutos(),
                clientes: await this.getClientes(),
                vendas: await this.getVendas(),
                configuracoes: [await this.getConfig()],
                auxiliares: await this.getAll('auxiliares')
            };
            
            return JSON.stringify(dados);
        } catch (error) {
            console.error('Erro ao gerar backup:', error);
            throw error;
        }
    }
    
    async restaurarBackup(jsonContent) {
        try {
            const dados = JSON.parse(jsonContent);
            
            // Validar estrutura básica do backup
            if (!dados.version || !dados.produtos || !dados.usuarios) {
                throw new Error("Arquivo de backup inválido");
            }
            
            // Limpar todas as tabelas
            await this.clear('usuarios');
            await this.clear('produtos');
            await this.clear('clientes');
            await this.clear('vendas');
            await this.clear('configuracoes');
            await this.clear('auxiliares');
            await this.clear('carrinho');
            
            // Restaurar dados
            for (const usuario of dados.usuarios) {
                await this.put('usuarios', usuario);
            }
            
            for (const produto of dados.produtos) {
                await this.put('produtos', produto);
            }
            
            for (const cliente of dados.clientes) {
                await this.put('clientes', cliente);
            }
            
            for (const venda of dados.vendas) {
                await this.put('vendas', venda);
            }
            
            for (const config of dados.configuracoes) {
                await this.put('configuracoes', config);
            }
            
            for (const aux of dados.auxiliares) {
                await this.put('auxiliares', aux);
            }
            
            return {
                sucesso: true,
                mensagem: `Backup restaurado com sucesso. Data do backup: ${new Date(dados.timestamp).toLocaleString()}`
            };
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            return {
                sucesso: false,
                mensagem: `Erro ao restaurar backup: ${error.message}`
            };
        }
    }
    
    // Exportação e relatórios
    async exportarCSV(dados, nomeArquivo) {
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
        
        // Criar blob para download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Criar link de download
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', nomeArquivo);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
    }
    
    async gerarRelatorioVendas(filtros = {}) {
        let vendas = await this.getVendas();
        
        // Aplicar filtros
        if (filtros.dataInicio) {
            const dataInicio = new Date(filtros.dataInicio);
            vendas = vendas.filter(v => new Date(v.data) >= dataInicio);
        }
        
        if (filtros.dataFim) {
            const dataFim = new Date(filtros.dataFim);
            dataFim.setHours(23, 59, 59, 999);
            vendas = vendas.filter(v => new Date(v.data) <= dataFim);
        }
        
        if (filtros.cliente) {
            vendas = vendas.filter(v => v.cliente_id === filtros.cliente);
        }
        
        if (filtros.formaPagamento) {
            vendas = vendas.filter(v => v.forma_pagamento === filtros.formaPagamento);
        }
        
        // Calcular métricas
        const totalVendas = vendas.length;
        const valorTotal = vendas.reduce((sum, v) => sum + v.total, 0);
        const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0;
        const totalDescontos = vendas.reduce((sum, v) => sum + (v.desconto || 0), 0);
        
        // Agrupar por data
        const vendasPorData = {};
        vendas.forEach(v => {
            const data = v.data.split('T')[0];
            if (!vendasPorData[data]) {
                vendasPorData[data] = { total: 0, quantidade: 0 };
            }
            vendasPorData[data].total += v.total;
            vendasPorData[data].quantidade += 1;
        });
        
        // Agrupar por forma de pagamento
        const vendasPorFormaPagamento = {};
        vendas.forEach(v => {
            if (!vendasPorFormaPagamento[v.forma_pagamento]) {
                vendasPorFormaPagamento[v.forma_pagamento] = { total: 0, quantidade: 0 };
            }
            vendasPorFormaPagamento[v.forma_pagamento].total += v.total;
            vendasPorFormaPagamento[v.forma_pagamento].quantidade += 1;
        });
        
        return {
            vendas,
            totalVendas,
            valorTotal,
            ticketMedio,
            totalDescontos,
            vendasPorData,
            vendasPorFormaPagamento
        };
    }
}

// Instância global
const dbManager = new OrionDatabaseManager();
