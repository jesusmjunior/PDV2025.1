// assets/js/barcode-scanner.js
class OrionBarcodeScanner {
    constructor(options = {}) {
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

    // Inicializar scanner
    init(videoElement = null) {
        if (videoElement) {
            this.options.videoElement = videoElement;
        }

        if (!this.options.videoElement) {
            this._error('Elemento de vídeo não especificado');
            return false;
        }

        // Verificar suporte a Quagga
        if (typeof Quagga === 'undefined') {
            this._error('Biblioteca Quagga não encontrada. Certifique-se de incluir a biblioteca.');
            return false;
        }
        
        return true;
    }

    // Iniciar scanner
    start() {
        if (!this.init()) return;

        // Configurar Quagga
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: this.options.videoElement,
                constraints: {
                    width: { min: 640 },
                    height: { min: 480 },
                    facingMode: "environment"
                },
            },
            locator: {
                patchSize: "medium",
                halfSample: true
            },
            numOfWorkers: 4,
            frequency: this.options.scanRate,
            decoder: {
                readers: this.options.readers
            },
            debug: this.options.debug
        }, (err) => {
            if (err) {
                this._error(`Erro ao inicializar scanner: ${err}`);
                return;
            }
            
            console.log('Scanner de código de barras inicializado com sucesso');
            
            this.scanning = true;
            this.options.scannerActive = true;
            
            // Iniciar scanner
            Quagga.start();
            
            // Configurar callback de detecção
            Quagga.onDetected((result) => {
                if (result && result.codeResult) {
                    const code = result.codeResult.code;
                    const format = result.codeResult.format;
                    
                    // Evitar detecções repetidas
                    if (this.lastResult !== code) {
                        this.lastResult = code;
                        
                        // Chamar callback
                        if (typeof this.options.onDetected === 'function') {
                            this.options.onDetected({
                                code: code,
                                format: format,
                                raw: result
                            });
                        }
                    }
                }
            });
            
            // Chamar callback de inicialização
            if (typeof this.options.onStarted === 'function') {
                this.options.onStarted();
            }
        });
    }

    // Parar scanner
    stop() {
        if (this.scanning && typeof Quagga !== 'undefined') {
            Quagga.stop();
            this.scanning = false;
            this.options.scannerActive = false;
            this.lastResult = null;
            
            // Chamar callback de parada
            if (typeof this.options.onStopped === 'function') {
                this.options.onStopped();
            }
            
            console.log('Scanner de código de barras parado');
        }
    }

    // Alternar estado do scanner
    toggle() {
        if (this.scanning) {
            this.stop();
        } else {
            this.start();
        }
        
        return this.scanning;
    }

    // Verificar se está escaneando
    isScanning() {
        return this.scanning;
    }

    // Modificar opções
    setOptions(options) {
        this.options = Object.assign(this.options, options);
        return this.options;
    }

    // Tratamento de erros
    _error(message) {
        console.error(`[OrionBarcodeScanner] ${message}`);
        
        if (typeof this.options.onError === 'function') {
            this.options.onError(message);
        }
    }

    // Função estática para validar códigos de barras
    static validarCodigoEAN(codigo) {
        // Validar código EAN/UPC
        if (!/^\d+$/.test(codigo)) {
            return false;
        }
        
        // Códigos EAN têm 8, 13 ou 14 dígitos
        if (![8, 13, 14].includes(codigo.length)) {
            return false;
        }
        
        // Calcular dígito verificador
        let soma = 0;
        let fator = (codigo.length === 8) ? 3 : 1;
        
        for (let i = 0; i < codigo.length - 1; i++) {
            soma += parseInt(codigo.charAt(i)) * fator;
            fator = 4 - fator;
        }
        
        const digitoVerificador = (10 - (soma % 10)) % 10;
        const ultimoDigito = parseInt(codigo.charAt(codigo.length - 1));
        
        return digitoVerificador === ultimoDigito;
    }

    // Gerar código EAN-13 válido
    static gerarCodigoEAN13(prefixo = '789') {
        // Garantir que o prefixo tenha o tamanho correto
        prefixo = (prefixo + '').padEnd(3, '0').substring(0, 3);
        
        // Garantir que o prefixo contenha apenas números
        if (!/^\d+$/.test(prefixo)) {
            prefixo = '789'; // Prefixo padrão para Brasil
        }
        
        // Gerar 9 dígitos aleatórios
        let codigo = prefixo;
        for (let i = 0; i < 9; i++) {
            codigo += Math.floor(Math.random() * 10);
        }
        
        // Calcular dígito verificador
        let soma = 0;
        for (let i = 0; i < 12; i++) {
            soma += parseInt(codigo.charAt(i)) * (i % 2 === 0 ? 1 : 3);
        }
        
        const digitoVerificador = (10 - (soma % 10)) % 10;
        
        // Adicionar dígito verificador
        return codigo + digitoVerificador;
    }
}

// Exportar globalmente se necessário
if (typeof window !== 'undefined') {
    window.OrionBarcodeScanner = OrionBarcodeScanner;
}
