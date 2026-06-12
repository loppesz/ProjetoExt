# PetAdopt

Plataforma web para conectar pessoas interessadas em adotar animais a ONGs e responsáveis por pets.

O projeto está atualmente na fase de **MVP funcional em desenvolvimento**. A aplicação já possui backend em Flask, persistência em SQLite, autenticação por sessão, perfis com diferentes permissões e fluxos de adoção e moderação. Ainda existem funcionalidades em evolução e pontos que precisam ser preparados antes de um uso em produção.

## Estado atual

### Implementado

- Cadastro e login de usuários com senha armazenada em hash
- Perfis de usuário comum, ONG e administrador
- Listagem e busca de pets por espécie, porte, estado, cidade, nome ou raça
- Página de detalhes do pet
- Cadastro de pets por ONGs e administradores, incluindo upload de imagem
- Moderação de pets e ONGs pelo administrador
- Solicitação e acompanhamento de adoções
- Painel do usuário para acompanhar pets e solicitações
- Painel da ONG para gerenciar perfil, pets e pedidos de adoção
- Alteração do status do pet para disponível, reservado ou adotado
- Listagem e página pública das ONGs aprovadas
- Informações para doação via Pix ou link externo
- Contato com ONGs por WhatsApp
- Métricas de impacto calculadas a partir do banco e ajustáveis pelo administrador

### Em desenvolvimento

- Registro e confirmação de doações dentro da plataforma
- Cobertura de testes automatizados
- Migrações versionadas do banco de dados
- Validações e configurações de segurança para produção
- Revisão e sincronização do script de seed e do schema SQL de referência

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

O banco usado pela aplicação fica em `instance/petadopt.db`. As tabelas necessárias são criadas automaticamente pelo SQLAlchemy quando os fluxos que acessam o banco são executados.

> O arquivo `seed.py` ainda precisa ser atualizado para acompanhar os modelos atuais. Ele apaga e recria as tabelas, portanto não deve ser executado sobre dados importantes.

## Perfis e permissões

| Perfil | Principais ações |
|---|---|
| Usuário | Buscar pets, solicitar adoção e acompanhar solicitações |
| ONG | Editar o perfil da ONG, cadastrar pets e gerenciar pedidos de adoção |
| Administrador | Moderar pets e ONGs, editar cadastros e gerenciar métricas da plataforma |

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
| `/sobre` | Informações sobre o projeto |

O backend também disponibiliza endpoints JSON sob `/api`, usados pelas páginas para consultar e alterar pets, ONGs, solicitações, perfis e dados de moderação.

## Estrutura do projeto

```text
ProjetoExt/
|-- app.py                  # Aplicação Flask, modelos e rotas
|-- requirements.txt       # Dependências Python
|-- seed.py                 # Carga inicial em revisão
|-- petadopt_schema.sql     # Referência histórica de schema MySQL
|-- instance/
|   `-- petadopt.db         # Banco SQLite usado pela aplicação
|-- templates/              # Templates Jinja2/HTML
|-- static/
|   |-- css/                # Estilos das páginas
|   |-- js/                 # Interações e consumo da API
|   `-- uploads/            # Imagens enviadas pelos usuários
`-- README.md
```

## Banco de dados

Os modelos ativos estão definidos em `app.py` e utilizam SQLite por meio do Flask-SQLAlchemy. Atualmente, as principais entidades são:

- `Usuario`
- `Ong`
- `Pet`
- `SolicitacaoAdocao`
- `Favorito`
- `Feedback`
- `SiteImpactConfig`

O arquivo `petadopt_schema.sql` descreve uma proposta anterior para MySQL/MariaDB e não corresponde integralmente à implementação atual. Para alterações no banco, a fonte de verdade desta fase são os modelos declarados em `app.py`.

## Observações de desenvolvimento

- A aplicação está configurada com `debug=True` e não deve ser publicada assim.
- A chave secreta está fixa no código e deverá ser movida para uma variável de ambiente.
- Os uploads aceitam PNG, JPG, JPEG e WebP, com limite total de 16 MB por requisição.
- O diretório `static/uploads/` contém arquivos gerados durante o uso da aplicação.
- Não há suíte de testes automatizados configurada nesta fase.
- O projeto ainda não possui configuração de deploy ou servidor WSGI de produção.

## Próximos passos

1. Corrigir e alinhar `seed.py`, `requirements.txt` e o schema de referência.
2. Implementar o registro e a confirmação de doações de forma persistente.
3. Separar configurações sensíveis em variáveis de ambiente.
4. Adicionar migrações de banco e testes automatizados.
5. Preparar a aplicação para deploy e homologação.

---

Projeto acadêmico de extensão, em desenvolvimento durante 2026.
