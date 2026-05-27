from app import app, db, Usuario, Pet, Ong, SolicitacaoAdocao, Feedback

print('Iniciando seed...')

with app.app_context():
    print('App context ativo')
    
    # Força a exclusão do banco de dados antigo
    db.drop_all()
    print('Banco de dados antigo apagado com sucesso!')
    
    db.create_all()
    print('Tabelas criadas com a nova estrutura')

    # 1. Criar o Admin
    admin = Usuario(name='Admin PetAdopt', email='admin@petadopt.com', role='admin')
    admin.set_senha('123456')
    db.session.add(admin)
    
    # 2. Criar Usuários de Exemplo
    maria = Usuario(name='Maria Silva', email='maria@email.com', role='user', cidade='São Paulo', estado='SP')
    maria.set_senha('123456')
    db.session.add(maria)
    
    carlos = Usuario(name='Carlos Lima', email='carlos@email.com', role='user', cidade='Rio de Janeiro', estado='RJ')
    carlos.set_senha('123456')
    db.session.add(carlos)
    
    # 2.5 Criar Contas para as ONGs
    user_ong1 = Usuario(name='Patinhas do Bem', email='ong1@petadopt.com', role='ong', cidade='São Paulo', estado='SP')
    user_ong1.set_senha('123456')
    db.session.add(user_ong1)
    
    user_ong2 = Usuario(name='Amicão Muriaé', email='ong2@petadopt.com', role='ong', cidade='Muriaé', estado='RJ')
    user_ong2.set_senha('123456')
    db.session.add(user_ong2)
    
    user_ong3 = Usuario(name='Amigos de Patas', email='ong3@petadopt.com', role='ong', cidade='Belo Horizonte', estado='MG')
    user_ong3.set_senha('123456')
    db.session.add(user_ong3)
    
    user_ong4 = Usuario(name='Refúgio Animal Sul', email='ong4@petadopt.com', role='ong', cidade='Porto Alegre', estado='RS')
    user_ong4.set_senha('123456')
    db.session.add(user_ong4)

    db.session.commit()
    print('Usuários e Contas de ONGs criados com sucesso (Senha padrão: 123456)')

    # 3. Criar Pets de Exemplo (já aprovados para aparecerem na Home)
    pet1 = Pet(
        usuario_id=user_ong1.id, nome='Tarzam', especie='dog', raca='SRD (Vira-lata)', porte='small', sexo='male',
        idade_anos=2, idade_meses=0, cor='Caramelo', vacinado=True, castrado=True,
        descricao='Tarzam é carinhoso e brincalhão. Adora um cafuné e passeios no parque.', 
        cidade='São Paulo', estado='SP', status='available', mod_status='approved', 
        foto_capa='https://images.unsplash.com/photo-1552053831-71594a27632d?w=800'
    )
    
    pet2 = Pet(
        usuario_id=user_ong2.id, nome='Luna', especie='cat', raca='Siamês', porte='small', sexo='female',
        idade_anos=1, idade_meses=6, cor='Creme', vacinado=True, castrado=False,
        descricao='Luna é muito elegante e independente. Ideal para apartamento.', 
        cidade='Muriaé', estado='RJ', status='available', mod_status='approved', 
        foto_capa='https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800'
    )
    
    pet3 = Pet(
        usuario_id=user_ong3.id, nome='Bob', especie='dog', raca='SRD (Vira-lata)', porte='medium', sexo='male',
        idade_anos=3, idade_meses=0, cor='Caramelo', vacinado=True, castrado=True,
        descricao='Bob é muito dócil, obediente e ama crianças.', 
        cidade='Belo Horizonte', estado='MG', status='available', mod_status='approved', 
        foto_capa='https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800'
    )
    
    pet4 = Pet(
        usuario_id=user_ong3.id, nome='Mia', especie='cat', raca='Persa', porte='small', sexo='female',
        idade_anos=0, idade_meses=8, cor='Branco', vacinado=True, castrado=False,
        descricao='Mia é tranquila e adora colos.', 
        cidade='Belo Horizonte', estado='MG', status='available', mod_status='approved', 
        foto_capa='https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800'
    )
    
    pet5 = Pet(
        usuario_id=user_ong4.id, nome='Rex', especie='dog', raca='Pastor Alemão', porte='large', sexo='male',
        idade_anos=4, idade_meses=0, cor='Preto e marrom', vacinado=True, castrado=True,
        descricao='Rex foi adotado com sucesso!', 
        cidade='Porto Alegre', estado='RS', status='adopted', mod_status='approved', 
        foto_capa='https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800'
    )
    
    pet6 = Pet(
        usuario_id=user_ong1.id, nome='Nina', especie='dog', raca='Poodle', porte='small', sexo='female',
        idade_anos=1, idade_meses=0, cor='Branco', vacinado=False, castrado=False,
        descricao='Nina é cheia de energia e alegria.', 
        cidade='São Paulo', estado='SP', status='available', mod_status='approved', 
        foto_capa='https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800'
    )
    
    pet7 = Pet(
        usuario_id=user_ong4.id, nome='Mel', especie='cat', raca='Maine Coon', porte='small', sexo='female',
        idade_anos=3, idade_meses=0, cor='Cinza rajado', vacinado=True, castrado=True,
        descricao='Mel é dócil e convive bem com crianças.', 
        cidade='Porto Alegre', estado='RS', status='available', mod_status='pending', 
        foto_capa='https://images.unsplash.com/photo-1513245543132-31f507417b26?w=800'
    )
    
    pet8 = Pet(
        usuario_id=user_ong2.id, nome='Duque', especie='dog', raca='Labrador', porte='large', sexo='male',
        idade_anos=2, idade_meses=0, cor='Caramelo', vacinado=True, castrado=False,
        descricao='Duque é jovem e muito brincalhão.', 
        cidade='Muriaé', estado='RJ', status='available', mod_status='pending', 
        foto_capa='https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800'
    )
    
    # 4. Criar ONGs de Exemplo
    ong1 = Ong(
        usuario_id=user_ong1.id, nome='Patinhas do Bem', cidade='São Paulo', estado='SP',
        descricao='Resgatamos e reabilitamos cães e gatos em situação de rua desde 2015. Já realizamos mais de 300 adoções responsáveis.',
        descricao_completa='A Patinhas do Bem atua há mais de 9 anos no resgate, reabilitação e adoção responsável de animais em situação de vulnerabilidade na Grande São Paulo. Contamos com uma rede de lares temporários e parceiros veterinários que garantem o bem-estar de cada animal até encontrar um lar definitivo.',
        whatsapp='5511999990001', pets_count=12, adopted_count=320, donations_count=4800,
        foto_url='https://images.unsplash.com/photo-1601758124096-7093b3fef44d?w=600&q=80',
        chave_pix='patinhasdob@gmail.com', link_vakinha='https://www.vakinha.com.br', status='approved'
    )
    
    ong2 = Ong(
        usuario_id=user_ong2.id, nome='Amicão Muriaé', cidade='Muriaé', estado='RJ',
        descricao='ONG dedicada ao resgate de animais abandonados no Rio de Janeiro. Atuamos com castração, vacinação e adoção.',
        descricao_completa='O Amicão Muriaé é uma organização sem fins lucrativos que atua em Muriaé há 7 anos. Nosso trabalho inclui resgate de emergência, cuidados veterinários, castração e vacinação subsidiada, além de um programa de adoção responsável com acompanhamento pós-adoção.',
        whatsapp='5521999990002', pets_count=8, adopted_count=185, donations_count=3200,
        foto_url='https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
        chave_pix='amicãomuriae@gmail.com', link_vakinha='https://www.vakinha.com.br', status='approved'
    )
    
    ong3 = Ong(
        usuario_id=user_ong3.id, nome='Amigos de Patas', cidade='Belo Horizonte', estado='MG',
        descricao='Cuidamos de animais especiais — idosos, com deficiência e vítimas de maus-tratos. Cada vida importa para nós.',
        descricao_completa='A Amigos de Patas se especializa no cuidado de animais com necessidades especiais: idosos, com deficiências físicas ou sequelas de maus-tratos. Acreditamos que todo animal merece uma segunda chance, independente de sua condição. Trabalhamos com adoção consciente e educação sobre guarda responsável.',
        whatsapp='5531999990003', pets_count=15, adopted_count=210, donations_count=5600,
        foto_url='https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80',
        chave_pix='amigospatinhas@gmail.com', link_vakinha='https://www.vakinha.com.br', status='approved'
    )
    
    ong4 = Ong(
        usuario_id=user_ong4.id, nome='Refúgio Animal Sul', cidade='Porto Alegre', estado='RS',
        descricao='Atuamos no sul do Brasil com foco em animais de grande porte. Temos um abrigo com capacidade para 50 animais.',
        descricao_completa='O Refúgio Animal Sul é o maior abrigo de animais do Rio Grande do Sul, com capacidade para 50 animais. Focamos especialmente em cães de grande porte, que têm mais dificuldade de adoção. Nosso abrigo conta com área verde, veterinário residente e equipe de voluntários dedicados.',
        whatsapp='5551999990004', pets_count=22, adopted_count=140, donations_count=2900,
        foto_url='https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80',
        chave_pix='refugioanimalsul@gmail.com', link_vakinha='https://www.vakinha.com.br', status='approved'
    )
    
    db.session.add_all([pet1, pet2, pet3, pet4, pet5, pet6, pet7, pet8])
    db.session.add_all([ong1, ong2, ong3, ong4])
    db.session.commit()
    print('Pets de exemplo inseridos com sucesso!')

    # 5. Criar Adoção e Feedback de Exemplo
    adocao_rex = SolicitacaoAdocao(pet_id=pet5.id, solicitante_id=maria.id, mensagem="Quero muito adotar o Rex!", status="approved")
    db.session.add(adocao_rex)
    db.session.commit()

    feedback_rex = Feedback(solicitacao_id=adocao_rex.id, mensagem="Adotar o Rex foi a melhor decisão! Ele é muito companheiro e alegrou a casa toda.", nota=5)
    db.session.add(feedback_rex)
    db.session.commit()
    print('Feedbacks de exemplo inseridos com sucesso!')

print('Seed finalizado!')
