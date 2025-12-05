
<div align="center">

# GeoSync - Secure Environment Variable Manager

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-success?style=for-the-badge)
![Framework](https://img.shields.io/badge/Electron-30.0.0-blue?style=for-the-badge&logo=electron)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![CSS Framework](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8?style=for-the-badge&logo=tailwindcss)

<img src="public/satellite.png" alt="GeoSync" width="200">

**GeoSync é uma plataforma completa para gerenciamento de organizações/projetos, variáveis de ambiente e configurações de projetos, projetada para equipes modernas e freelancers.**

[Ver Demo](#) • [Reportar Bug](https://github.com/antonio-silva-development-studio/Geosync/issues) • [Contribuir](https://github.com/antonio-silva-development-studio/Geosync/pulls)

## 📥 Downloads

| Plataforma | Download |
| :--- | :--- |
| **macOS** (Apple Silicon/Intel) | [![Download macOS](https://img.shields.io/github/downloads/antonio-silva-development-studio/Geosync/latest/total?label=Download%20.dmg&logo=apple&color=white)](https://github.com/antonio-silva-development-studio/Geosync/releases/latest) |
| **Windows** | [![Download Windows](https://img.shields.io/github/downloads/antonio-silva-development-studio/Geosync/latest/total?label=Download%20.exe&logo=windows&color=blue)](https://github.com/antonio-silva-development-studio/Geosync/releases/latest) |
| **Linux** | [![Download Linux](https://img.shields.io/github/downloads/antonio-silva-development-studio/Geosync/latest/total?label=Download%20.AppImage&logo=linux&color=orange)](https://github.com/antonio-silva-development-studio/Geosync/releases/latest) |

> **Nota:** Os links acima redirecionam para a página da versão mais recente (Latest Release), onde você pode escolher o arquivo adequado para o seu sistema.

</div>

---

## 📖 Sobre o Projeto

### 🎯 O Desafio

Gerenciar variáveis de ambiente (.env) em múltiplos projetos, ambientes (dev, staging, prod) e entre membros da equipe é uma tarefa propensa a erros e riscos de segurança. Arquivos `.env` espalhados, segredos compartilhados via chat e falta de sincronia são problemas comuns. O objetivo era criar uma solução centralizada, segura e fácil de usar para desenvolvedores.

### 💡 A Solução

Uma **Aplicação Desktop Cross-Platform** completa que atua em 3 frentes principais:

1.  **Segurança**: Criptografia de ponta a ponta e autenticação biométrica (TouchID/Windows Hello) para acesso aos segredos.
2.  **Organização**: Isolamento total entre Projetos e Ambientes, permitindo gestão granular de variáveis.
3.  **Produtividade**: Interface moderna, busca rápida e integração com fluxo de trabalho de desenvolvimento.

---

## ✨ Funcionalidades Principais

### 🔒 Segurança e Autenticação

-   **Biometria**: Login e desbloqueio com TouchID, FaceID ou Windows Hello.
-   **Criptografia**: Armazenamento seguro utilizando a keychain do sistema operacional via `keytar`.
-   **Master Key**: Proteção adicional para dados sensíveis.

### 📂 Gestão de Projetos

-   **Múltiplos Projetos**: Crie e gerencie workspaces independentes.
-   **Ambientes Isolados**: Defina variáveis específicas para Development, Staging e Production.
-   **Templates**: Reutilize definições de variáveis entre ambientes.

### 🛠️ Developer Experience

-   **Interface Moderna**: UI limpa e responsiva com suporte a temas (Light/Dark/System).
-   **Validação**: Prevenção de erros comuns na definição de chaves e valores.
-   **Exportação**: Gere arquivos `.env` automaticamente.

---

## 🚀 Destaques Técnicos

### Arquitetura e Performance

-   ✅ **Electron & React**: Combinação poderosa para apps desktop com UI web moderna.
-   ✅ **State Management**: Zustand para gerenciamento de estado global leve e performático.
-   ✅ **Database Local**: Prisma com SQLite para persistência de dados estruturada e confiável.
-   ✅ **Security First**: Arquitetura pensada para minimizar superfície de ataque.

### UX e Acessibilidade

-   ✅ **Temas**: Suporte nativo a Dark Mode e Light Mode.
-   ✅ **Atalhos**: Navegação otimizada por teclado.
-   ✅ **Feedback Visual**: Indicadores claros de status e ações.

---

## 🛠️ Stack Tecnológica

### Core

-   **Runtime**: Electron
-   **Frontend**: React + Vite
-   **Linguagem**: TypeScript
-   **Estilo**: Tailwind CSS v4

### Dados & Segurança

-   **ORM**: Prisma
-   **Database**: SQLite
-   **Segurança**: Keytar (System Keychain), Node Crypto

### Infra & Tooling

-   **Build**: Electron Builder
-   **Linting/Format**: Biome, ESLint
-   **Testes**: Vitest

---

## 📦 Instalação e Desenvolvimento

### Pré-requisitos

-   Node.js 18+
-   npm ou pnpm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/antonio-silva-development-studio/Geosync.git

# Entre no diretório
cd Geosync

# Instale as dependências
npm install

# Gere o cliente Prisma
npx prisma generate
```

### Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento (Vite + Electron)
npm run dev
```

### Build para Produção

```bash
# Crie o build otimizado para o seu SO atual
npm run build

# Build específico
npm run build:mac
npm run build:win
npm run build:linux
```

---

## 🤝 Como Contribuir

Este é um projeto **Open Source** e contribuições são muito bem-vindas!

1.  Faça um Fork do projeto
2.  Crie uma Branch para sua Feature (`git checkout -b feature/MinhaFeature`)
3.  Faça o Commit de suas mudanças (`git commit -m 'Adiciona minha feature'`)
4.  Faça o Push para a Branch (`git push origin feature/MinhaFeature`)
5.  Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Antonio S.**

-   🌐 Portfolio: [antonio-s-eng.vercel.app](https://antonio-s-eng.vercel.app/)
-   📧 Email: <contato@antoniobsilva.com.br>

---

<div align="center">

**Desenvolvido com ❤️ e muito ☕**

[⬆ Voltar ao topo](#geosync---secure-environment-variable-manager)

</div>
