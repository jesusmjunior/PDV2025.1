// auth.js - Integração por Lógica Fuzzy α → θ
// Bloco de Autenticação Segura
// Score: α=0.9 | γ=1.0 | F(x-externa): database.js

class OrionAuth {
    constructor() {
        // T(a): Setup de sessão
        this.SESSION_KEY = 'orion_session';
        this.SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 horas em ms
    }

    // T(a): Login com validação e persistência
    login(username, password) {
        if (!username || !password) {
            return {
                sucesso: false,
                mensagem: 'Usuário e senha são obrigatórios'
            };
        }

        // R(r): Banco de dados
        const db = window.db;
        const usuario = db.getUsuario(username);

        if (!usuario) {
            return {
                sucesso: false,
                mensagem: 'Usuário não encontrado'
            };
        }

        // R(r): Hash seguro da senha
        const senhaHash = db.hashPassword(password);

        if (senhaHash !== usuario.senha_hash) {
            return {
                sucesso: false,
                mensagem: 'Senha incorreta'
            };
        }

        // T(a): Criação da sessão
        const session = {
            username: usuario.username,
            nome: usuario.nome,
            perfil: usuario.perfil,
            ultimo_acesso: new Date().toISOString(),
            expira_em: new Date(Date.now() + this.SESSION_DURATION).toISOString()
        };

        // Armazenar sessão local
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

        return {
            sucesso: true,
            mensagem: 'Login realizado com sucesso',
            session
        };
    }

    // T(a): Validação de sessão ativa
    isSessionValid() {
        const sessionStr = localStorage.getItem(this.SESSION_KEY);
        if (!sessionStr) return false;

        const session = JSON.parse(sessionStr);
        return new Date(session.expira_em) > new Date();
    }

    // T(a): Encerrar sessão
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
    }
}
