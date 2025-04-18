// assets/js/barcode-integration.js
/**
 * Script para integrar o OrionBarcodeScanner com a página de estoque
 * Este arquivo deve ser incluído após barcode-scanner.js e estoque.js
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM - Scanner
    const scannerVideo = document.getElementById('scanner-video');
    const btnEscanear = document.getElementById('btn-escanear');
    const btnCancelarScan = document.getElementById('btn-cancelar-scan');
    const cameraContainer = document.getElementById('camera-container');
    const codigoBarrasInput = document.getElementById('codigo-barras');
    
    // Verificar se os elementos existem (para evitar erros)
    if (!scannerVideo || !btnEscanear || !btnCancelarScan || !cameraContainer || !codigoBarrasInput) {
        console.warn('Elementos DOM do scanner não encontrados. Integração do scanner de código de barras não será ativada.');
        return;
    }
    
    // Criar instância do scanner
    const barcodeScanner = new OrionBarcodeScanner({
        videoElement: scannerVideo,
        onDetected: function(result) {
            // Preencher input com o código lido
            codigoBarrasInput.value = result.code;
            
            // Buscar produto pelo código
            window.buscarPorCodigoBarras();
            
            // Parar scanner
            barcodeScanner.stop();
            cameraContainer.style.display = 'none';
        },
        onError: function(error) {
            console.error('Erro no scanner:', error);
            alert('Erro ao acessar a câmera: ' + error);
            cameraContainer.style.display = 'none';
        }
    });
    
    // Sobrescrever função iniciarScanner do estoque.js
    if (typeof window.iniciarScanner === 'function') {
        window.iniciarScanner = function() {
            // Exibir container da câmera
            cameraContainer.style.display = 'block';
            
            // Iniciar scanner
            barcodeScanner.start();
        };
        
        // Adicionar event listener (caso tenha sido removido)
        btnEscanear.addEventListener('click', window.iniciarScanner);
    }
    
    // Sobrescrever função pararScanner do estoque.js
    if (typeof window.pararScanner === 'function') {
        window.pararScanner = function() {
            // Parar scanner
            barcodeScanner.stop();
            cameraContainer.style.display = 'none';
        };
        
        // Adicionar event listener (caso tenha sido removido)
        btnCancelarScan.addEventListener('click', window.pararScanner);
    }
    
    // Criar método global para gerar código de barras válido
    window.gerarCodigoBarrasEAN13 = function(prefixo = '789') {
        return OrionBarcodeScanner.gerarCodigoEAN13(prefixo);
    };
    
    // Criar método global para validar código de barras
    window.validarCodigoEAN = function(codigo) {
        return OrionBarcodeScanner.validarCodigoEAN(codigo);
    };
    
    console.log('Integração do scanner de código de barras concluída.');
});
