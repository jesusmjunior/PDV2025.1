// Arquivo: js/auth.js
class Auth {
    constructor() {
        this.usuarioAtual = null;
        this.verificarAutenticacao();
    }
    
    verificarAutenticacao() {
        const usuarioSalvo = sessionStorage.getItem('usuario_atual');
        if (usuarioSalvo) {
            this.usuarioAtual = JSON.parse(usuarioSalvo);
        }
        return this.usuarioAtual !== null;
    }
    
    gerarHash(texto) {
        // Usando SHA-256 para hash de senha
        return CryptoJS.SHA256(texto).toString();
    }
    
    login(usuario, senha) {
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '{}');
        
        if (usuarios[usuario]) {
            const senhaHash = this.gerarHash(senha);
            if (senhaHash === usuarios[usuario].senha_hash) {
                this.usuarioAtual = {
                    usuario: usuario,
                    nome: usuarios[usuario].nome
                };
                sessionStorage.setItem('usuario_atual', JSON.stringify(this.usuarioAtual));
                return { sucesso: true, mensagem: 'Login realizado com sucesso' };
            } else {
                return { sucesso: false, mensagem: 'Senha incorreta' };
            }
        } else {
            return { sucesso: false, mensagem: 'Usuário não encontrado' };
        }
    }
    
    logout() {
        this.usuarioAtual = null;
        sessionStorage.removeItem('usuario_atual');
        window.location.href = 'login.html';
    }
    
    obterUsuarioAtual() {
        return this.usuarioAtual;
    }
}

// Instância global de autenticação
const auth = new Auth();

// Redirecionar para login se não estiver autenticado (exceto na página de login)
if (!auth.verificarAutenticacao() && !window.location.href.includes('login.html')) {
    window.location.href = 'login.html';
}
