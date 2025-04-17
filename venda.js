// Arquivo: js/venda.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const termoBuscaInput = document.getElementById('termoBusca');
    const btnBuscar = document.getElementById('btnBuscar');
    const resultadosBusca = document.getElementById('resultadosBusca');
    const codigoBarrasInput = document.getElementById('codigoBarras');
    const btnUsarCodigo = document.getElementById('btnUsarCodigo');
    const textoOCRInput = document.getElementById('textoOCR');
    const btnExtrairCodigo = document.getElementById('btnExtrairCodigo');
    const resultadoScanner = document.getElementById('resultadoScanner');
    const carrinhoVazio = document.getElementById('carrinhoVazio');
    const itensCarrinho = document.getElementById('itensCarrinho');
    const totalVendaSpan = document.getElementById('totalVenda');
    const btnFinalizarVenda = document.getElementById('btnFinalizarVenda');
    const formFinalizarVenda = document.getElementById('formFinalizarVenda');
    const clienteSelect = document.getElementById('cliente');
    const formaPgtoSelect = document.getElementById('formaPgto');
    
    let ultimoCodigoBarras = null;
    
    // Inicialização
    carregarCarrinho();
    carregarClientes();
    carregarFormasPagamento();
    
    // Eventos
    btnBuscar.addEventListener('click', buscarProdutos);
    termoBuscaInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buscarProdutos();
        }
    });
    
    btnUsarCodigo.addEventListener('click', function() {
        const codigo = codigoBarrasInput.value.trim();
        if (codigo) {
            buscarProdutoPorCodigo(codigo);
        }
    });
    
    btnExtrairCodigo.addEventListener('click', function() {
        const texto = textoOCRInput.value.trim();
        if (texto) {
            const codigo = extrairCodigoBarras(texto);
            if (codigo) {
                codigoBarrasInput.value = codigo;
                ultimoCodigoBarras = codigo;
                resultadoScanner.innerHTML = `
                    <div class="alert alert-success">
                        Código de barras extraído: <strong>${codigo}</strong>
                    </div>
                `;
                buscarProdutoPorCodigo(codigo);
            } else {
                resultadoScanner.innerHTML = `
                    <div class="alert alert-danger">
                        Não foi possível extrair um código de barras válido do texto fornecido.
                    </div>
                `;
            }
        }
    });
    
    formFinalizarVenda.addEventListener('submit', function(e) {
        e.preventDefault();
        finalizarVenda();
    });
    
    // Funções
    function buscarProdutos() {
        const termo = termoBuscaInput.value.trim().toLowerCase();
        if (!termo) return;
        
        const produtos = db.getProdutos();
        const resultados = [];
        
        for (const codigo in produtos) {
            const produto = produtos[codigo];
            if (produto.nome.toLowerCase().includes(termo) || produto.codigo_barras.includes(termo)) {
                resultados.push(produto);
            }
        }
        
        exibirResultadosBusca(resultados);
    }
    
    function exibirResultadosBusca(produtos) {
        resultadosBusca.innerHTML = '';
        
        if (produtos.length === 0) {
            resultadosBusca.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-warning">
                        Nenhum produto encontrado.
                    </div>
                </div>
            `;
            return;
        }
        
        produtos.forEach(produto => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-3';
            
            col.innerHTML = `
                <div class="card h-100">
                    <img src="${produto.foto}" class="card-img-top p-2" alt="${produto.nome}" style="height: 200px; object-fit: contain;">
                    <div class="card-body">
                        <h5 class="card-title">${produto.nome}</h5>
                        <p class="card-text">
                            <strong>Preço:</strong> R$ ${produto.preco.toFixed(2)}<br>
                            <strong>Estoque:</strong> ${produto.estoque} unidades
                        </p>
                        <form class="form-add-produto">
                            <div class="mb-3">
                                <label for="qtd_${produto.codigo_barras}" class="form-label">Quantidade</label>
                                <input type="number" class="form-control" 
                                       id="qtd_${produto.codigo_barras}" 
                                       min="1" max="${produto.estoque}" value="1">
                            </div>
                            <button type="submit" class="btn btn-primary w-100" 
                                    data-codigo="${produto.codigo_barras}">
                                <i class="bi bi-cart-plus"></i> Adicionar
                            </button>
                        </form>
                    </div>
                </div>
            `;
            
            resultadosBusca.appendChild(col);
            
            // Adicionar evento ao formulário
            const form = col.querySelector('.form-add-produto');
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const codigo = this.querySelector('button').getAttribute('data-codigo');
                const quantidade = parseInt(document.getElementById(`qtd_${codigo}`).value);
                adicionarAoCarrinho(codigo, quantidade);
            });
        });
    }
    
    function buscarProdutoPorCodigo(codigo) {
        const produto = db.getProdutoPorCodigo(codigo);
        
        if (produto) {
            resultadoScanner.innerHTML = `
                <div class="alert alert-success">
                    Produto encontrado: <strong>${produto.nome}</strong>
                </div>
                <div class="card mb-3">
                    <div class="row g-0">
                        <div class="col-md-4">
                            <img src="${produto.foto}" class="img-fluid rounded-start p-2" alt="${produto.nome}">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title">${produto.nome}</h5>
                                <p class="card-text">
                                    <strong>Preço:</strong> R$ ${produto.preco.toFixed(2)}<br>
                                    <strong>Estoque:</strong> ${produto.estoque} unidades
                                </p>
                                <div class="mb-3">
                                    <label for="qtd_scanner" class="form-label">Quantidade</label>
                                    <input type="number" class="form-control" id="qtd_scanner" 
                                           min="1" max="${produto.estoque}" value="1" style="max-width: 100px;">
                                </div>
                                <button class="btn btn-primary" id="btnAdicionarScanner">
                                    <i class="bi bi-cart-plus"></i> Adicionar ao Carrinho
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('btnAdicionarScanner').addEventListener('click', function() {
                const quantidade = parseInt(document.getElementById('qtd_scanner').value);
                adicionarAoCarrinho(codigo, quantidade);
                // Limpar o código de barras após adicionar
                codigoBarrasInput.value = '';
                ultimoCodigoBarras = null;
                resultadoScanner.innerHTML = `
                    <div class="alert alert-success">
                        Produto adicionado ao carrinho!
                    </div>
                `;
            });
        } else {
            resultadoScanner.innerHTML = `
                <div class="alert alert-warning">
                    Código ${codigo} não encontrado no cadastro.
                </div>
            `;
        }
    }
    
    function extrairCodigoBarras(texto) {
        // Extrai todos os números da string
        const numeros = texto.match(/\d+/g);
        
        if (!numeros) return null;
        
        // Junta todos os números em uma única string
        const codigoExtraido = numeros.join('');
        
        // Se tivermos um número de pelo menos 8 dígitos, considera como um código de barras válido
        if (codigoExtraido.length >= 8) {
            return codigoExtraido;
        }
        
        return null;
    }
    
    function adicionarAoCarrinho(codigo, quantidade) {
        const produto = db.getProdutoPorCodigo(codigo);
        
        if (!produto || produto.estoque < quantidade) {
            alert('Produto não encontrado ou estoque insuficiente!');
            return;
        }
        
        const item = {
            codigo_barras: codigo,
            produto: produto.nome,
            quantidade: quantidade,
            preco_unit: produto.preco,
            total: quantidade * produto.preco,
            foto: produto.foto
        };
        
        db.adicionarAoCarrinho(item);
        carregarCarrinho();
        
        // Mostrar notificação
        const toast = document.createElement('div');
        toast.className = 'position-fixed bottom-0 end-0 p-3';
        toast.style.zIndex = 5;
        toast.innerHTML = `
            <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <strong class="me-auto">ORION PDV</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    Adicionado ${quantidade}x ${produto.nome} ao carrinho!
                </div>
            </div>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3000);
    }
    
    function carregarCarrinho() {
        const carrinho = db.getCarrinho();
        
        if (carrinho.length === 0) {
            carrinhoVazio.style.display = 'block';
            itensCarrinho.innerHTML = '';
            totalVendaSpan.textContent = 'R$ 0,00';
            btnFinalizarVenda.disabled = true;
            return;
        }
        
        carrinhoVazio.style.display = 'none';
        itensCarrinho.innerHTML = '';
        let totalVenda = 0;
        
        const table = document.createElement('table');
        table.className = 'table table-striped';
        table.innerHTML = `
            <thead>
                <tr>
                    <th width="60"></th>
                    <th>Produto</th>
                    <th>Preço</th>
                    <th>Qtd</th>
                    <th>Total</th>
                    <th width="50"></th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        
        carrinho.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <img src="${item.foto}" alt="${item.produto}" width="50" height="50" style="object-fit: contain;">
                </td>
                <td>${item.produto}</td>
                <td>R$ ${item.preco_unit.toFixed(2)}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${item.total.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-danger btn-remover" data-index="${index}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
            totalVenda += item.total;
        });
        
        itensCarrinho.appendChild(table);
        
        // Adicionar eventos de remoção
        document.querySelectorAll('.btn-remover').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                db.removerDoCarrinho(index);
                carregarCarrinho();
            });
        });
        
        totalVendaSpan.textContent = `R$ ${totalVenda.toFixed(2)}`;
        btnFinalizarVenda.disabled = false;
    }
    
    function carregarClientes() {
        const clientes = db.getClientes();
        
        // Limpar opções existentes (exceto "Consumidor Final")
        while (clienteSelect.options.length > 1) {
            clienteSelect.remove(1);
        }
        
        // Adicionar clientes da base
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.NOME;
            option.textContent = cliente.NOME;
            clienteSelect.appendChild(option);
        });
    }
    
    function carregarFormasPagamento() {
        const formasPgto = JSON.parse(localStorage.getItem('formas_pgto') || '["Dinheiro", "Cartão", "Pix"]');
        
        // Limpar opções existentes
        formaPgtoSelect.innerHTML = '';
        
        // Adicionar formas de pagamento
        formasPgto.forEach(forma => {
            const option = document.createElement('option');
            option.value = forma;
            option.textContent = forma;
            formaPgtoSelect.appendChild(option);
        });
    }
    
    function finalizarVenda() {
        const carrinho = db.getCarrinho();
        
        if (carrinho.length === 0) {
            alert('O carrinho está vazio!');
            return;
        }
        
        // Calcular total
        let totalVenda = 0;
        carrinho.forEach(item => {
            totalVenda += item.total;
        });
        
        // Criar objeto da venda
        const venda = {
            id: '',  // Será gerado pelo db
            data: '',  // Será gerado pelo db
            cliente: clienteSelect.value,
            forma_pgto: formaPgtoSelect.value,
            itens: carrinho,
            total: totalVenda
        };
        
        // Salvar venda
        const vendaFinalizada = db.salvarVenda(venda);
        
        // Gerar recibo
        const recibo = gerarReciboHTML(vendaFinalizada);
        
        // Exibir no modal
        document.getElementById('conteudoRecibo').innerHTML = recibo;
        
        // Configurar botão de download
        document.getElementById('btnDownloadRecibo').onclick = function() {
            const blob = new Blob([recibo], { type: 'text/html;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `recibo_${vendaFinalizada.id}.html`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        
        // Configurar botão de impressão
        document.getElementById('btnImprimirRecibo').onclick = function() {
            const janelaImpressao = window.open('', '_blank');
            janelaImpressao.document.write(recibo);
            janelaImpressao.document.close();
            janelaImpressao.print();
        };
        
        // Exibir modal
        const reciboModal = new bootstrap.Modal(document.getElementById('reciboModal'));
        reciboModal.show();
        
        // Limpar formulário
        clienteSelect.value = 'Consumidor Final';
        
        // Atualizar interface
        carregarCarrinho();
    }
    
    function gerarReciboHTML(venda) {
        const timestamp = new Date().toLocaleString();
        const config = JSON.parse(localStorage.getItem('config') || '{"nome_empresa":"ORION PDV"}');
        
        return `
        <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Recibo</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .linha { border-top: 1px dashed #000; margin: 10px 0; }
            .total { font-weight: bold; font-size: 1.2em; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .footer { text-align: center; margin-top: 30px; font-size: 0.9em; color: #555; }
        </style></head><body>
        <div class="header">
            <h2>${config.nome_empresa}</h2>
            <h3>CUPOM ELETRÔNICO</h3>
        </div>
        <div class="linha"></div>
        <p><strong>Data:</strong> ${venda.data}</p>
        <p><strong>Cliente:</strong> ${venda.cliente}</p>
        <p><strong>Pagamento:</strong> ${venda.forma_pgto}</p>
        <div class="linha"></div>
        <table>
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Unit</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
        `;
    }
});
