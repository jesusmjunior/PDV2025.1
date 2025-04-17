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
        const hoje =
