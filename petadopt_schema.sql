-- ============================================================
--  PetAdopt — Schema SQL
--  Banco: MySQL 8+ / MariaDB 10.6+
--  Gerado em: 2025
-- ============================================================

CREATE DATABASE IF NOT EXISTS petadopt
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE petadopt;

-- ============================================================
-- 1. USUARIO
-- ============================================================
CREATE TABLE usuario (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(120)    NOT NULL,
  email       VARCHAR(180)    NOT NULL,
  senha_hash  VARCHAR(255)    NOT NULL,
  telefone    VARCHAR(20)         NULL,
  cidade      VARCHAR(100)        NULL,
  estado      CHAR(2)             NULL,
  role        ENUM('user','admin') NOT NULL DEFAULT 'user',
  criado_em   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_usuario_email (email)
) ENGINE=InnoDB;

-- ============================================================
-- 2. ONG
-- ============================================================
CREATE TABLE ong (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nome         VARCHAR(120)  NOT NULL,
  descricao    TEXT              NULL,
  cidade       VARCHAR(100)      NULL,
  estado       CHAR(2)           NULL,
  whatsapp     VARCHAR(20)       NULL,
  chave_pix    VARCHAR(120)      NULL,
  link_vakinha VARCHAR(255)      NULL,
  foto_url     VARCHAR(255)      NULL,
  criado_em    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ============================================================
-- 3. PET
-- ============================================================
CREATE TABLE pet (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  usuario_id   INT UNSIGNED      NULL,
  ong_id       INT UNSIGNED      NULL,
  nome         VARCHAR(80)   NOT NULL,
  especie      ENUM('dog','cat') NOT NULL,
  raca         VARCHAR(80)       NULL,
  porte        ENUM('small','medium','large','giant') NOT NULL DEFAULT 'medium',
  sexo         ENUM('male','female','unknown')        NOT NULL DEFAULT 'unknown',
  idade_anos   TINYINT UNSIGNED  NOT NULL DEFAULT 0,
  idade_meses  TINYINT UNSIGNED  NOT NULL DEFAULT 0,
  cor          VARCHAR(80)       NULL,
  vacinado     TINYINT(1)    NOT NULL DEFAULT 0,
  castrado     TINYINT(1)    NOT NULL DEFAULT 0,
  microchip    TINYINT(1)    NOT NULL DEFAULT 0,
  vermifugado  TINYINT(1)    NOT NULL DEFAULT 0,
  descricao    TEXT              NULL,
  cidade       VARCHAR(100)  NOT NULL,
  estado       CHAR(2)       NOT NULL,
  status       ENUM('available','reserved','adopted') NOT NULL DEFAULT 'available',
  mod_status   ENUM('pending','approved','removed')   NOT NULL DEFAULT 'pending',
  criado_em    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_pet_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE SET NULL,
  CONSTRAINT fk_pet_ong     FOREIGN KEY (ong_id)     REFERENCES ong     (id) ON DELETE SET NULL,

  INDEX idx_pet_especie  (especie),
  INDEX idx_pet_status   (status),
  INDEX idx_pet_estado   (estado),
  INDEX idx_pet_cidade   (cidade)
) ENGINE=InnoDB;

-- ============================================================
-- 4. FOTO_PET
-- ============================================================
CREATE TABLE foto_pet (
  id      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  pet_id  INT UNSIGNED  NOT NULL,
  url     VARCHAR(255)  NOT NULL,
  is_capa TINYINT(1)    NOT NULL DEFAULT 0,
  ordem   TINYINT UNSIGNED NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  CONSTRAINT fk_foto_pet FOREIGN KEY (pet_id) REFERENCES pet (id) ON DELETE CASCADE,

  INDEX idx_foto_pet_id (pet_id)
) ENGINE=InnoDB;

-- ============================================================
-- 5. SOLICITACAO_ADOCAO
-- ============================================================
CREATE TABLE solicitacao_adocao (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  pet_id          INT UNSIGNED  NOT NULL,
  solicitante_id  INT UNSIGNED  NOT NULL,
  mensagem        TEXT              NULL,
  status          ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  criado_em       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_solicit_pet  FOREIGN KEY (pet_id)         REFERENCES pet     (id) ON DELETE CASCADE,
  CONSTRAINT fk_solicit_user FOREIGN KEY (solicitante_id) REFERENCES usuario  (id) ON DELETE CASCADE,

  INDEX idx_solicit_pet    (pet_id),
  INDEX idx_solicit_user   (solicitante_id),
  INDEX idx_solicit_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- 6. FAVORITO
-- ============================================================
CREATE TABLE favorito (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  usuario_id  INT UNSIGNED  NOT NULL,
  pet_id      INT UNSIGNED  NOT NULL,
  criado_em   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_favorito (usuario_id, pet_id),
  CONSTRAINT fk_fav_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_pet     FOREIGN KEY (pet_id)     REFERENCES pet     (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 7. DOACAO
-- ============================================================
CREATE TABLE doacao (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  usuario_id  INT UNSIGNED        NULL,
  ong_id      INT UNSIGNED    NOT NULL,
  valor       DECIMAL(10,2)   NOT NULL,
  metodo      ENUM('pix','link_externo') NOT NULL,
  status      ENUM('pendente','confirmada') NOT NULL DEFAULT 'pendente',
  criado_em   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_doacao_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE SET NULL,
  CONSTRAINT fk_doacao_ong     FOREIGN KEY (ong_id)     REFERENCES ong     (id) ON DELETE CASCADE,

  INDEX idx_doacao_ong    (ong_id),
  INDEX idx_doacao_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- 8. MODERACAO_LOG
-- ============================================================
CREATE TABLE moderacao_log (
  id        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  admin_id  INT UNSIGNED  NOT NULL,
  pet_id    INT UNSIGNED  NOT NULL,
  acao      ENUM('approved','removed') NOT NULL,
  motivo    TEXT              NULL,
  criado_em DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_modlog_admin FOREIGN KEY (admin_id) REFERENCES usuario (id) ON DELETE CASCADE,
  CONSTRAINT fk_modlog_pet   FOREIGN KEY (pet_id)   REFERENCES pet     (id) ON DELETE CASCADE,

  INDEX idx_modlog_pet   (pet_id),
  INDEX idx_modlog_admin (admin_id)
) ENGINE=InnoDB;


-- ============================================================
-- DADOS DE EXEMPLO (seed)
-- ============================================================

-- Usuários
INSERT INTO usuario (nome, email, senha_hash, telefone, cidade, estado, role) VALUES
  ('Admin PetAdopt',  'admin@petadopt.com',  '$2b$10$hash_admin',  '11999990000', 'São Paulo',      'SP', 'admin'),
  ('Maria Silva',     'maria@email.com',     '$2b$10$hash_maria',  '11988880001', 'São Paulo',      'SP', 'user'),
  ('Carlos Lima',     'carlos@email.com',    '$2b$10$hash_carlos', '21977770002', 'Rio de Janeiro', 'RJ', 'user'),
  ('Juliana Alves',   'juliana@email.com',   '$2b$10$hash_juli',   '41966660003', 'Curitiba',       'PR', 'user');

-- ONGs
INSERT INTO ong (nome, descricao, cidade, estado, whatsapp, chave_pix, link_vakinha, foto_url) VALUES
  ('Patinhas do Bem',  'Resgatamos e reabilitamos cães e gatos desde 2015.',          'São Paulo',      'SP', '5511999990001', 'patinhasdob@gmail.com',    'https://www.vakinha.com.br', 'https://images.unsplash.com/photo-1601758124096-7093b3fef44d?w=600'),
  ('Lar dos Bichos',   'ONG dedicada ao resgate de animais no Rio de Janeiro.',       'Rio de Janeiro', 'RJ', '5521999990002', 'lardosbichos@gmail.com',   'https://www.vakinha.com.br', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600'),
  ('Amigos de Patas',  'Cuidamos de animais especiais — idosos e com deficiência.',   'Belo Horizonte', 'MG', '5531999990003', 'amigospatinhas@gmail.com', 'https://www.vakinha.com.br', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600'),
  ('Refúgio Animal Sul','O maior abrigo de animais do Rio Grande do Sul.',            'Porto Alegre',   'RS', '5551999990004', 'refugioanimalsul@gmail.com','https://www.vakinha.com.br','https://images.unsplash.com/photo-1552053831-71594a27632d?w=600');

-- Pets
INSERT INTO pet (usuario_id, ong_id, nome, especie, raca, porte, sexo, idade_anos, idade_meses, cor, vacinado, castrado, descricao, cidade, estado, status, mod_status) VALUES
  (2, NULL, 'Thor',  'dog', 'Golden Retriever', 'large',  'male',   2, 0, 'Dourado',            1, 1, 'Thor é carinhoso e brincalhão. Adora crianças.',          'São Paulo',      'SP', 'available', 'approved'),
  (3, NULL, 'Luna',  'cat', 'Siamês',           'small',  'female', 1, 6, 'Creme com pontas',   1, 0, 'Luna é elegante e independente. Ideal para apartamento.', 'Rio de Janeiro', 'RJ', 'available', 'approved'),
  (2, NULL, 'Bob',   'dog', 'SRD (Vira-lata)',  'medium', 'male',   3, 0, 'Caramelo',           1, 1, 'Bob foi resgatado da rua. Muito dócil e obediente.',      'Belo Horizonte', 'MG', 'available', 'approved'),
  (4, NULL, 'Mia',   'cat', 'Persa',            'small',  'female', 0, 8, 'Branco',             1, 0, 'Mia é tranquila e adora colos.',                         'Curitiba',       'PR', 'available', 'approved'),
  (2, NULL, 'Rex',   'dog', 'Pastor Alemão',    'large',  'male',   4, 0, 'Preto e marrom',     1, 1, 'Rex foi adotado com sucesso!',                           'Porto Alegre',   'RS', 'adopted',   'approved'),
  (2, NULL, 'Nina',  'dog', 'Poodle',           'small',  'female', 1, 0, 'Branco',             0, 0, 'Nina é cheia de energia e alegria.',                     'São Paulo',      'SP', 'available', 'approved'),
  (3, NULL, 'Mel',   'cat', 'Maine Coon',       'small',  'female', 3, 0, 'Cinza rajado',       1, 1, 'Mel é dócil e convive bem com crianças.',                'Florianópolis',  'SC', 'available', 'pending'),
  (4, NULL, 'Duque', 'dog', 'Labrador',         'large',  'male',   2, 0, 'Caramelo',           1, 0, 'Duque é jovem e muito brincalhão.',                      'Recife',         'PE', 'available', 'pending');

-- Fotos dos pets
INSERT INTO foto_pet (pet_id, url, is_capa, ordem) VALUES
  (1, 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800', 1, 0),
  (1, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800', 0, 1),
  (2, 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800', 1, 0),
  (3, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800', 1, 0),
  (4, 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800', 1, 0),
  (6, 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800', 1, 0);

-- Solicitações de adoção
INSERT INTO solicitacao_adocao (pet_id, solicitante_id, mensagem, status) VALUES
  (2, 2, 'Olá! Tenho apartamento e muito amor para dar. A Luna seria perfeita!', 'pending'),
  (1, 3, 'Tenho quintal grande e experiência com Golden. Adoraria adotar o Thor.', 'approved');

-- Favoritos
INSERT INTO favorito (usuario_id, pet_id) VALUES
  (2, 2),
  (2, 6),
  (3, 1);

-- Doações
INSERT INTO doacao (usuario_id, ong_id, valor, metodo, status) VALUES
  (2, 1, 50.00,  'pix',          'confirmada'),
  (3, 2, 25.00,  'pix',          'confirmada'),
  (4, 1, 100.00, 'link_externo', 'pendente');

-- Log de moderação
INSERT INTO moderacao_log (admin_id, pet_id, acao, motivo) VALUES
  (1, 1, 'approved', 'Informações completas e foto de qualidade.'),
  (1, 2, 'approved', 'Pet verificado pela ONG parceira.'),
  (1, 5, 'approved', 'Pet adotado com sucesso.');
