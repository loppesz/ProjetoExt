from app import app, db, Usuario

print('Iniciando seed...')

with app.app_context():
    print('App context ativo')
    db.create_all()
    print('Tabelas criadas')

    if Usuario.query.count() == 0:
        admin = Usuario(name='Admin', email='admin@petadopt.com')
        admin.set_senha('123456')
        db.session.add(admin)
        db.session.commit()
        print('Usuário admin criado: admin@petadopt.com / 123456')
    else:
        print(f'Usuários já existem: {Usuario.query.count()}')

print('Seed finalizado!')
