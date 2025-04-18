// assets/js/auth.js
class OrionAuth {
    constructor() {
        this.usuarioAtual = null;
        this.verificarAutenticacao();
    }
    
    verificarAutenticacao() {
        // Verificar se existe um usuário na sessão
        const usuarioSalvo = sessionStorage.getItem('orion_usuario_atual');
        if (usuarioSalvo) {
            try {
                this.usuarioAtual = JSON.parse(usuarioSalvo);
                // Verificar validade da sessão (8 horas)
                const agora = new Date().getTime();
                const ultimoLogin = new Date(this.usuarioAtual.timestamp).getTime();
                const horasAtivas = (agora - ultimoLogin) / (1000 * 60 * 60);
                
                if (horasAtivas > 8) {
                    console.log('Sessão expirada');
                    this.fazerLogout();
                    return false;
                }
                
                return true;
            } catch (e) {
                console.error('Erro ao recuperar sessão:', e);
                this.fazerLogout();
                return false;
            }
        }
        return false;
    }
    
    fazerLogin(usuario, senha) {
        const usuarios = db.getUsuarios();
        
        if (usuarios[usuario]) {
            const usuarioObj = usuarios[usuario];
            const senhaHash = db.hashPassword(senha);
            
            if (senhaHash === usuarioObj.senha_hash) {
                // Criar objeto de sessão
                const dadosSessao = {
                    username: usuario,
                    nome: usuarioObj.nome,
                    perfil: usuarioObj.perfil,
                    timestamp: new Date().toISOString()
                };
                
                // Salvar na sessão
                this.usuarioAtual = dadosSessao;
                sessionStorage.setItem('orion_usuario_atual', JSON.stringify(dadosSessao));
                
                // Atualizar último acesso no banco
                usuarioObj.ultimo_acesso = new Date().toISOString();
                db.adicionarUsuario(usuarioObj);
                
                return {
                    sucesso: true,
                    mensagem: 'Login realizado com sucesso!',
                    dados: dadosSessao
                };
            } else {
                return {
                    sucesso: false,
                    mensagem: 'Senha incorreta!'
                };
            }
        } else {
            return {
                sucesso: false,
                mensagem: 'Usuário não encontrado!'
            };
        }
    }
    
    fazerLogout() {
        this.usuarioAtual = null;
        sessionStorage.removeItem('orion_usuario_atual');
        return {
            sucesso: true,
            mensagem: 'Logout realizado com sucesso!'
        };
    }
    
    getUsuarioAtual() {
        return this.usuarioAtual;
    }
    
    verificarPermissao(permissao) {
        if (!this.usuarioAtual) return false;
        
        const perfil = this.usuarioAtual.perfil;
        
        // Verificações de permissão básicas
        switch (permissao) {
            case 'admin':
                return perfil === 'admin';
            case 'venda':
                return perfil === 'admin' || perfil === 'vendedor';
            case 'relatorio':
                return perfil === 'admin' || perfil === 'gerente';
            case 'estoque':
                return perfil === 'admin' || perfil === 'gerente' || perfil === 'estoquista';
            default:
                return false;
        }
    }
    
    alterarSenha(senhaAtual, novaSenha) {
        if (!this.usuarioAtual) {
            return {
                sucesso: false,
                mensagem: 'Usuário não autenticado!'
            };
        }
        
        const username = this.usuarioAtual.username;
        const usuarios = db.getUsuarios();
        
        if (usuarios[username]) {
            const senhaAtualHash = db.hashPassword(senhaAtual);
            
            if (senhaAtualHash === usuarios[username].senha_hash) {
                // Atualizar senha
                usuarios[username].senha_hash = db.hashPassword(novaSenha);
                localStorage.setItem('orion_usuarios', JSON.stringify(usuarios));
                
                return {
                    sucesso: true,
                    mensagem: 'Senha alterada com sucesso!'
                };
            } else {
                return {
                    sucesso: false,
                    mensagem: 'Senha atual incorreta!'
                };
            }
        } else {
            return {
                sucesso: false,
                mensagem: 'Usuário não encontrado!'
            };
        }
    }
}

// Inicialização global
const auth = new OrionAuth();

// Redirecionar para login se não estiver autenticado
document.addEventListener('DOMContentLoaded', function() {
    const isLoginPage = window.location.href.includes('login.html');
    
    if (!auth.verificarAutenticacao() && !isLoginPage) {
        window.location.href = 'login.html';
    } else if (auth.verificarAutenticacao() && isLoginPage) {
        window.location.href = 'dashboard.html';
    }
});
