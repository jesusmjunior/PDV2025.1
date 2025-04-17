// Arquivo: js/database.js
class Database {
    constructor() {
        // Inicializar database
        this.initializeDB();
    }

    async initializeDB() {
        // Verificar e criar estruturas iniciais
        if (!localStorage.getItem('produtos')) {
            // Dados iniciais de produtos
            const produtosIniciais = {
                '7891000315507': {
                    nome: 'Leite Integral',
                    codigo_barras: '7891000315507',
                    grupo: 'Laticínios',
                    marca: 'Ninho',
                    preco: 5.99,
                    estoque: 50,
                    foto: "https://www.nestleprofessional.com.br/sites/default/files/styles/np_product_detail/public/2022-09/leite-em-po-ninho-integral-lata-400g.png"
                },
                '7891910000197': {
                    nome: 'Arroz',
                    codigo_barras: '7891910000197',
                    grupo: 'Grãos',
                    marca: 'Tio João',
                    preco: 22.90,
                    estoque: 35,
                    foto: "https://m.media-amazon.com/images/I/61l6ojQQtDL._AC_UF894,1000_QL80_.jpg"
                },
                '7891149410116': {
                    nome: 'Café',
                    codigo_barras: '7891149410116',
                    grupo: 'Bebidas',
                    marca: 'Pilão',
                    preco: 15.75,
                    estoque: 28,
                    foto: "https://m.media-amazon.com/images/I/51xq5MnKz4L._AC_UF894,1000_QL80_.jpg"
                }
            };
            localStorage.setItem('produtos', JSON.stringify(produtosIniciais));
        }
        
        if (!localStorage.getItem('vendas')) {
            // Dados iniciais de vendas
            const vendasIniciais = [{
                "id": "ABC123",
                "data": "2025-04-13 10:00:00",
                "cliente": "Consumidor Final",
                "forma_pgto": "Dinheiro",
                "itens": [{
                    "produto": "Leite Integral",
                    "quantidade": 1,
                    "preco_unit": 5.99,
                    "total": 5.99
                }],
                "total": 5.99
            }];
            localStorage.setItem('vendas', JSON.stringify(vendasIniciais));
        }
        
        if (!localStorage.getItem('clientes')) {
            localStorage.setItem('clientes', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('carrinho')) {
            localStorage.setItem('carrinho', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('grupos')) {
            const gruposIniciais = ["Alimentos", "Bebidas", "Limpeza", "Higiene", "Diversos"];
            localStorage.setItem('grupos', JSON.stringify(gruposIniciais));
        }
        
        if (!localStorage.getItem('marcas')) {
            const marcasIniciais = ["Nestlé", "Unilever", "P&G", "Ambev", "Outras"];
            localStorage.setItem('marcas', JSON.stringify(marcasIniciais));
        }
        
        if (!localStorage.getItem('formas_pgto')) {
            const formasPgtoIniciais = ["Dinheiro", "Cartão", "Pix"];
            localStorage.setItem('formas_pgto', JSON.stringify(formasPgtoIniciais));
        }
        
        if (!localStorage.getItem('config')) {
            const configInicial = {
                nome_empresa: "ORION PDV",
                cnpj: "",
                telefone: "",
                endereco: "",
                cidade: "",
                email: "",
                logo_url: "https://i.imgur.com/Ka8kNST.png"
            };
            localStorage.setItem('config', JSON.stringify(configInicial));
        }
        
        // Inicializar usuários
        if (!localStorage.getItem('usuarios')) {
            const usuariosIniciais = {
                "admjesus": {
                    "nome": "ADM Jesus",
                    "senha_hash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3" // hash de "123"
                }
            };
            localStorage.setItem('usuarios', JSON.stringify(usuariosIniciais));
        }
    }

    // Métodos para Produtos
    getProdutos() {
        return JSON.parse(localStorage.getItem('produtos') || '{}');
    }
    
    getProdutoPorCodigo(codigo) {
        const produtos = this.getProdutos();
        return produtos[codigo];
    }
    
    salvarProduto(produto) {
        const produtos = this.getProdutos();
        produtos[produto.codigo_barras] = produto;
        localStorage.setItem('produtos', JSON.stringify(produtos));
    }
    
    atualizarEstoque(codigo, quantidade) {
        const produtos = this.getProdutos();
        if (produtos[codigo]) {
            produtos[codigo].estoque = Number(produtos[codigo].estoque) + Number(quantidade);
            localStorage.setItem('produtos', JSON.stringify(produtos));
            return true;
        }
        return false;
    }
    
    // Métodos para Clientes
    getClientes() {
        return JSON.parse(localStorage.getItem('clientes') || '[]');
    }
    
    salvarCliente(cliente) {
        const clientes = this.getClientes();
        // Gerar ID se não existir
        if (!cliente.ID) {
            cliente.ID = this.gerarUUID().substr(0, 8);
        }
        clientes.push(cliente);
        localStorage.setItem('clientes', JSON.stringify(clientes));
    }
    
    // Métodos para Vendas
    getVendas() {
        return JSON.parse(localStorage.getItem('vendas') || '[]');
    }
    
    salvarVenda(venda) {
        const vendas = this.getVendas();
        // Gerar ID se não existir
        if (!venda.id) {
            venda.id = this.gerarUUID().substr(0, 6);
        }
        // Definir data atual se não existir
        if (!venda.data) {
            venda.data = new Date().toISOString().replace('T', ' ').substr(0, 19);
        }
        vendas.push(venda);
        localStorage.setItem('vendas', JSON.stringify(vendas));
        
        // Limpar carrinho após finalizar venda
        this.limparCarrinho();
        return venda;
    }
    
    // Métodos para Carrinho
    getCarrinho() {
        return JSON.parse(localStorage.getItem('carrinho') || '[]');
    }
    
    adicionarAoCarrinho(item) {
        const carrinho = this.getCarrinho();
        // Verificar se o produto já está no carrinho
        const itemExistente = carrinho.find(i => i.codigo_barras === item.codigo_barras);
        
        if (itemExistente) {
            itemExistente.quantidade += item.quantidade;
            itemExistente.total = itemExistente.quantidade * itemExistente.preco_unit;
        } else {
            carrinho.push(item);
        }
        
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        
        // Atualizar estoque
        this.atualizarEstoque(item.codigo_barras, -item.quantidade);
    }
    
    removerDoCarrinho(index) {
        const carrinho = this.getCarrinho();
        const item = carrinho[index];
        
        // Devolver ao estoque
        this.atualizarEstoque(item.codigo_barras, item.quantidade);
        
        // Remover do carrinho
        carrinho.splice(index, 1);
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
    }
    
    limparCarrinho() {
        localStorage.setItem('carrinho', JSON.stringify([]));
    }
    
    // Métodos auxiliares
    gerarUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // Métodos para exportação
    exportarCSV(dados, nomeArquivo) {
        // Converter dados para CSV
        let csv = '';
        
        // Obter cabeçalho
        if (dados.length > 0) {
            const cabecalhos = Object.keys(dados[0]);
            csv += cabecalhos.join(',') + '\n';
            
            // Adicionar linhas
            dados.forEach(row => {
                const valores = cabecalhos.map(header => {
                    const valor = row[header];
                    // Escapar strings com vírgulas
                    if (typeof valor === 'string' && valor.includes(',')) {
                        return `"${valor}"`;
                    }
                    return valor;
                });
                csv += valores.join(',') + '\n';
            });
        }
        
        // Criar blob e link para download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', nomeArquivo);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Backup e restauração
    gerarBackup() {
        const dados = {
            produtos: this.getProdutos(),
            vendas: this.getVendas(),
            clientes: this.getClientes(),
            grupos: JSON.parse(localStorage.getItem('grupos') || '[]'),
            marcas: JSON.parse(localStorage.getItem('marcas') || '[]'),
            formas_pgto: JSON.parse(localStorage.getItem('formas_pgto') || '[]'),
            config: JSON.parse(localStorage.getItem('config') || '{}'),
            data_exportacao: new Date().toISOString()
        };
        
        return JSON.stringify(dados);
    }
    
    restaurarBackup(dadosJson) {
        try {
            const dados = JSON.parse(dadosJson);
            
            // Verificar se o backup é válido
            if (!dados.produtos || !dados.vendas || !dados.clientes) {
                throw new Error('Formato de backup inválido');
            }
            
            // Restaurar dados
            localStorage.setItem('produtos', JSON.stringify(dados.produtos));
            localStorage.setItem('vendas', JSON.stringify(dados.vendas));
            localStorage.setItem('clientes', JSON.stringify(dados.clientes));
            
            if (dados.grupos) localStorage.setItem('grupos', JSON.stringify(dados.grupos));
            if (dados.marcas) localStorage.setItem('marcas', JSON.stringify(dados.marcas));
            if (dados.formas_pgto) localStorage.setItem('formas_pgto', JSON.stringify(dados.formas_pgto));
            if (dados.config) localStorage.setItem('config', JSON.stringify(dados.config));
            
            return {
                sucesso: true,
                mensagem: 'Backup restaurado com sucesso',
                data: dados.data_exportacao
            };
        } catch (erro) {
            return {
                sucesso: false,
                mensagem: `Erro ao restaurar backup: ${erro.message}`
            };
        }
    }
}

// Instância global do banco de dados
const db = new Database();
