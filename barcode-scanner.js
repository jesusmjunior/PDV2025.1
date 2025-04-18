// assets/js/barcode-scanner.js
class OrionBarcodeScanner {
  constructor(videoElementId, onDetectedCallback) {
    this.videoElement = document.getElementById(videoElementId);
    this.onDetectedCallback = onDetectedCallback;
    this.isScanning = false;
    this.lastResult = null;
    this.lastTime = 0;
  }
  
  start() {
    if (this.isScanning) {
      return;
    }
    
    try {
      // Inicializar Quagga
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: this.videoElement,
          constraints: {
            width: 480,
            height: 320,
            facingMode: "environment" // Usar câmera traseira em dispositivos móveis
          },
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: 4,
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader",
            "i2of5_reader"
          ],
          debug: {
            showCanvas: true,
            showPatches: true,
            showFoundPatches: true,
            showSkeleton: true,
            showLabels: true,
            showPatchLabels: true,
            showRemainingPatchLabels: true,
            boxFromPatches: {
              showTransformed: true,
              showTransformedBox: true,
              showBB: true
            }
          }
        },
      }, (err) => {
        if (err) {
          console.error("Erro ao inicializar o scanner:", err);
          return;
        }
        
        this.isScanning = true;
        console.log("Scanner de código de barras inicializado!");
        
        // Iniciar Quagga
        Quagga.start();
        
        // Configurar detector de código
        Quagga.onDetected(this.onDetect.bind(this));
      });
    } catch (error) {
      console.error("Erro ao iniciar o scanner:", error);
    }
  }
  
  stop() {
    if (this.isScanning) {
      Quagga.stop();
      this.isScanning = false;
      console.log("Scanner de código de barras parado");
    }
  }
  
  onDetect(result) {
    const code = result.codeResult.code;
    const now = new Date().getTime();
    
    // Evitar detecções duplicadas (mínimo 2 segundos entre leituras do mesmo código)
    if (code !== this.lastResult || now - this.lastTime > 2000) {
      this.lastResult = code;
      this.lastTime = now;
      
      console.log("Código detectado:", code);
      
      // Desenhar caixa em volta do código
      if (result.box) {
        const canvas = Quagga.canvas.ctx.overlay;
        const drawingCanvas = Quagga.canvas.dom.overlay;
        
        if (canvas && drawingCanvas) {
          canvas.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
          canvas.strokeStyle = '#00F';
          canvas.lineWidth = 2;
          canvas.strokeRect(
            result.box.x,
            result.box.y,
            result.box.width,
            result.box.height
          );
        }
      }
      
      // Executar callback com o código detectado
      if (typeof this.onDetectedCallback === 'function') {
        this.onDetectedCallback(code);
      }
    }
  }
}

// Verificar se Quagga está disponível
if (typeof Quagga === 'undefined') {
  console.warn("Biblioteca QuaggaJS não encontrada. O scanner de código de barras não funcionará.");
}
