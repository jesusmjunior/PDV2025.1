// Arquivo: js/relatorio.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const totalVendasElement = document.getElementById('totalVendas');
    const faturamentoTotalElement = document.getElementById('faturamentoTotal');
    const ticketMedioElement = document.getElementById('ticketMedio');
    const dataInicioInput = document.getElementById('dataInicio');
    const dataFimInput = document.getElementById('dataFim');
    const btnFiltrar = document.getElementById('btnFiltrar');
    const vendasPorDiaChart = document.getElementById('vendasPorDiaChart');
    const vendasPorPgtoChart = document.getElementById('vendasPorPgtoChart');
    const tabelaVendas = document.getElementById('tabelaVendas');
    const btnExportarCSV = document.getElementById('btnExportarCSV');
    const btnRelatorioHTML = document.getElementById('btnRelatorioHTML');
    
    // Inicialização
    inicializarDatas();
    carregarDados();
    
    // Eventos
    btnFiltrar.addEventListener('click', carregarDados);
    btnExportarCSV.addEventListener('click', exportarCSV);
    btnRelatorioHTML.addEventListener('click', gerarRelatorioHTML);
    // Funções
    function inicializarDatas() {
        const hoje = new Date();
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        
        // Formatar datas para o formato YYYY-MM-DD para uso nos inputs date
        const formatarData = (data) => {
            const ano = data.getFullYear();
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const dia = String(data.getDate()).padStart(2, '0');
            return `${ano}-${mes}-${dia}`;
        };
        
        dataInicioInput.value = formatarData(inicioMes);
        dataFimInput.value = formatarData(hoje);
    }
    
    function carregarDados() {
        const vendas = filtrarVendas();
        
        // Atualizar métricas
        atualizarMetricas(vendas);
        
        // Atualizar gráficos
        criarGraficoVendasPorDia(vendas);
        criarGraficoVendasPorFormaPgto(vendas);
        
        // Atualizar tabela
        preencherTabelaVendas(vendas);
    }
    
    function filtrarVendas() {
        const todasVendas = db.getVendas();
        
        // Converter strings de data para objetos Date
        const dataInicio = new Date(dataInicioInput.value);
        dataInicio.setHours(0, 0, 0, 0);
        
        const dataFim = new Date(dataFimInput.value);
        dataFim.setHours(23, 59, 59, 999);
        
        // Filtrar por data
        return todasVendas.filter(venda => {
            const dataVenda = new Date(venda.data);
            return dataVenda >= dataInicio && dataVenda <= dataFim;
        });
    }
    
    function atualizarMetricas(vendas) {
        // Total de vendas
        totalVendasElement.textContent = vendas.length;
        
        // Faturamento total
        const faturamentoTotal = vendas.reduce((total, venda) => total + venda.total, 0);
        faturamentoTotalElement.textContent = `R$ ${faturamentoTotal.toFixed(2)}`;
        
        // Ticket médio
        const ticketMedio = vendas.length > 0 ? faturamentoTotal / vendas.length : 0;
        ticketMedioElement.textContent = `R$ ${ticketMedio.toFixed(2)}`;
    }
    
    function criarGraficoVendasPorDia(vendas) {
        // Agrupar vendas por dia
        const vendasPorDia = {};
        
        vendas.forEach(venda => {
            // Extrair a data (sem a hora)
            const dataVenda = venda.data.split(' ')[0];
            
            if (!vendasPorDia[dataVenda]) {
                vendasPorDia[dataVenda] = 0;
            }
            
            vendasPorDia[dataVenda] += venda.total;
        });
        
        // Ordenar as datas
        const datas = Object.keys(vendasPorDia).sort();
        
        // Preparar dados para o gráfico
        const dadosGrafico = {
            labels: datas.map(data => formatarDataBR(data)),
            datasets: [{
                label: 'Vendas por Dia',
                data: datas.map(data => vendasPorDia[data]),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        };
        
        // Limpar canvas antes de criar novo gráfico
        if (window.vendasPorDiaGrafico) {
            window.vendasPorDiaGrafico.destroy();
        }
        
        // Criar gráfico
        window.vendasPorDiaGrafico = new Chart(vendasPorDiaChart, {
            type: 'bar',
            data: dadosGrafico,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(2);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'R$ ' + context.raw.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }
    
    function criarGraficoVendasPorFormaPgto(vendas) {
        // Agrupar vendas por forma de pagamento
        const vendasPorPgto = {};
        
        vendas.forEach(venda => {
            if (!vendasPorPgto[venda.forma_pgto]) {
                vendasPorPgto[venda.forma_pgto] = 0;
            }
            
            vendasPorPgto[venda.forma_pgto] += venda.total;
        });
        
        // Preparar dados para o gráfico
        const formasPgto = Object.keys(vendasPorPgto);
        const valores = formasPgto.map(forma => vendasPorPgto[forma]);
        
        // Cores para o gráfico
        const cores = [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
        ];
        
        const dadosGrafico = {
            labels: formasPgto,
            datasets: [{
                data: valores,
                backgroundColor: cores.slice(0, formasPgto.length)
            }]
        };
        
        // Limpar canvas antes de criar novo gráfico
        if (window.vendasPorPgtoGrafico) {
            window.vendasPorPgtoGrafico.destroy();
        }
        
        // Criar gráfico
        window.vendasPorPgtoGrafico = new Chart(vendasPorPgtoChart, {
            type: 'pie',
            data: dadosGrafico,
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const valor = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const porcentagem = ((valor / total) * 100).toFixed(2);
                                return `${context.label}: R$ ${valor.toFixed(2)} (${porcentagem}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    function preencherTabelaVendas(vendas) {
        const tbody = tabelaVendas.querySelector('tbody');
        tbody.innerHTML = '';
        
        // Ordenar vendas por data (mais recentes primeiro)
        const vendasOrdenadas = [...vendas].sort((a, b) => 
            new Date(b.data) - new Date(a.data)
        );
        
        vendasOrdenadas.forEach(venda => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${venda.id}</td>
                <td>${formatarDataHoraBR(venda.data)}</td>
                <td>${venda.cliente}</td>
                <td>${venda.forma_pgto}</td>
                <td>R$ ${venda.total.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-info btn-detalhes" data-id="${venda.id}">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Adicionar eventos aos botões de detalhes
        document.querySelectorAll('.btn-detalhes').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                exibirDetalhesVenda(id);
            });
        });
    }
    
    function exibirDetalhesVenda(id) {
        const venda = db.getVendas().find(v => v.id === id);
        
        if (!venda) return;
        
        // Criar modal de detalhes
        const modalHTML = `
            <div class="modal fade" id="detalhesModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Detalhes da Venda #${venda.id}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <p><strong>Data:</strong> ${formatarDataHoraBR(venda.data)}</p>
                                    <p><strong>Cliente:</strong> ${venda.cliente}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Forma de Pagamento:</strong> ${venda.forma_pgto}</p>
                                    <p><strong>Total:</strong> R$ ${venda.total.toFixed(2)}</p>
                                </div>
                            </div>
                            
                            <h6>Itens da Venda</h6>
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Quantidade</th>
                                        <th>Preço Unit.</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${venda.itens.map(item => `
                                        <tr>
                                            <td>${item.produto}</td>
                                            <td>${item.quantidade}</td>
                                            <td>R$ ${item.preco_unit.toFixed(2)}</td>
                                            <td>R$ ${item.total.toFixed(2)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                            <button type="button" class="btn btn-primary btn-imprimir-detalhe">
                                <i class="bi bi-printer"></i> Imprimir Recibo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Inserir modal no DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Exibir modal
        const modal = new bootstrap.Modal(document.getElementById('detalhesModal'));
        modal.show();
        
        // Adicionar evento ao botão de impressão
        document.querySelector('.btn-imprimir-detalhe').addEventListener('click', function() {
            const recibo = gerarReciboHTML(venda);
            const janelaImpressao = window.open('', '_blank');
            janelaImpressao.document.write(recibo);
            janelaImpressao.document.close();
            janelaImpressao.print();
        });
        
        // Remover modal quando fechado
        document.getElementById('detalhesModal').addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(modalContainer);
        });
    }
    
    function exportarCSV() {
        const vendas = filtrarVendas();
        
        // Transformar dados para formato tabular
        const dados = vendas.map(venda => ({
            ID: venda.id,
            Data: venda.data,
            Cliente: venda.cliente,
            'Forma de Pagamento': venda.forma_pgto,
            'Total (R$)': venda.total.toFixed(2)
        }));
        
        // Nome do arquivo com data atual
        const dataAtual = new Date().toISOString().split('T')[0];
        const nomeArquivo = `relatorio_vendas_${dataAtual}.csv`;
        
        // Exportar para CSV
        db.exportarCSV(dados, nomeArquivo);
    }
    
    function gerarRelatorioHTML() {
        const vendas = filtrarVendas();
        const dataInicio = formatarDataBR(dataInicioInput.value);
        const dataFim = formatarDataBR(dataFimInput.value);
        
        // Calcular métricas
        const totalVendas = vendas.length;
        const faturamentoTotal = vendas.reduce((total, venda) => total + venda.total, 0);
        const ticketMedio = totalVendas > 0 ? faturamentoTotal / totalVendas : 0;
        
        // Agrupar vendas por forma de pagamento
        const vendasPorPgto = {};
        vendas.forEach(venda => {
            if (!vendasPorPgto[venda.forma_pgto]) {
                vendasPorPgto[venda.forma_pgto] = { quantidade: 0, valor: 0 };
            }
            vendasPorPgto[venda.forma_pgto].quantidade += 1;
            vendasPorPgto[venda.forma_pgto].valor += venda.total;
        });
        
        // Gerar HTML do relatório
        const config = JSON.parse(localStorage.getItem('config') || '{"nome_empresa":"ORION PDV"}');
        const html = `
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Relatório de Vendas - ${config.nome_empresa}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #333;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .data-relatorio {
                    text-align: right;
                    margin-bottom: 20px;
                    font-size: 0.9em;
                }
                .card {
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .card-header {
                    background-color: #f5f5f5;
                    padding: 10px 15px;
                    border-bottom: 1px solid #ddd;
                    font-weight: bold;
                }
                .card-body {
                    padding: 15px;
                }
                .metricas {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .metrica {
                    text-align: center;
                    padding: 15px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    flex: 1;
                    margin: 0 10px;
                    background-color: #f9f9f9;
                }
                .metrica-valor {
                    font-size: 24px;
                    font-weight: bold;
                    color: #007bff;
                    margin: 10px 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px 12px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 0.8em;
                    color: #777;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 15px;
                    }
                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${config.nome_empresa}</h1>
                <h2>Relatório de Vendas</h2>
                <p>Período: ${dataInicio} a ${dataFim}</p>
            </div>
            
            <div class="data-relatorio">
                Gerado em: ${new Date().toLocaleString()}
            </div>
            
            <div class="card">
                <div class="card-header">Métricas Gerais</div>
                <div class="card-body">
                    <div class="metricas">
                        <div class="metrica">
                            <div>Total de Vendas</div>
                            <div class="metrica-valor">${totalVendas}</div>
                        </div>
                        <div class="metrica">
                            <div>Faturamento Total</div>
                            <div class="metrica-valor">R$ ${faturamentoTotal.toFixed(2)}</div>
                        </div>
                        <div class="metrica">
                            <div>Ticket Médio</div>
                            <div class="metrica-valor">R$ ${ticketMedio.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">Vendas por Forma de Pagamento</div>
                <div class="card-body">
                    <table>
                        <thead>
                            <tr>
                                <th>Forma de Pagamento</th>
                                <th>Quantidade</th>
                                <th>Valor Total</th>
                                <th>Percentual</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(vendasPorPgto).map(([forma, dados]) => `
                                <tr>
                                    <td>${forma}</td>
                                    <td>${dados.quantidade}</td>
                                    <td>R$ ${dados.valor.toFixed(2)}</td>
                                    <td>${((dados.valor / faturamentoTotal) * 100).toFixed(2)}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">Lista de Vendas do Período</div>
                <div class="card-body">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Forma de Pagamento</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${vendas.map(venda => `
                                <tr>
                                    <td>${venda.id}</td>
                                    <td>${formatarDataHoraBR(venda.data)}</td>
                                    <td>${venda.cliente}</td>
                                    <td>${venda.forma_pgto}</td>
                                    <td>R$ ${venda.total.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="footer">
                <p>${config.nome_empresa} &copy; ${new Date().getFullYear()}</p>
                <p>${config.endereco || ''} ${config.cidade || ''}</p>
                <p>${config.email || ''}</p>
            </div>
            
            <div class="no-print" style="text-align: center; margin-top: 20px;">
                <button onclick="window.print();" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Imprimir Relatório
                </button>
            </div>
            
            <script>
                // Imprimir automaticamente quando aberto em nova janela
                if (window.opener) {
                    window.print();
                }
            </script>
        </body>
        </html>
        `;
        
        // Abrir em nova janela para impressão
        const janelaRelatorio = window.open('', '_blank');
        janelaRelatorio.document.write(html);
        janelaRelatorio.document.close();
    }
    
    // Funções auxiliares
    function formatarDataBR(data) {
        if (!data) return '';
        const partes = data.split('-');
        if (partes.length !== 3) return data;
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    
    function formatarDataHoraBR(dataHora) {
        if (!dataHora) return '';
        const [data, hora] = dataHora.split(' ');
        return `${formatarDataBR(data)} ${hora || ''}`;
    }
    
    function gerarReciboHTML(venda) {
        // Implementação similar à função no venda.js
        // ...
    }
});
