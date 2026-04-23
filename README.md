# 🐾 PetAdopt

Plataforma web de adoção responsável de pets. Conecta tutores responsáveis a animais que precisam de um lar, com suporte a ONGs, doações e painel administrativo.

> **Frontend estático** — HTML, CSS e JavaScript puro. Sem backend ou banco de dados. Todos os dados são simulados via mock em JavaScript.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Rodar](#como-rodar)
- [Páginas](#páginas)
- [Credenciais de Teste](#credenciais-de-teste)
- [Tecnologias](#tecnologias)

---

## Visão Geral

O PetAdopt é uma plataforma que permite:

- Visualizar e filtrar pets disponíveis para adoção
- Ver informações completas de cada animal
- Demonstrar interesse na adoção via formulário ou WhatsApp
- Cadastrar pets para adoção
- Conhecer ONGs parceiras e realizar doações via Pix ou link externo
- Gerenciar pets, adoções e pedidos pelo painel do usuário
- Moderar conteúdos da plataforma (perfil admin)

---

## Funcionalidades

| Código | Funcionalidade |
|--------|---------------|
| RF01 | Visualizar pets disponíveis para adoção |
| RF02 | Filtrar pets por características (tipo, porte, raça, etc.) |
| RF03 | Filtrar pets por localização (cidade/estado) |
| RF04 | Página individual com informações completas de cada pet |
| RF05 | Demonstrar interesse na adoção via formulário |
| RF06 | ONGs/admins cadastram, editam e removem pets |
| RF07 | Visualizar ONGs cadastradas |
| RF08 | Realizar doações para ONGs |
| RF09 | Painel de moderação para administradores |
| RF10 | Alterar status do pet (disponível/reservado/adotado) |
| RF11 | Redirecionamento para Pix ou link externo para doação |
| RF12 | Contato com a ONG via WhatsApp |
| RF13 | Métricas sociais dinâmicas (adoções, pets, cidades) |

---

## Estrutura do Projeto

```
petadopt/
├── index.html          # Página inicial
├── pets.html           # Listagem e busca de pets
├── pet.html            # Detalhe de um pet
├── ongs.html           # ONGs parceiras + doações
├── dashboard.html      # Painel do usuário / admin
├── new-pet.html        # Cadastro de pet
├── login.html          # Login
├── register.html       # Cadastro de conta
├── sobre.html          # Sobre a plataforma
│
├── css/
│   ├── petadopt.css    # Base global
│   ├── index.css       # Estilos da home
│   ├── pets.css        # Listagem de pets
│   ├── pet.css         # Detalhe do pet
│   ├── dashboard.css   # Painel
│   ├── login.css       # Login
│   ├── register.css    # Cadastro
│   ├── new-pet.css     # Formulário de pet
│   ├── sobre.css       # Sobre
│   └── ongs.css        # ONGs
│
└── js/
    ├── index.js        # Home: pets em destaque, métricas, animações
    ├── pets.js         # Listagem: filtros, paginação, ordenação
    ├── pet.js          # Detalhe: galeria, adoção, WhatsApp
    ├── ongs.js         # ONGs: cards, modal, doação Pix
    ├── dashboard.js    # Painel: tabs, edição, moderação
    ├── new-pet.js      # Formulário: upload de fotos, validação
    ├── login.js        # Autenticação simulada
    └── register.js     # Cadastro em 2 etapas
```

---

## Como Rodar

Por ser um projeto estático, basta abrir os arquivos no navegador.

**Opção 1 — Abrir direto:**
```
Abra o arquivo index.html no navegador
```

**Opção 2 — Live Server (recomendado):**

Se tiver o VS Code com a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer):
1. Clique com o botão direito em `index.html`
2. Selecione **"Open with Live Server"**

**Opção 3 — Python:**
```bash
python -m http.server 8080
# Acesse: http://localhost:8080
```

---

## Páginas

| Página | URL | Descrição |
|--------|-----|-----------|
| Home | `index.html` | Hero, pets em destaque, métricas, ONGs, depoimentos |
| Busca | `pets.html` | Filtros por espécie, porte, cidade, estado |
| Pet | `pet.html?id=1` | Galeria, tags, botão adotar, WhatsApp |
| ONGs | `ongs.html` | Cards de ONGs, modal de detalhes, doação Pix |
| Painel | `dashboard.html` | Meus pets, adoções, pedidos, favoritos, moderação |
| Cadastrar Pet | `new-pet.html` | Formulário com upload de fotos |
| Login | `login.html` | Autenticação simulada |
| Cadastro | `register.html` | Registro em 2 etapas |
| Sobre | `sobre.html` | Missão, equipe, valores, impacto |

---

## Credenciais de Teste

### Usuário comum
- **E-mail:** qualquer e-mail válido (ex: `usuario@email.com`)
- **Senha:** qualquer senha com 6+ caracteres

### Administrador
- **E-mail:** `admin@petadopt.com`
- **Senha:** qualquer senha (ex: `123456`)

> O admin tem acesso à aba **Moderação** no painel, onde pode aprovar ou remover pets cadastrados.

---

## Tecnologias

| Tecnologia | Uso |
|-----------|-----|
| HTML5 | Estrutura das páginas |
| CSS3 | Estilização (variáveis CSS, Grid, Flexbox, animações) |
| JavaScript (ES6+) | Lógica, mock data, IntersectionObserver |
| [Fraunces](https://fonts.google.com/specimen/Fraunces) | Fonte display (títulos) |
| [DM Sans](https://fonts.google.com/specimen/DM+Sans) | Fonte corpo (textos) |
| [Unsplash](https://unsplash.com) | Imagens dos pets e ONGs |

---

## Design

- **Paleta principal:** Azul `#1a4161` · Azul claro `#2e86c1` · Amarelo `#f0c040`
- **Fundo:** `#f4f7fb` (páginas internas) · `#0d1b2a` (footer/nav)
- **Animações:** scroll reveal via `IntersectionObserver`, contadores animados, marquee CSS, floating cards

---

## Observações

- Todos os dados são **mock** — nenhuma informação é persistida
- O login salva o usuário no `localStorage` do navegador
- Para testar como admin, use o e-mail `admin@petadopt.com`
- O fluxo de doação via Pix usa um QR Code gerado pela API pública `api.qrserver.com`

---

*Feito com ❤️ para os animais — PetAdopt 2025*
