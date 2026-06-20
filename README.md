# PetAdopt

Plataforma web para conectar pessoas interessadas em adotar animais a ONGs e responsáveis por pets.

O projeto está na fase de **MVP acadêmico funcional para apresentação**. A aplicação entrega os principais fluxos previstos: autenticação, perfis de usuário, ONG e administrador, cadastro e moderação de pets, solicitação de adoção, painéis de acompanhamento e páginas públicas para pets e ONGs.

## Estado atual

### Implementado

- Cadastro e login com senha armazenada em hash
- Perfis de usuário comum, ONG e administrador
- Cadastro de ONGs, com aprovação ou recusa pelo administrador
- Listagem pública de ONGs aprovadas
- Página pública de perfil da ONG
- Cadastro, edição e remoção de pets por ONGs e administradores
- Upload de imagens para pets e ONGs
- Moderação administrativa de pets e ONGs
- Busca e filtros de pets por espécie, porte, estado, cidade, nome ou raça
- Página de detalhes do pet
- Solicitação de adoção com mensagem ao responsável
- Aprovação, recusa e cancelamento de solicitações de adoção
- Alteração de status do pet para disponível, reservado ou adotado
- Painel do usuário para acompanhar adoções, favoritos e solicitações
- Painel da ONG para gerenciar perfil, pets e pedidos recebidos
- Painel administrativo para gerenciar usuários, ONGs, pets e métricas
- Favoritos de pets
- Feedback após adoção aprovada
- Contato com ONGs por WhatsApp
- Informações de apoio/doação por chave Pix ou link externo
- Métricas de impacto calculadas a partir do banco e ajustáveis pelo administrador
- Script de seed para recriar uma base demonstrativa

## Tecnologias

| Tecnologia | Uso |
|---|---|
| Python 3 | Backend da aplicação |
| Flask | Servidor web e renderização das páginas |
| Flask-SQLAlchemy | Modelos e acesso ao banco de dados |
| Flask-Login | Autenticação e controle de sessão |
| SQLite | Banco de dados utilizado no desenvolvimento |
| Jinja2 | Templates HTML renderizados pelo Flask |
| HTML5, CSS3 e JavaScript | Interface e interações no navegador |

## Como executar

### 1. Criar um ambiente virtual

No PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2. Instalar as dependências

```powershell
pip install -r requirements.txt
```

### 3. Iniciar a aplicação

```powershell
python app.py
```

Acesse `http://127.0.0.1:5000` no navegador.

O banco usado pela aplicação fica em `instance/petadopt.db`.

### 4. Popular dados de exemplo

Opcionalmente, execute:

```powershell
python seed.py
```

O `seed.py` apaga e recria as tabelas antes de inserir dados demonstrativos. Não execute esse comando sobre uma base com dados importantes.

### Acessos de demonstração

Quando a base for recriada pelo `seed.py`, é possível acessar o sistema com os seguintes usuários:

|    Perfil     |         E-mail        |   Senha   |
|      ---      |          ---          |    ---    |
| Administrador | `admin@petadopt.com`  | `123456`  |
| Usuário       | `maria@email.com`     | `123456`  |
| Usuário       | `carlos@email.com`    | `123456`  |
| ONG           | `ong1@petadopt.com`   | `123456`  |
| ONG           | `ong2@petadopt.com`   | `123456`  |
| ONG           | `ong3@petadopt.com`   | `123456`  |
| ONG           | `ong4@petadopt.com`   | `123456`  |

## Perfis e permissões

| Perfil | Principais ações |
|---|---|
| Usuário | Buscar pets, favoritar, solicitar adoção, cancelar pedidos e enviar feedback após adoção aprovada |
| ONG | Editar o perfil da ONG, cadastrar pets e gerenciar pedidos de adoção recebidos |
| Administrador | Moderar pets e ONGs, gerenciar usuários, editar cadastros e ajustar métricas da plataforma |

Novas contas de ONG ficam pendentes até a aprovação de um administrador. Pets recém-cadastrados também entram com status de moderação pendente e só aparecem publicamente após aprovação.

## Rotas principais

| Rota | Página |
|---|---|
| `/` | Página inicial |
| `/pets` | Busca e listagem de pets |
| `/pet/<id>` | Detalhes e solicitação de adoção |
| `/ongs` | ONGs aprovadas |
| `/ong/<id>` | Perfil público da ONG |
| `/login` | Login |
| `/register` | Cadastro de usuário ou ONG |
| `/dashboard` | Painel do usuário ou administrador |
| `/dashboard-ong` | Painel exclusivo da ONG |
| `/new-pet` | Cadastro de pet |
| `/pet-submitted` | Confirmação de envio do pet para análise |
| `/sobre` | Informações sobre o projeto |

O backend também disponibiliza endpoints JSON sob `/api`, usados pelas páginas para consultar e alterar pets, ONGs, usuários, favoritos, feedbacks, solicitações, perfis e dados de moderação.

## Estrutura do projeto

```text
ProjetoExt/
|-- app.py                  # Aplicação Flask, modelos e rotas
|-- requirements.txt        # Dependências Python
|-- seed.py                 # Carga demonstrativa de dados
|-- petadopt_schema.sql     # Referência histórica de schema SQL
|-- instance/
|   `-- petadopt.db         # Banco SQLite usado pela aplicação
|-- templates/              # Templates Jinja2/HTML
|-- static/
|   |-- css/                # Estilos das páginas
|   |-- images/             # Imagens estáticas e diagrama ER
|   |-- js/                 # Interações e consumo da API
|   `-- uploads/            # Imagens enviadas pelos usuários
`-- README.md
```

## Banco de dados

Os modelos ativos estão definidos em `app.py` e utilizam SQLite por meio do Flask-SQLAlchemy. As principais entidades atuais são:

- `Usuario`
- `Ong`
- `Pet`
- `SolicitacaoAdocao`
- `Favorito`
- `Feedback`
- `SiteImpactConfig`

O arquivo `petadopt_schema.sql` funciona como referência histórica do modelo, mas a fonte de verdade da aplicação atual são os modelos declarados em `app.py`.

## Observações

- O projeto foi configurado para execução local em contexto acadêmico.
- A aplicação utiliza `debug=True` durante o desenvolvimento e apresentação.
- A chave secreta está fixa no código para simplificar a execução local.
- Os uploads aceitam PNG, JPG, JPEG e WebP, com limite total de 16 MB por requisição.
- O diretório `static/uploads/` contém arquivos gerados durante o uso da aplicação.

---

Projeto de extensão desenvolvido no 1º Semestre de 2026 por alunos do 3º Período de ADS.
