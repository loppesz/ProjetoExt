from app import app, db, Usuario, Pet, Ong, SolicitacaoAdocao, Feedback, Favorito, SiteImpactConfig

SENHA_PADRAO = '123456'


def criar_usuario(name, email, role, telefone=None, cidade=None, estado=None):
    usuario = Usuario(
        name=name,
        email=email,
        role=role,
        telefone=telefone,
        cidade=cidade,
        estado=estado
    )
    usuario.set_senha(SENHA_PADRAO)
    db.session.add(usuario)
    return usuario


print('Iniciando seed...')

with app.app_context():
    print('App context ativo')

    db.drop_all()
    print('Banco de dados antigo apagado com sucesso!')

    db.create_all()
    print('Tabelas criadas com a estrutura atual')

    admin = criar_usuario('Admin PetAdopt', 'admin@petadopt.com', 'admin')
    maria = criar_usuario('Maria Silva', 'maria@email.com', 'user', cidade='São Paulo', estado='SP')
    carlos = criar_usuario('Carlos Lima', 'carlos@email.com', 'user', telefone='32984116731', cidade='Rio de Janeiro', estado='RJ')

    user_ong1 = criar_usuario('Patinhas do Bem', 'ong1@petadopt.com', 'ong', cidade='São Paulo', estado='SP')
    user_ong2 = criar_usuario('Amicão Muriaé', 'ong2@petadopt.com', 'ong', cidade='Muriaé', estado='RJ')
    user_ong3 = criar_usuario('Amigos de Patas', 'ong3@petadopt.com', 'ong', cidade='Belo Horizonte', estado='MG')
    user_ong4 = criar_usuario('Refúgio Animal Sul', 'ong4@petadopt.com', 'ong', cidade='Porto Alegre', estado='RS')

    heron = criar_usuario('Heron Leal', 'heronleal2004@gmail.com', 'user', telefone='+5532984116731', cidade='Muriaé', estado='MG')
    heron_ong = criar_usuario('Heron Leal', 'heron@email.com', 'ong', telefone='+5532984116731', cidade='Muriaé', estado='MG')
    nattan = criar_usuario('Nattan Estevam da Silva', 'nattansilva0015@gmail.com', 'user', telefone='+5532999173481', cidade='Rosário da Limeira', estado='MG')

    db.session.commit()
    print('Usuários criados com sucesso.')

    ong1 = Ong(
        usuario_id=user_ong1.id,
        nome='Patinhas do Bem',
        descricao='Resgatamos e reabilitamos cães e gatos em situação de rua desde 2015. Já realizamos mais de 300 adoções responsáveis.',
        descricao_completa='A Patinhas do Bem atua há mais de 9 anos no resgate, reabilitação e adoção responsável de animais em situação de vulnerabilidade na Grande São Paulo. Contamos com uma rede de lares temporários e parceiros veterinários que garantem o bem-estar de cada animal até encontrar um lar definitivo.',
        cidade='São Paulo',
        estado='SP',
        whatsapp='5511999990001',
        chave_pix='patinhasdob@gmail.com',
        link_vakinha='https://www.vakinha.com.br',
        foto_url='https://cdn.pixabay.com/photo/2016/02/18/18/37/puppy-1207816_1280.jpg',
        status='approved',
        pets_count=2,
        adopted_count=0,
        donations_count=0
    )

    ong2 = Ong(
        usuario_id=user_ong2.id,
        nome='Amicão Muriaé',
        descricao='ONG dedicada ao resgate de animais abandonados no Rio de Janeiro. Atuamos com castração, vacinação e adoção.',
        descricao_completa='O Amicão Muriaé é uma organização sem fins lucrativos que atua em Muriaé há 7 anos. Nosso trabalho inclui resgate de emergência, cuidados veterinários, castração e vacinação subsidiada, além de um programa de adoção responsável com acompanhamento pós-adoção.',
        cidade='Muriaé',
        estado='RJ',
        whatsapp='5521999990002',
        chave_pix='amicãomuriae@gmail.com',
        link_vakinha='https://www.vakinha.com.br',
        foto_url='https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
        status='approved',
        pets_count=3,
        adopted_count=0,
        donations_count=0
    )

    ong3 = Ong(
        usuario_id=user_ong3.id,
        nome='Amigos de Patas',
        descricao='Cuidamos de animais especiais — idosos, com deficiência e vítimas de maus-tratos. Cada vida importa para nós.',
        descricao_completa='A Amigos de Patas se especializa no cuidado de animais com necessidades especiais: idosos, com deficiências físicas ou sequelas de maus-tratos. Acreditamos que todo animal merece uma segunda chance, independente de sua condição. Trabalhamos com adoção consciente e educação sobre guarda responsável.',
        cidade='Belo Horizonte',
        estado='MG',
        whatsapp='5531999990003',
        chave_pix='amigospatinhas@gmail.com',
        link_vakinha='https://www.vakinha.com.br',
        foto_url='https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80',
        status='approved',
        pets_count=2,
        adopted_count=0,
        donations_count=0
    )

    ong4 = Ong(
        usuario_id=user_ong4.id,
        nome='Refúgio Animal Sul',
        descricao='Atuamos no sul do Brasil com foco em animais de grande porte. Temos um abrigo com capacidade para 50 animais.',
        descricao_completa='O Refúgio Animal Sul é o maior abrigo de animais do Rio Grande do Sul, com capacidade para 50 animais. Focamos especialmente em cães de grande porte, que têm mais dificuldade de adoção. Nosso abrigo conta com área verde, veterinário residente e equipe de voluntários dedicados.',
        cidade='Porto Alegre',
        estado='RS',
        whatsapp='5551999990004',
        chave_pix='refugioanimalsul@gmail.com',
        link_vakinha='https://www.vakinha.com.br',
        foto_url='https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80',
        status='approved',
        pets_count=1,
        adopted_count=1,
        donations_count=0
    )

    db.session.add_all([ong1, ong2, ong3, ong4])
    db.session.commit()
    print('ONGs oficiais criadas com sucesso.')

    thor = Pet(
        usuario_id=user_ong2.id,
        nome='Thor',
        especie='dog',
        raca='Golden Retriever',
        porte='Grande',
        sexo='male',
        idade_anos=3,
        idade_meses=0,
        cor='Dourado',
        vacinado=True,
        castrado=True,
        descricao='Muito dócil e brincalhão, adora crianças.',
        cidade='Muriaé',
        estado='MG',
        status='available',
        mod_status='approved',
        foto_capa='https://blog-static.petlove.com.br/wp-content/uploads/2018/04/golden-retriever.png'
    )

    luna = Pet(
        usuario_id=user_ong2.id,
        nome='Luna',
        especie='cat',
        raca='Siamês',
        porte='small',
        sexo='female',
        idade_anos=1,
        idade_meses=6,
        cor='Creme',
        vacinado=True,
        castrado=False,
        descricao='Luna é muito elegante e independente. Ideal para apartamento.',
        cidade='Muriaé',
        estado='MG',
        status='available',
        mod_status='approved',
        foto_capa='https://www.agrosete.com.br/wp-content/uploads/2017/07/siames-1-800x600.jpg'
    )

    bob = Pet(
        usuario_id=user_ong3.id,
        nome='Bob',
        especie='dog',
        raca='SRD (Vira-lata)',
        porte='medium',
        sexo='male',
        idade_anos=3,
        idade_meses=0,
        cor='Caramelo',
        vacinado=True,
        castrado=True,
        descricao='Bob é muito dócil, obediente e ama crianças.',
        cidade='Belo Horizonte',
        estado='MG',
        status='available',
        mod_status='approved',
        foto_capa='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYzdp6uFGZIdbYtaNse5p4Gia4qh3hTqaYiHrQt_w08gmUSDq8I8E_NPT6&s=10'
    )

    mia = Pet(
        usuario_id=user_ong3.id,
        nome='Mia',
        especie='cat',
        raca='Persa',
        porte='small',
        sexo='female',
        idade_anos=0,
        idade_meses=8,
        cor='Branco',
        vacinado=True,
        castrado=False,
        descricao='Mia é tranquila e adora colos.',
        cidade='Belo Horizonte',
        estado='MG',
        status='available',
        mod_status='approved',
        foto_capa='https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800'
    )

    rex = Pet(
        usuario_id=user_ong4.id,
        nome='Rex',
        especie='dog',
        raca='Pastor Alemão',
        porte='large',
        sexo='male',
        idade_anos=4,
        idade_meses=0,
        cor='Preto e marrom',
        vacinado=True,
        castrado=True,
        descricao='Rex foi adotado com sucesso!',
        cidade='Porto Alegre',
        estado='RS',
        status='adopted',
        mod_status='approved',
        foto_capa='https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800'
    )

    nina = Pet(
        usuario_id=user_ong1.id,
        nome='Nina',
        especie='dog',
        raca='Poodle',
        porte='small',
        sexo='female',
        idade_anos=1,
        idade_meses=0,
        cor='Branco',
        vacinado=False,
        castrado=False,
        descricao='Nina é cheia de energia e alegria.',
        cidade='São Paulo',
        estado='SP',
        status='available',
        mod_status='approved',
        foto_capa='https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800'
    )

    mel = Pet(
        usuario_id=user_ong4.id,
        nome='Mel',
        especie='cat',
        raca='Maine Coon',
        porte='small',
        sexo='female',
        idade_anos=3,
        idade_meses=0,
        cor='Cinza rajado',
        vacinado=True,
        castrado=True,
        descricao='Mel é dócil e convive bem com crianças.',
        cidade='Porto Alegre',
        estado='RS',
        status='available',
        mod_status='approved',
        foto_capa='https://images.tcdn.com.br/img/img_prod/1161225/painel_maine_coon_i_337_1_058be99199c5fc46a2080b222e631f85.jpg'
    )

    duque = Pet(
        usuario_id=user_ong2.id,
        nome='Duque',
        especie='dog',
        raca='Labrador',
        porte='large',
        sexo='male',
        idade_anos=2,
        idade_meses=0,
        cor='Caramelo',
        vacinado=True,
        castrado=False,
        descricao='Duque é jovem e muito brincalhão.',
        cidade='Muriaé',
        estado='MG',
        status='available',
        mod_status='approved',
        foto_capa='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQy7Oc97SzIDva0O41wqGGiVBkf2lImMreQHwvcf3-mMg6qajIIstlOF5bO&s=10'
    )

    tarzam = Pet(
        usuario_id=user_ong1.id,
        nome='Tarzam',
        especie='dog',
        raca='SRD (Vira-lata)',
        porte='small',
        sexo='male',
        idade_anos=2,
        idade_meses=0,
        cor='Caramelo',
        vacinado=True,
        castrado=True,
        descricao='Tarzam é carinhoso e brincalhão. Adora um cafuné e passeios no parque.',
        cidade='Rosário da Limeira',
        estado='MG',
        status='available',
        mod_status='approved',
        foto_capa='https://i.ibb.co/q4xNPYt/IMG-20260506-114846-003.jpg'
    )

    db.session.add_all([thor, luna, bob, mia, rex, nina, mel, duque, tarzam])
    db.session.commit()
    print('Pets criados com sucesso.')

    solicitacao_rex = SolicitacaoAdocao(pet_id=rex.id, solicitante_id=maria.id, mensagem='Quero muito adotar o Rex!', status='approved')
    solicitacao_thor = SolicitacaoAdocao(
        pet_id=thor.id,
        solicitante_id=maria.id,
        mensagem='📞 Contato: 33 (WhatsApp: Sim)\n🏠 Moradia: Casa (com quintal seguro)\n🐾 Outros pets: Sim, cães\n🛋️ Ficará: quintal\n\n💬 Mensagem: sou',
        status='pending'
    )
    solicitacao_nina = SolicitacaoAdocao(
        pet_id=nina.id,
        solicitante_id=maria.id,
        mensagem='📞 Contato: 66666666666 (WhatsApp: Sim)\n🏠 Moradia: Apartamento (telado)\n🐾 Outros pets: Sim, outros\n🛋️ Ficará: quintal\n\n💬 Mensagem: hhjhjh',
        status='pending'
    )
    solicitacao_luna = SolicitacaoAdocao(
        pet_id=luna.id,
        solicitante_id=maria.id,
        mensagem='📞 Contato: 4444444444444444 (WhatsApp: Sim)\n🏠 Moradia: Casa (sem quintal)\n🐾 Outros pets: Sim, cães\n🛋️ Ficará: quintal\n\n💬 Mensagem: jhhugh',
        status='pending'
    )
    solicitacao_tarzam = SolicitacaoAdocao(
        pet_id=tarzam.id,
        solicitante_id=heron.id,
        mensagem='📞 Contato: 32984116731 (WhatsApp: Sim)\n🏠 Moradia: Casa (sem quintal)\n🐾 Outros pets: Nenhum\n🛋️ Ficará: quintal\n\n💬 Mensagem: mkmkmlk',
        status='pending'
    )
    solicitacao_bob = SolicitacaoAdocao(
        pet_id=bob.id,
        solicitante_id=heron.id,
        mensagem='📞 Contato: 33333333333333 (WhatsApp: Sim)\n🏠 Moradia: Apartamento (telado)\n🐾 Outros pets: Sim, cães\n🛋️ Ficará: quintal\n\n💬 Mensagem: feefe',
        status='pending'
    )
    solicitacao_mia = SolicitacaoAdocao(
        pet_id=mia.id,
        solicitante_id=heron.id,
        mensagem='📞 Contato: 22222222222222222222222222 (WhatsApp: Sim)\n🏠 Moradia: Casa (com quintal seguro)\n🐾 Outros pets: Sim, cães\n🛋️ Ficará: ddddddddddd\n\n💬 Mensagem: jjnkjef',
        status='pending'
    )

    db.session.add_all([
        solicitacao_rex,
        solicitacao_thor,
        solicitacao_nina,
        solicitacao_luna,
        solicitacao_tarzam,
        solicitacao_bob,
        solicitacao_mia
    ])
    db.session.commit()
    print('Solicitações criadas com sucesso.')

    db.session.add_all([
        Favorito(usuario_id=heron.id, pet_id=bob.id),
        Favorito(usuario_id=heron.id, pet_id=mia.id),
        Favorito(usuario_id=heron.id, pet_id=tarzam.id)
    ])

    db.session.add(Feedback(
        solicitacao_id=solicitacao_rex.id,
        mensagem='Adotar o Rex foi a melhor decisão! Ele é muito companheiro e alegrou a casa toda.',
        nota=5,
        aprovado=True
    ))

    db.session.add(SiteImpactConfig(
        pets_offset=0,
        adoptions_offset=0,
        cities_offset=0,
        show_trust=True
    ))

    db.session.commit()
    print('Favoritos, feedbacks e métricas criados com sucesso.')

print('Seed finalizado!')
