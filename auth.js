// assets/js/auth.js - Atualizado para usar IndexedDB
class OrionAuth {
  constructor() {
    this.usuarioAtual = null;
    this.dbName = 'orionAuthDB';
    this.dbVersion = 1;
    this.storeName = 'usuarios';
    this.initDatabase();
    this.verificarAutenticacao();
  }

  initDatabase() {
    const request = indexedDB.open(this.dbName, this.dbVersion);
    
    request.onerror = (event) => {
      console.error('Erro ao abrir banco de dados:', event.target.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        const store = db.createObjectStore(this.storeName, { keyPath: 'email' });
        store.createIndex('email', 'email', { unique: true });
      }
    };
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
      } catch (error) {
        console.error('Erro ao processar dados do usuário:', error);
        this.fazerLogout();
        return false;
      }
    }
    return false;
  }

  fazerLogin(email, senha) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      
      request.onerror = (event) => {
        reject('Erro ao acessar o banco de dados: ' + event.target.error);
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const getRequest = store.get(email);
        
        getRequest.onsuccess = (event) => {
          const usuario = event.target.result;
          if (usuario && usuario.senha === this.hashSenha(senha)) {
            // Atualizar timestamp de login
            usuario.timestamp = new Date().toISOString();
            this.usuarioAtual = usuario;
            
            // Salvar na sessão
            sessionStorage.setItem('orion_usuario_atual', JSON.stringify(usuario));
            
            // Atualizar último login no IndexedDB
            const updateTransaction = db.transaction([this.storeName], 'readwrite');
            const updateStore = updateTransaction.objectStore(this.storeName);
            updateStore.put(usuario);
            
            resolve(usuario);
          } else {
            reject('Credenciais inválidas');
          }
        };
        
        getRequest.onerror = (event) => {
          reject('Erro ao buscar usuário: ' + event.target.error);
        };
      };
    });
  }

  cadastrarUsuario(usuario) {
    return new Promise((resolve, reject) => {
      if (!usuario.email || !usuario.senha || !usuario.nome) {
        reject('Dados incompletos');
        return;
      }
      
      // Hash da senha antes de armazenar
      usuario.senha = this.hashSenha(usuario.senha);
      usuario.timestamp = new Date().toISOString();
      
      const request = indexedDB.open(this.dbName);
      
      request.onerror = (event) => {
        reject('Erro ao acessar o banco de dados: ' + event.target.error);
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const getRequest = store.get(usuario.email);
        getRequest.onsuccess = (event) => {
          if (event.target.result) {
            reject('Usuário já existe');
            return;
          }
          
          const addRequest = store.add(usuario);
          
          addRequest.onsuccess = () => {
            resolve(usuario);
          };
          
          addRequest.onerror = (event) => {
            reject('Erro ao cadastrar usuário: ' + event.target.error);
          };
        };
      };
    });
  }

  fazerLogout() {
    this.usuarioAtual = null;
    sessionStorage.removeItem('orion_usuario_atual');
  }

  getUsuarioAtual() {
    return this.usuarioAtual;
  }

  atualizarUsuario(dadosAtualizados) {
    return new Promise((resolve, reject) => {
      if (!this.usuarioAtual) {
        reject('Nenhum usuário logado');
        return;
      }
      
      const request = indexedDB.open(this.dbName);
      
      request.onerror = (event) => {
        reject('Erro ao acessar o banco de dados: ' + event.target.error);
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const getRequest = store.get(this.usuarioAtual.email);
        
        getRequest.onsuccess = (event) => {
          const usuario = event.target.result;
          if (!usuario) {
            reject('Usuário não encontrado');
            return;
          }
          
          // Atualizar dados do usuário
          const usuarioAtualizado = {...usuario, ...dadosAtualizados};
          
          // Se a senha foi alterada, aplicar hash
          if (dadosAtualizados.senha) {
            usuarioAtualizado.senha = this.hashSenha(dadosAtualizados.senha);
          }
          
          const updateRequest = store.put(usuarioAtualizado);
          
          updateRequest.onsuccess = () => {
            // Atualizar usuário atual e sessão
            this.usuarioAtual = usuarioAtualizado;
            sessionStorage.setItem('orion_usuario_atual', JSON.stringify(usuarioAtualizado));
            resolve(usuarioAtualizado);
          };
          
          updateRequest.onerror = (event) => {
            reject('Erro ao atualizar usuário: ' + event.target.error);
          };
        };
      };
    });
  }

  hashSenha(senha) {
    // Implementação simples de hash (em produção, usar bcrypt ou similar)
    // Nota: Este é apenas um placeholder. Para produção, use métodos mais seguros.
    let hash = 0;
    for (let i = 0; i < senha.length; i++) {
      const char = senha.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converter para 32bit integer
    }
    return hash.toString(16);
  }

  redefinirSenha(email, novaSenha) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      
      request.onerror = (event) => {
        reject('Erro ao acessar o banco de dados: ' + event.target.error);
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const getRequest = store.get(email);
        
        getRequest.onsuccess = (event) => {
          const usuario = event.target.result;
          if (!usuario) {
            reject('Usuário não encontrado');
            return;
          }
          
          usuario.senha = this.hashSenha(novaSenha);
          usuario.timestamp = new Date().toISOString();
          
          const updateRequest = store.put(usuario);
          
          updateRequest.onsuccess = () => {
            resolve(true);
          };
          
          updateRequest.onerror = (event) => {
            reject('Erro ao atualizar senha: ' + event.target.error);
          };
        };
      };
    });
  }
}

// Exportar instância global
const orionAuth = new OrionAuth();
