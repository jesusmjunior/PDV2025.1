// barcode-scanner.js - Engine Scanner Orion
// Fuzzy α = 0.9 | γ = 1.0 | θ = 0.95 | R(r): QuaggaJS

class OrionBarcodeScanner {
    constructor(options = {}) {
        // α: Definir opções padrão com sobreposição
        this.options = Object.assign({
            videoElement: null,
            canvasElement: null,
            onDetected: null,
            onError: null,
            onStarted: null,
            onStopped: null,
            scanRate: 100,
            scannerActive: false,
            readers: [
                'code_128_reader',
                'ean_reader',
                'ean_8_reader',
                'code_39_reader',
                'code_39_vin_reader',
                'codabar_reader',
                'upc_reader',
                'upc_e_reader',
                'i2of5_reader'
            ],
            debug: false
        }, options);

        this.scanner = null;
        this.lastResult = null;
        this.scanning = false;
    }

    // γ: Verificação e validação do ambiente
    init(videoElement = null) {
        if (videoElement) {
            this.options.videoElement = videoElement;
        }

        if (!this.options.videoElement) {
            this._error('Elemento de vídeo não especificado');
            return false;
        }

        // R(r): Biblioteca Quagga
        if (typeof Quagga === 'undefined') {
            this._error('Biblioteca Quagga não encontrada. Certifique-se de incluir a biblioteca.');
            return false;
        }

        return true;
    }

    // θ: Inicialização do scanner com QuaggaJS
    start() {
        if (!this.init()) return;

        const self = this;

        Quagga.init({
            inputStream: {
                type: 'LiveStream',
                target: self.options.videoElement,
                constraints: {
                    facingMode: 'environment'
                }
            },
            decoder: {
                readers: self.options.readers
            },
            locate: true,
            numOfWorkers: 2,
            frequency: self.options.scanRate,
            debug: self.options.debug
        }, function (err) {
            if (err) {
                self._error('Erro ao iniciar o scanner: ' + err.message);
                return;
            }

            Quagga.start();
            self.scanning = true;

            if (typeof self.options.onStarted === 'function') {
                self.options.onStarted();
            }

            Quagga.onDetected((result) => {
                const code = result.codeResult.code;

                if (code !== self.lastResult) {
                    self.lastResult = code;

                    if (typeof self.options.onDetected === 'function') {
                        self.options.onDetected({ code });
                    }
                }
            });
        });
    }

    // β: Encerramento da leitura
    stop() {
        if (this.scanning && typeof Quagga !== 'undefined') {
            Quagga.stop();
            this.scanning = false;

            if (typeof this.options.onStopped === 'function') {
                this.options.onStopped();
            }
        }
    }

    // γ: Erro controlado
    _error(msg) {
        console.error('[OrionScanner]', msg);
        if (typeof this.options.onError === 'function') {
            this.options.onError(msg);
        }
    }
}
