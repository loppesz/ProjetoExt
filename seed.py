from app import app, db, Usuario

with app.app_context():
    db.create_all()

    if Usuario.query.count() == 0:
        admin = Usuario(name='Admin', email='admin@petadopt.com')
        admin.set_senha('123456')
        db.session.add(admin)
        db.session.commit()
        print('Usuário admin criado: admin@petadopt.com / 123456')
