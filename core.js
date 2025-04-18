// assets/js/core.js
/**
 * ORION PDV - Funções utilitárias compartilhadas
 * Versão: 1.0.0
 * Data: 18/04/2025
 */

const OrionCore = (function() {
  // Cache de elementos DOM frequentemente acessados
  const DOM = {};
  
  // Formatar valores monetários
  function formatarMoeda(valor) {
    return 'R$ ' + parseFloat(valor).toFixed(2).replace('.', ',');
  }
  
  // Formatar data para o padrão brasileiro
  function formatarData(data) {
    if (!data) return '';
    
    if (typeof data === 'string') {
      // Converter string para objeto Date
      data = new Date(data);
    }
    
    return data.toLocaleDateString('pt-BR');
  }
  
  // Formatar data e hora para o padrão brasileiro
  function formatarDataHora(data) {
    if (!data) return '';
    
    if (typeof data === 'string') {
      // Converter string para objeto Date
      data = new Date(data);
    }
    
    return data.toLocaleDateString('pt-BR') + ' ' + 
           data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  
  // Validar CPF
  function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validar dígitos verificadores
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  }
  
  // Validar CNPJ
  function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    if (cnpj.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Calcular o primeiro dígito verificador
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    // Calcular o segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    
    return true;
  }
  
  // Gerar ID único
  function gerarId(prefixo = '') {
    return prefixo + Math.random().toString(36).substring(2, 9);
  }
  
  // Converter objeto para CSV
  function objetoParaCSV(dados) {
    if (!dados || !dados.length) return null;
    
    // Obter cabeçalho com base na primeira linha
    const cabecalhos = Object.keys(dados[0]);
    
    // Criar conteúdo CSV
    let csv = cabecalhos.join(',') + '\n';
    
    // Adicionar linhas
    for (const linha of dados) {
      const valores = cabecalhos.map(header => {
        const valor = linha[header];
        // Tratar valores com vírgulas
        if (typeof valor === 'string' && valor.includes(',')) {
          return `"${valor.replace(/"/g, '""')}"`;
        }
        return valor === null || valor === undefined ? '' : valor;
      });
      csv += valores.join(',') + '\n';
    }
    
    return csv;
  }
  
  // Exibir mensagem toast
  function exibirToast(mensagem, tipo = 'info', duracao = 3000) {
    // Tipos: success, warning, error, info
    
    // Criar elemento toast
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${tipo}`;
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : 
                            tipo === 'warning' ? 'exclamation-circle' : 
                            tipo === 'error' ? 'times-circle' : 
                            'info-circle'}"></i>
        <span>${mensagem}</span>
      </div>
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(toast);
    
    // Exibir com animação
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Remover após a duração especificada
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, duracao);
  }
  
  // Calcular tamanho em bytes formatado
  function formatarTamanho(bytes) {
    if (bytes < 1024) {
      return bytes + ' bytes';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
  }
  
  // Formatar número para CEP
  function formatarCEP(cep) {
    cep = cep.replace(/\D/g, '');
    if (cep.length <= 8) {
      cep = cep.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return cep;
  }
  
  // Formatar número para telefone
  function formatarTelefone(telefone) {
    telefone = telefone.replace(/\D/g, '');
    if (telefone.length <= 10) {
      // Telefone fixo
      telefone = telefone.replace(/(\d{2})(\d)/, '($1) $2');
      telefone = telefone.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      // Celular
      telefone = telefone.replace(/(\d{2})(\d)/, '($1) $2');
      telefone = telefone.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return telefone;
  }
  
  // Formatar número para CPF ou CNPJ
  function formatarDocumento(documento) {
    documento = documento.replace(/\D/g, '');
    
    if (documento.length <= 11) {
      // CPF
      documento = documento.replace(/(\d{3})(\d)/, '$1.$2');
      documento = documento.replace(/(\d{3})(\d)/, '$1.$2');
      documento = documento.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ
      documento = documento.replace(/^(\d{2})(\d)/, '$1.$2');
      documento = documento.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      documento = documento.replace(/\.(\d{3})(\d)/, '.$1/$2');
      documento = documento.replace(/(\d{4})(\d)/, '$1-$2');
    }
    
    return documento;
  }
  
  // Exportar funções
  return {
    formatarMoeda,
    formatarData,
    formatarDataHora,
    validarCPF,
    validarCNPJ,
    gerarId,
    objetoParaCSV,
    exibirToast,
    formatarTamanho,
    formatarCEP,
    formatarTelefone,
    formatarDocumento,
    DOM
  };
})();
