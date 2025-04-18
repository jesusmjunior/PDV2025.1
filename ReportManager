// assets/js/report-manager.js
class OrionReportManager {
    constructor() {
        this.db = window.db;
        this.chartInstances = {};
    }

    // Gerar relatório de vendas
    gerarRelatorioVendas(filtros = {}) {
        // Obter relatório do banco de dados
        const relatorio = this.db.gerarRelatorioVendas(filtros);
        
        return relatorio;
    }

    // Criar gráfico de vendas por período
    criarGraficoVendasPorPeriodo(canvasId, dados, tipo = 'dia') {
        const canvas = document.getElementById(canvasId);
        if (!canvas || !canvas.getContext) {
            console.error(`Canvas com ID ${canvasId} não encontrado`);
            return null;
        }

        // Destruir gráfico anterior se existir
        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
        }

        // Preparar dados para o gráfico
        const vendasPorPeriodo = dados.vendasPorData;
        const periodos = Object.keys(vendasPorPeriodo).sort();
        
        // Formatar labels de acordo com o tipo de período
        const labels = periodos.map(periodo => {
            const data = new Date(periodo);
            
            if (tipo === 'dia') {
                return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            } else if (tipo === 'mes') {
                return data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
            } else if (tipo === 'semana') {
                // Calcular início da semana (domingo)
                const inicio = new Date(data);
                inicio.setDate(data.getDate() - data.getDay());
                
                // Calcular fim da semana (sábado)
                const fim = new Date(inicio);
                fim.setDate(inicio.getDate() + 6);
                
                return `${inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${fim.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
            }
            
            return periodo;
        });
        
        // Criar dados para o gráfico
        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Vendas (R$)',
                    data: periodos.map(p => vendasPorPeriodo[p].total),
                    backgroundColor: 'rgba(30, 136, 229, 0.2)',
                    borderColor: 'rgba(30, 136, 229, 1)',
                    borderWidth: 1,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Quantidade',
                    data: periodos.map(p => vendasPorPeriodo[p].quantidade),
                    backgroundColor: 'rgba(67, 160, 71, 0.2)',
                    borderColor: 'rgba(67, 160, 71, 1)',
                    borderWidth: 1,
                    tension: 0.3,
                    fill: true,
                    hidden: true // Oculto por padrão
                }
            ]
        };
        
        // Criar gráfico
        const chart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                
                                if (label === 'Vendas (R$)') {
                                    return `${label}: R$ ${context.raw.toFixed(2)}`;
                                }
                                
                                return `${label}: ${context.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            callback: function(value, index, values) {
                                return `R$ ${value.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
        
        // Armazenar instância do gráfico
        this.chartInstances[canvasId] = chart;
        
        return chart;
    }

    // Criar gráfico de vendas por forma de pagamento
    criarGraficoVendasPorFormaPagamento(canvasId, dados) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || !canvas.getContext) {
            console.error(`Canvas com ID ${canvasId} não encontrado`);
            return null;
        }

        // Destruir gráfico anterior se existir
        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
        }

        // Preparar dados para o gráfico
        const vendasPorFormaPagamento = dados.vendasPorFormaPagamento;
        const formasPagamento = Object.keys(vendasPorFormaPagamento);
        
        // Cores para o gráfico
        const cores = [
            '#1E88E5', // Azul
            '#43A047', // Verde
            '#FFB300', // Amarelo
            '#E53935', // Vermelho
            '#8E24AA',  // Roxo
            '#00ACC1', // Ciano
            '#F4511E', // Laranja
            '#546E7A'  // Cinza azulado
        ];
        
        // Criar dados para o gráfico
        const chartData = {
            labels: formasPagamento,
            datasets: [{
                data: formasPagamento.map(f => vendasPorFormaPagamento[f].total),
                backgroundColor: cores.slice(0, formasPagamento.length),
                borderWidth: 0
            }]
        };
        
        // Criar gráfico
        const chart = new Chart(canvas.getContext('2d'), {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const valor = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const porcentagem = ((valor / total) * 100).toFixed(1);
                                
                                return `${context.label}: R$ ${valor.toFixed(2)} (${porcentagem}%)`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
        
        // Armazenar instância do gráfico
        this.chartInstances[canvasId] = chart;
        
        return chart;
    }

    // Criar gráfico de produtos mais vendidos
    criarGraficoProdutosMaisVendidos(canvasId, dados, limite = 10) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || !canvas.getContext) {
            console.error(`Canvas com ID ${canvasId} não encontrado`);
            return null;
        }

        // Destruir gráfico anterior se existir
        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
        }

        // Obter vendas
        const vendas = dados.vendas;
        
        // Calcular produtos mais vendidos
        const produtosVendidos = {};
        
        vendas.forEach(venda => {
            venda.itens.forEach(item => {
                if (!produtosVendidos[item.produto_id]) {
                    produtosVendidos[item.produto_id] = {
                        nome: item.produto_nome,
                        quantidade: 0,
                        valor: 0
                    };
                }
                
                produtosVendidos[item.produto_id].quantidade += item.quantidade;
                produtosVendidos[item.produto_id].valor += item.subtotal;
            });
        });
        
        // Converter para array e ordenar por quantidade
        const produtosArray = Object.keys(produtosVendidos).map(id => ({
            id: id,
            ...produtosVendidos[id]
        }));
        
        produtosArray.sort((a, b) => b.quantidade - a.quantidade);
        
        // Limitar quantidade de produtos
        const produtosLimitados = produtosArray.slice(0, limite);
        
        // Criar dados para o gráfico
        const chartData = {
            labels: produtosLimitados.map(p => p.nome),
            datasets: [
                {
                    label: 'Quantidade Vendida',
                    data: produtosLimitados.map(p => p.quantidade),
                    backgroundColor: 'rgba(30, 136, 229, 0.7)',
                    borderColor: 'rgba(30, 136, 229, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Valor Total (R$)',
                    data: produtosLimitados.map(p => p.valor),
                    backgroundColor: 'rgba(67, 160, 71, 0.7)',
                    borderColor: 'rgba(67, 160, 71, 1)',
                    borderWidth: 1,
                    hidden: true // Oculto por padrão
                }
            ]
        };
        
        // Criar gráfico
        const chart = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: chartData,
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                
                                if (label === 'Valor Total (R$)') {
                                    return `${label}: R$ ${context.raw.toFixed(2)}`;
                                }
                                
                                return `${label}: ${context.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                }
            }
        });
        
        // Armazenar instância do gráfico
        this.chartInstances[canvasId] = chart;
        
        return chart;
    }

    // Gerar relatório em HTML
    gerarRelatorioHTML(dados, titulo = 'Relatório de Vendas') {
        // Obter configurações da loja
        const config = this.db.getConfig();
        
        // Formatar datas
        const dataInicio = dados.filtros?.dataInicio ? new Date(dados.filtros.dataInicio).toLocaleDateString('pt-BR') : '';
        const dataFim = dados.filtros?.dataFim ? new Date(dados.filtros.dataFim// assets/js/report-manager.js
class OrionReportManager {
    constructor() {
        this.db = window.db;
        this.chartInstances = {};
    }

    // Gerar relatório de vendas
    gerarRelatorioVendas(filtros = {}) {
        // Obter relatório do banco de dados
        const relatorio = this.db.gerarRelatorioVendas(filtros);
        
        return relatorio;
    }

    // Criar gráfico de vendas por período
    criarGraficoVendasPorPeriodo(canvasId, dados, tipo = 'dia') {
        const canvas = document.getElementById(canvasId);
        if (!canvas || !canvas.getContext) {
            console.error(`Canvas com ID ${canvasId} não encontrado`);
            return null;
        }

        // Destruir gráfico anterior se existir
        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
        }

        // Preparar dados para o gráfico
        const vendasPorPeriodo = dados.vendasPorData;
        const periodos = Object.keys(vendasPorPeriodo).sort();
        
        // Formatar labels de acordo com o tipo de período
        const labels = periodos.map(periodo => {
            const data = new Date(periodo);
            
            if (tipo === 'dia') {
                return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            } else if (tipo === 'mes') {
                return data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
            } else if (tipo === 'semana') {
                // Calcular início da semana (domingo)
                const inicio = new Date(data);
                inicio.setDate(data.getDate() - data.getDay());
                
                // Calcular fim da semana (sábado)
                const fim = new Date(inicio);
                fim.setDate(inicio.getDate() + 6);
                
                return `${inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${fim.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
            }
            
            return periodo;
        });
        
        // Criar dados para o gráfico
        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Vendas (R$)',
                    data: periodos.map(p => vendasPorPeriodo[p].total),
                    backgroundColor: 'rgba(30, 136, 229, 0.2)',
                    borderColor: 'rgba(30, 136, 229, 1)',
                    borderWidth: 1,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Quantidade',
                    data: periodos.map(p => vendasPorPeriodo[p].quantidade),
                    backgroundColor: 'rgba(67, 160, 71, 0.2)',
                    borderColor: 'rgba(67, 160, 71, 1)',
                    borderWidth: 1,
                    tension: 0.3,
                    fill: true,
                    hidden: true // Oculto por padrão
                }
            ]
        };
        
        // Criar gráfico
        const chart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                
                                if (label === 'Vendas (R$)') {
                                    return `${label}: R$ ${context.raw.toFixed(2)}`;
                                }
                                
                                return `${label}: ${context.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            callback: function(value, index, values) {
                                return `R$ ${value.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
        
        // Armazenar instância do gráfico
        this.chartInstances[canvasId] = chart;
        
        return chart;
    }

    // Criar gráfico de vendas por forma de pagamento
    criarGraficoVendasPorFormaPagamento(canvasId, dados) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || !canvas.getContext) {
            console.error(`Canvas com ID ${canvasId} não encontrado`);
            return null;
        }

        // Destruir gráfico anterior se existir
        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
        }

        // Preparar dados para o gráfico
        const vendasPorFormaPagamento = dados.vendasPorFormaPagamento;
        const formasPagamento = Object.keys(vendasPorFormaPagamento);
        
        // Cores para o gráfico
        const cores = [
            '#1E88E5', // Azul
            '#43A047', // Verde
            '#FFB300', // Amarelo
            '#E53935', // Vermelho
            '#8E24AA',  // Roxo
            '#00ACC1', // Ciano
            '#F4511E', // Laranja
            '#546E7A'  // Cinza azulado
        ];
        
        // Criar dados para o gráfico
        const chartData = {
            labels: formasPagamento,
            datasets: [{
                data: formasPagamento.map(f => vendasPorFormaPagamento[f].total),
                backgroundColor: cores.slice(0, formasPagamento.length),
                borderWidth: 0
            }]
        };
        
        // Criar gráfico
        const chart = new Chart(canvas.getContext('2d'), {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const valor = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const porcentagem = ((valor / total) * 100).toFixed(1);
                                
                                return `${context.label}: R$ ${valor.toFixed(2)} (${porcentagem}%)`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
        
        // Armazenar instância do gráfico
        this.chartInstances[canvasId] = chart;
        
        return chart;
    }

    // Criar gráfico de produtos mais vendidos
    criarGraficoProdutosMaisVendidos(canvasId, dados, limite = 10) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || !canvas.getContext) {
            console.error(`Canvas com ID ${canvasId} não encontrado`);
            return null;
        }

        // Destruir gráfico anterior se existir
        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
        }

        // Obter vendas
        const vendas = dados.vendas;
        
        // Calcular produtos mais vendidos
        const produtosVendidos = {};
        
        vendas.forEach(venda => {
            venda.itens.forEach(item => {
                if (!produtosVendidos[item.produto_id]) {
                    produtosVendidos[item.produto_id] = {
                        nome: item.produto_nome,
                        quantidade: 0,
                        valor: 0
                    };
                }
                
                produtosVendidos[item.produto_id].quantidade += item.quantidade;
                produtosVendidos[item.produto_id].valor += item.subtotal;
            });
        });
        
        // Converter para array e ordenar por quantidade
        const produtosArray = Object.keys(produtosVendidos).map(id => ({
            id: id,
            ...produtosVendidos[id]
        }));
        
        produtosArray.sort((a, b) => b.quantidade - a.quantidade);
        
        // Limitar quantidade de produtos
        const produtosLimitados = produtosArray.slice(0, limite);
        
        // Criar dados para o gráfico
        const chartData = {
            labels: produtosLimitados.map(p => p.nome),
            datasets: [
                {
                    label: 'Quantidade Vendida',
                    data: produtosLimitados.map(p => p.quantidade),
                    backgroundColor: 'rgba(30, 136, 229, 0.7)',
                    borderColor: 'rgba(30, 136, 229, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Valor Total (R$)',
                    data: produtosLimitados.map(p => p.valor),
                    backgroundColor: 'rgba(67, 160, 71, 0.7)',
                    borderColor: 'rgba(67, 160, 71, 1)',
                    borderWidth: 1,
                    hidden: true // Oculto por padrão
                }
            ]
        };
        
        // Criar gráfico
        const chart = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: chartData,
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                
                                if (label === 'Valor Total (R$)') {
                                    return `${label}: R$ ${context.raw.toFixed(2)}`;
                                }
                                
                                return `${label}: ${context.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                }
            }
        });
        
        // Armazenar instância do gráfico
        this.chartInstances[canvasId] = chart;
        
        return chart;
    }

    // Gerar relatório em HTML
    gerarRelatorioHTML(dados, titulo = 'Relatório de Vendas') {
        // Obter configurações da loja
        const config = this.db.getConfig();
        
        // Formatar datas
        const dataInicio = dados.filtros?.dataInicio ? new Date(dados.filtros.dataInicio).toLocaleDateString('pt-BR') : '';
        const dataFim = dados.filtros?.dataFim ? new Date(dados.filtros.dataFim).toLocaleDateString('pt-BR') : '';
        
        // Formatação para valores monetários
        const formatarMoeda = value => `R$ ${parseFloat(value).toFixed(2)}`;
        
        // Formatação para percentuais
        const formatarPercentual = value => `${parseFloat(value).toFixed(2)}%`;
        
        // Criar HTML do relatório
        const html = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${titulo} - ${config.nome_empresa}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f9f9f9;
                        padding: 20px;
                    }
                    
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 5px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid #eee;
                    }
                    
                    .header h1 {
                        font-size: 24px;
                        margin-bottom: 10px;
                        color: #0B3D91;
                    }
                    
                    .header p {
                        color: #777;
                    }
                    
                    .section {
                        margin-bottom: 30px;
                    }
                    
                    .section-title {
                        font-size: 18px;
                        margin-bottom: 15px;
                        color: #0B3D91;
                        border-bottom: 1px solid #eee;
                        padding-bottom: 5px;
                    }
                    
                    .cards {
                        display: flex;
                        justify-content: space-between;
                        flex-wrap: wrap;
                        gap: 15px;
                        margin-bottom: 20px;
                    }
                    
                    .card {
                        flex: 1;
                        min-width: 200px;
                        padding: 15px;
                        background-color: #f5f5f5;
                        border-radius: 5px;
                        box-shadow: 0 0 5px rgba(0, 0, 0, 0.05);
                        text-align: center;
                    }
                    
                    .card-title {
                        font-size: 14px;
                        color: #777;
                        margin-bottom: 5px;
                    }
                    
                    .card-value {
                        font-size: 20px;
                        font-weight: bold;
                        color: #0B3D91;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    
                    table th, table td {
                        padding: 10px;
                        text-align: left;
                        border-bottom: 1px solid #eee;
                    }
                    
                    table th {
                        background-color: #f5f5f5;
                        font-weight: bold;
                    }
                    
                    table tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    
                    .text-right {
                        text-align: right;
                    }
                    
                    .text-center {
                        text-align: center;
                    }
                    
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #eee;
                        color: #777;
                        font-size: 12px;
                    }
                    
                    .print-button {
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #0B3D91;
                        color: #fff;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                        margin-bottom: 20px;
                    }
                    
                    .print-button:hover {
                        background-color: #1E88E5;
                    }
                    
                    @media print {
                        body {
                            background-color: #fff;
                            padding: 0;
                        }
                        
                        .container {
                            box-shadow: none;
                            padding: 0;
                        }
                        
                        .print-button {
                            display: none;
                        }
                        
                        @page {
                            margin: 1cm;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>${titulo} - ${config.nome_empresa}</h1>
                        <p>Período: ${dataInicio ? `${dataInicio} a ${dataFim}` : 'Todos os períodos'}</p>
                        <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
                    </div>
                    
                    <button class="print-button" onclick="window.print()">Imprimir Relatório</button>
                    
                    <div class="section">
                        <h2 class="section-title">Métricas Gerais</h2>
                        <div class="cards">
                            <div class="card">
                                <div class="card-title">Total de Vendas</div>
                                <div class="card-value">${dados.totalVendas}</div>
                            </div>
                            <div class="card">
                                <div class="card-title">Faturamento Total</div>
                                <div class="card-value">${formatarMoeda(dados.valorTotal)}</div>
                            </div>
                            <div class="card">
                                <div class="card-title">Ticket Médio</div>
                                <div class="card-value">${formatarMoeda(dados.ticketMedio)}</div>
                            </div>
                            <div class="card">
                                <div class="card-title">Total de Descontos</div>
                                <div class="card-value">${formatarMoeda(dados.totalDescontos || 0)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2 class="section-title">Vendas por Forma de Pagamento</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Forma de Pagamento</th>
                                    <th class="text-right">Quantidade</th>
                                    <th class="text-right">Valor Total</th>
                                    <th class="text-right">Percentual</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(dados.vendasPorFormaPagamento).map(([forma, dadosForma]) => `
                                    <tr>
                                        <td>${forma}</td>
                                        <td class="text-right">${dadosForma.quantidade}</td>
                                        <td class="text-right">${formatarMoeda(dadosForma.total)}</td>
                                        <td class="text-right">${formatarPercentual((dadosForma.total / dados.valorTotal) * 100)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th>Total</th>
                                    <th class="text-right">${dados.totalVendas}</th>
                                    <th class="text-right">${formatarMoeda(dados.valorTotal)}</th>
                                    <th class="text-right">100.00%</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    
                    <div class="section">
                        <h2 class="section-title">Vendas por Período</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th class="text-right">Quantidade</th>
                                    <th class="text-right">Valor Total</th>
                                    <th class="text-right">Percentual</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(dados.vendasPorData)
                                    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                                    .map(([data, dadosData]) => `
                                        <tr>
                                            <td>${new Date(data).toLocaleDateString('pt-BR')}</td>
                                            <td class="text-right">${dadosData.quantidade}</td>
                                            <td class="text-right">${formatarMoeda(dadosData.total)}</td>
                                            <td class="text-right">${formatarPercentual((dadosData.total / dados.valorTotal) * 100)}</td>
                                        </tr>
                                    `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="section">
                        <h2 class="section-title">Lista de Vendas</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Data</th>
                                    <th>Cliente</th>
                                    <th>Forma de Pagamento</th>
                                    <th class="text-right">Subtotal</th>
                                    <th class="text-right">Desconto</th>
                                    <th class="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${dados.vendas
                                    .sort((a, b) => new Date(b.data) - new Date(a.data))
                                    .map(venda => `
                                        <tr>
                                            <td>${venda.id}</td>
                                            <td>${new Date(venda.data).toLocaleString('pt-BR')}</td>
                                            <td>${venda.cliente_nome}</td>
                                            <td>${venda.forma_pagamento}</td>
                                            <td class="text-right">${formatarMoeda(venda.subtotal)}</td>
                                            <td class="text-right">${formatarMoeda(venda.desconto || 0)}</td>
                                            <td class="text-right">${formatarMoeda(venda.total)}</td>
                                        </tr>
                                    `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="footer">
                        <p>${config.nome_empresa} - ${config.endereco}, ${config.cidade}</p>
                        <p>CNPJ: ${config.cnpj} - Tel: ${config.telefone}</p>
                        <p>© ${new Date().getFullYear()} - Todos os direitos reservados</p>
                    </div>
                </div>
                
                <script>
                    // Auto-imprimir quando aberto em nova janela
                    window.onload = function() {
                        if (window.opener) {
                            setTimeout(function() {
                                window.print();
                            }, 1000);
                        }
                    };
                </script>
            </body>
            </html>
        `;
        
        return html;
    }
    
    // Exportar relatório para CSV
    exportarRelatorioVendas(dados, nomeArquivo = 'relatorio_vendas.csv') {
        // Transformar dados para formato CSV
        const vendas = dados.vendas.map(venda => ({
            'ID': venda.id,
            'Data': new Date(venda.data).toLocaleString('pt-BR'),
            'Cliente': venda.cliente_nome,
            'Forma de Pagamento': venda.forma_pagamento,
            'Subtotal (R$)': venda.subtotal.toFixed(2),
            'Desconto (R$)': (venda.desconto || 0).toFixed(2),
            'Total (R$)': venda.total.toFixed(2),
            'Itens': venda.itens.length,
            'Usuário': venda.usuario
        }));
        
        // Exportar para CSV
        return this.db.exportarCSV(vendas, nomeArquivo);
    }
    
    // Abrir relatório em nova janela
    abrirRelatorioHTML(dados, titulo = 'Relatório de Vendas') {
        const html = this.gerarRelatorioHTML(dados, titulo);
        
        // Abrir nova janela
        const janela = window.open('', '_blank');
        
        // Escrever HTML na nova janela
        janela.document.write(html);
        janela.document.close();
        
        return janela;
    }
}
