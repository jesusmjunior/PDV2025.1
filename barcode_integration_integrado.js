// barcode-integration.js - Integração Scanner
// Score fuzzy: α = 0.9 | β = 0.7 | γ = 1.0 | F(x-externa): OrionBarcodeScanner

document.addEventListener('DOMContentLoaded', function () {
    // T(a): Mapeamento de elementos DOM
    const scannerVideo = document.getElementById('scanner-video');
    const btnEscanear = document.getElementById('btn-escanear');
    const btnCancelarScan = document.getElementById('btn-cancelar-scan');
    const cameraContainer = document.getElementById('camera-container');
    const codigoBarrasInput = document.getElementById('codigo-barras');

    // γ: Validação de existência dos elementos antes da execução
    if (!scannerVideo || !btnEscanear || !btnCancelarScan || !cameraContainer || !codigoBarrasInput) {
        console.warn('Elementos DOM do scanner não encontrados. Integração do scanner de código de barras não será ativada.');
        return;
    }

    // β: Instanciação do scanner com handlers
    const barcodeScanner = new OrionBarcodeScanner({
        videoElement: scannerVideo,

        // T(a): Callback de leitura bem-sucedida
        onDetected: function (result) {
            codigoBarrasInput.value = result.code;

            // R(r): Requisição externa à função global
            if (typeof window.buscarPorCodigoBarras === 'function') {
                window.buscarPorCodigoBarras();
            }

            // Parar scanner
            barcodeScanner.stop();
            cameraContainer.style.display = 'none';
        },

        // T(a): Callback de erro
        onError: function (error) {
            console.error('Erro no scanner de código de barras:', error);
        }
    });

    // T(a): Acionamento manual do scanner
    btnEscanear.addEventListener('click', () => {
        cameraContainer.style.display = 'block';
        barcodeScanner.start();
    });

    // T(a): Cancelar leitura
    btnCancelarScan.addEventListener('click', () => {
        barcodeScanner.stop();
        cameraContainer.style.display = 'none';
    });
});
