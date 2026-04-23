# Requirements Document

## Introduction

O PetAdopt é um sistema web de adoção de pets que conecta tutores responsáveis a animais que precisam de um lar. O sistema já possui um frontend estático funcional (HTML/CSS/JS puro) com páginas de listagem, detalhe de pet, login, cadastro, dashboard e sobre. O objetivo desta spec é implementar as funcionalidades faltantes — tudo com dados mock em JavaScript, sem integração com banco de dados.

Os gaps identificados são: edição/remoção de pets no dashboard (RF06), página de ONGs (RF07), fluxo de doação com Pix/link externo (RF08/RF11), painel de moderação para admin (RF09), alteração de status do pet (RF10), botão de contato via WhatsApp na página do pet (RF12) e métricas sociais dinâmicas (RF13).

## Glossary

- **Sistema**: A aplicação web PetAdopt (frontend estático)
- **Usuário**: Pessoa autenticada que pode adotar pets e gerenciar seus próprios cadastros
- **ONG**: Organização não-governamental cadastrada na plataforma que gerencia pets para adoção
- **Admin**: Usuário com papel de administrador, responsável pela moderação da plataforma
- **Pet**: Animal cadastrado na plataforma disponível para adoção
- **Dashboard**: Área logada do usuário/ONG/admin com abas de gerenciamento
- **Status_Pet**: Estado atual do pet — `available` (disponível), `reserved` (reservado) ou `adopted` (adotado)
- **Mock_Data**: Dados simulados em JavaScript, sem persistência em banco de dados real
- **Painel_Admin**: Aba exclusiva do dashboard acessível apenas por usuários com papel `admin`
- **Modal**: Janela sobreposta à página para interações rápidas sem navegação
- **Toast**: Notificação temporária exibida no canto da tela para feedback de ações

---

## Requirements

### Requirement 1: Editar e remover pets cadastrados (RF06)

**User Story:** Como ONG ou usuário responsável por um pet, quero poder editar as informações e remover pets que cadastrei, para manter os dados sempre atualizados.

#### Acceptance Criteria

1. WHEN o usuário acessa a aba "Meus Pets" no Dashboard, THE Sistema SHALL exibir botões de "Editar" e "Remover" em cada card de pet cadastrado pelo usuário.
2. WHEN o usuário clica em "Editar" em um pet, THE Sistema SHALL abrir um Modal com um formulário pré-preenchido com os dados atuais do pet.
3. WHEN o usuário submete o formulário de edição com dados válidos, THE Sistema SHALL atualizar os dados do pet no Mock_Data e exibir um Toast de confirmação.
4. IF o usuário submete o formulário de edição com campos obrigatórios vazios, THEN THE Sistema SHALL exibir mensagens de erro inline nos campos inválidos e bloquear o envio.
5. WHEN o usuário clica em "Remover" em um pet, THE Sistema SHALL exibir um Modal de confirmação antes de executar a remoção.
6. WHEN o usuário confirma a remoção, THE Sistema SHALL remover o pet do Mock_Data, atualizar a lista na aba "Meus Pets" e exibir um Toast de confirmação.

---

### Requirement 2: Página de ONGs cadastradas (RF07)

**User Story:** Como usuário, quero visualizar as ONGs parceiras da plataforma, para conhecer as organizações responsáveis pelos pets e entrar em contato com elas.

#### Acceptance Criteria

1. THE Sistema SHALL disponibilizar uma página `ongs.html` acessível pelo menu de navegação principal.
2. THE Sistema SHALL exibir cards de ONGs com: nome, cidade/estado, descrição resumida, número de pets cadastrados e botão de contato via WhatsApp.
3. WHEN o usuário clica no botão de WhatsApp de uma ONG, THE Sistema SHALL abrir o link `https://wa.me/{numero}` em uma nova aba do navegador.
4. WHEN o usuário clica no card de uma ONG, THE Sistema SHALL exibir um Modal com informações completas da ONG: nome, descrição, cidade, estado, número de pets, número de adoções realizadas e link de WhatsApp.
5. THE Sistema SHALL exibir pelo menos 4 ONGs com dados Mock_Data representativos.

---

### Requirement 3: Fluxo de doação para ONGs (RF08 e RF11)

**User Story:** Como usuário, quero poder fazer uma doação para uma ONG, para apoiar financeiramente o trabalho de resgate e cuidado dos animais.

#### Acceptance Criteria

1. WHEN o usuário acessa a página de ONGs ou o Modal de detalhes de uma ONG, THE Sistema SHALL exibir um botão "Fazer doação".
2. WHEN o usuário clica em "Fazer doação", THE Sistema SHALL abrir um Modal com as opções de doação: valores sugeridos (R$ 10, R$ 25, R$ 50, R$ 100) e campo para valor personalizado.
3. WHEN o usuário seleciona ou digita um valor e escolhe "Pix", THE Sistema SHALL exibir uma chave Pix mock e um QR Code simulado (imagem placeholder) para cópia.
4. WHEN o usuário seleciona ou digita um valor e escolhe "Link externo", THE Sistema SHALL redirecionar para `https://www.vakinha.com.br` em uma nova aba.
5. IF o usuário digita um valor personalizado menor que R$ 1,00 ou não numérico, THEN THE Sistema SHALL exibir uma mensagem de erro e bloquear o prosseguimento.
6. WHEN o usuário clica em "Copiar chave Pix", THE Sistema SHALL copiar a chave para a área de transferência e exibir um Toast de confirmação.

---

### Requirement 4: Painel de moderação para admin (RF09)

**User Story:** Como administrador, quero ter acesso a um painel de moderação, para revisar e aprovar ou remover conteúdos cadastrados na plataforma.

#### Acceptance Criteria

1. WHEN um usuário com papel `admin` acessa o Dashboard, THE Sistema SHALL exibir uma aba adicional "Moderação" na sidebar.
2. THE Painel_Admin SHALL listar todos os pets cadastrados na plataforma com status de moderação: "Pendente", "Aprovado" ou "Removido".
3. WHEN o Admin clica em "Aprovar" em um pet pendente, THE Sistema SHALL atualizar o status de moderação do pet para "Aprovado" no Mock_Data e exibir um Toast de confirmação.
4. WHEN o Admin clica em "Remover" em um pet, THE Sistema SHALL atualizar o status de moderação para "Removido" no Mock_Data, ocultar o pet da listagem pública e exibir um Toast de confirmação.
5. THE Painel_Admin SHALL exibir métricas de moderação: total de pets pendentes, aprovados e removidos.
6. WHERE o usuário não possui papel `admin`, THE Sistema SHALL ocultar a aba "Moderação" da sidebar do Dashboard.

---

### Requirement 5: Alteração de status do pet (RF10)

**User Story:** Como responsável por um pet, quero poder alterar o status do animal diretamente no dashboard, para refletir a situação atual de disponibilidade sem precisar editar o cadastro completo.

#### Acceptance Criteria

1. WHEN o usuário acessa a aba "Meus Pets" no Dashboard, THE Sistema SHALL exibir um seletor de Status_Pet em cada card de pet.
2. WHEN o usuário altera o Status_Pet de um pet para "Adotado", "Disponível" ou "Reservado", THE Sistema SHALL atualizar o Mock_Data imediatamente e exibir um Toast de confirmação.
3. WHEN o Status_Pet é alterado para "Adotado", THE Sistema SHALL atualizar o contador de adoções nas métricas do Dashboard.
4. THE Sistema SHALL refletir o novo Status_Pet na página de detalhe do pet (`pet.html`) ao ser acessada após a alteração.

---

### Requirement 6: Contato via WhatsApp na página do pet (RF12)

**User Story:** Como usuário interessado em adotar um pet, quero poder entrar em contato diretamente com a ONG ou responsável via WhatsApp, para agilizar o processo de adoção.

#### Acceptance Criteria

1. WHEN o usuário acessa a página de detalhe de um pet (`pet.html`) com Status_Pet igual a `available`, THE Sistema SHALL exibir um botão "Falar no WhatsApp" na caixa de adoção.
2. WHEN o usuário clica em "Falar no WhatsApp", THE Sistema SHALL abrir o link `https://wa.me/{numero_responsavel}?text={mensagem_pre_preenchida}` em uma nova aba.
3. THE Sistema SHALL pré-preencher a mensagem do WhatsApp com o nome do pet e a intenção de adoção, por exemplo: "Olá! Vi o {nome_pet} no PetAdopt e tenho interesse em adotar. Podemos conversar?".
4. IF o pet possui Status_Pet igual a `adopted` ou `reserved`, THEN THE Sistema SHALL ocultar o botão de WhatsApp e manter apenas as mensagens de status existentes.

---

### Requirement 7: Métricas sociais dinâmicas (RF13)

**User Story:** Como visitante ou usuário, quero visualizar métricas reais da plataforma, para entender o impacto do PetAdopt e me sentir motivado a participar.

#### Acceptance Criteria

1. THE Sistema SHALL exibir na página inicial (`index.html`) métricas calculadas dinamicamente a partir do Mock_Data: total de pets cadastrados, total de adoções realizadas (pets com status `adopted`) e número de cidades atendidas.
2. THE Sistema SHALL disponibilizar uma seção de métricas no Dashboard do usuário com: total de pets cadastrados pelo usuário, total de solicitações enviadas e total de pedidos recebidos.
3. WHEN o Status_Pet de um pet é alterado para `adopted`, THE Sistema SHALL incrementar o contador de adoções nas métricas exibidas no Dashboard.
4. THE Sistema SHALL exibir na página de ONGs (`ongs.html`) o total de pets cadastrados e adoções realizadas por cada ONG, calculados a partir do Mock_Data.
5. WHILE o usuário navega pelo Dashboard, THE Sistema SHALL manter as métricas sincronizadas com o estado atual do Mock_Data sem necessidade de recarregar a página.

---

### Requirement 8: Validação de dados inseridos pelo usuário (RNF03)

**User Story:** Como usuário, quero que o sistema valide os dados que insiro nos formulários, para evitar erros e garantir que as informações cadastradas sejam consistentes.

#### Acceptance Criteria

1. WHEN o usuário submete qualquer formulário da plataforma com campos obrigatórios vazios, THE Sistema SHALL exibir mensagens de erro descritivas próximas a cada campo inválido e impedir o envio.
2. WHEN o usuário preenche um campo de telefone/WhatsApp, THE Sistema SHALL validar que o valor contém apenas dígitos e possui entre 10 e 11 caracteres (com DDD).
3. WHEN o usuário preenche um campo de valor monetário para doação, THE Sistema SHALL validar que o valor é numérico e maior ou igual a R$ 1,00.
4. WHEN o usuário corrige um campo inválido, THE Sistema SHALL remover a mensagem de erro do campo assim que o valor se tornar válido.
