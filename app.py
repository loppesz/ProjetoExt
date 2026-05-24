from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, Length
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'petadopt-2026'

# Configurar caminho do banco de dados
base_dir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(base_dir, 'instance', 'petadopt.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# Criar pasta de uploads se não existir
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Faça login para continuar...'

## Tabela de Usuários
class Usuario(UserMixin, db.Model):
    __tablename__ = 'usuario'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')

    def set_senha(self, senha):
        self.senha_hash = generate_password_hash(senha)

    def check_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)

    # backward-compatible aliases
    def set_password(self, senha):
        return self.set_senha(senha)

    def check_password(self, senha):
        return self.check_senha(senha)
    
## Tabela de pets
class Pet(db.Model):
    __tablename__ = 'pet'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)
    usuario = db.relationship('Usuario', backref='pets')
    nome = db.Column(db.String(80), nullable=False)
    especie = db.Column(db.String(20), nullable=False)  # 'dog' ou 'cat'
    raca = db.Column(db.String(80), nullable=True)
    porte = db.Column(db.String(20), nullable=False, default='medium')  # small, medium, large, giant
    sexo = db.Column(db.String(20), nullable=False, default='unknown')
    idade_anos = db.Column(db.Integer, default=0)
    idade_meses = db.Column(db.Integer, default=0)
    cor = db.Column(db.String(80), nullable=True)
    vacinado = db.Column(db.Boolean, default=False)
    castrado = db.Column(db.Boolean, default=False)
    descricao = db.Column(db.Text, nullable=True)
    cidade = db.Column(db.String(100), nullable=False)
    estado = db.Column(db.String(2), nullable=False)
    status = db.Column(db.String(20), default='available')  # available, reserved, adopted
    mod_status = db.Column(db.String(20), default='pending')  # pending, approved, removed
    foto_capa = db.Column(db.String(255), nullable=True)
    criado_em = db.Column(db.DateTime, default=db.func.now())

### Metodo que cria pet
@app.route('/api/pets', methods=['POST'])
@login_required
def criar_pet():
    try:
        # Coleta dados do formulário
        nome = request.form.get('nome', '').strip()
        especie = request.form.get('especie', '').strip()
        raca = request.form.get('raca', '').strip()
        porte = request.form.get('porte', '').strip()
        sexo = request.form.get('sexo', 'unknown').strip()
        idade_anos = request.form.get('idade_anos', 0, type=int)
        idade_meses = request.form.get('idade_meses', 0, type=int)
        cor = request.form.get('cor', '').strip()
        vacinado = request.form.get('vacinado', 0, type=int)
        castrado = request.form.get('castrado', 0, type=int)
        descricao = request.form.get('descricao', '').strip()
        cidade = request.form.get('cidade', '').strip()
        estado = request.form.get('estado', '').strip()
        
        # Validações obrigatórias
        if not nome or not especie or not cidade or not estado or not porte:
            return jsonify({'erro': 'Campos obrigatórios faltando'}), 400
        
        # Processa upload de foto
        foto_url = None
        if 'foto_capa' in request.files:
            arquivo = request.files['foto_capa']
            if arquivo and arquivo.filename:
                # Valida extensão
                ext_permitidas = {'png', 'jpg', 'jpeg', 'webp'}
                ext = arquivo.filename.rsplit('.', 1)[1].lower() if '.' in arquivo.filename else ''
                if ext not in ext_permitidas:
                    return jsonify({'erro': 'Formato de foto não permitido'}), 400
                
                # Salva arquivo com nome seguro
                timestamp = int(time.time())
                filename = secure_filename(f"{current_user.id}_{timestamp}_{arquivo.filename}")
                arquivo.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                foto_url = f'/static/uploads/{filename}'
        
        # Cria objeto Pet
        novo_pet = Pet(
            usuario_id=current_user.id,
            nome=nome,
            especie=especie,
            raca=raca,
            porte=porte,
            sexo=sexo,
            idade_anos=idade_anos,
            idade_meses=idade_meses,
            cor=cor,
            vacinado=bool(vacinado),
            castrado=bool(castrado),
            descricao=descricao,
            cidade=cidade,
            estado=estado,
            foto_capa=foto_url,
            mod_status='pending'
        )
        
        # Salva no banco
        db.session.add(novo_pet)
        db.session.commit()
        
        return jsonify({
            'sucesso': True,
            'pet_id': novo_pet.id,
            'mensagem': 'Pet cadastrado com sucesso!'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f'Erro ao cadastrar: {str(e)}'}), 500


## ROTA QUE RETORNA OS PETS
@app.route('/api/pets', methods=['GET'])
def listar_pets():
    # Com filtros opcionais
    especie = request.args.get('especie')
    porte = request.args.get('porte')
    estado = request.args.get('estado')
    cidade = request.args.get('cidade')
    search = request.args.get('search')
    
    query = Pet.query.filter_by(status='available', mod_status='approved')
    
    if especie:
        query = query.filter_by(especie=especie)
    if porte:
        query = query.filter_by(porte=porte)
    if estado:
        query = query.filter_by(estado=estado)
    if cidade:
        query = query.filter(Pet.cidade.ilike(f'%{cidade}%'))
    if search:
        query = query.filter(
            (Pet.nome.ilike(f'%{search}%')) | 
            (Pet.raca.ilike(f'%{search}%'))
        )
    
    pets = query.all()
    
    # Mapeamento de porte para label
    size_labels = {
        'small': 'Pequeno',
        'medium': 'Médio',
        'large': 'Grande',
        'giant': 'Gigante'
    }
    
    return jsonify({
        'pets': [
            {
                'id': p.id,
                'name': p.nome,
                'species': p.especie,
                'breed': p.raca,
                'age': f'{p.idade_anos} anos' if p.idade_anos else ('filhote' if p.idade_meses else 'filhote'),
                'size': p.porte,
                'sizeLabel': size_labels.get(p.porte, p.porte),
                'city': p.cidade,
                'state': p.estado,
                'photo': p.foto_capa,
                'status': p.status,
                'fav': False
            }
            for p in pets
        ]
    })


## ═════════════════════════════════════════════════════════════════════════════
## ROTAS DE MODERAÇÃO (ADMIN)
## ═════════════════════════════════════════════════════════════════════════════

from functools import wraps

# Decorator para verificar se é admin
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            return jsonify({'erro': 'Acesso negado. Apenas admins podem acessar.'}), 403
        return f(*args, **kwargs)
    return decorated_function

# GET - Estatísticas de moderação
@app.route('/api/admin/pets/stats', methods=['GET'])
@login_required
@admin_required
def stats_pets():
    try:
        pending = Pet.query.filter_by(mod_status='pending').count()
        approved = Pet.query.filter_by(mod_status='approved').count()
        removed = Pet.query.filter_by(mod_status='removed').count()
        
        return jsonify({
            'pending': pending,
            'approved': approved,
            'removed': removed
        }), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500


# GET - Listar pets pendentes de aprovação
@app.route('/api/admin/pets/pending', methods=['GET'])
@login_required
@admin_required
def listar_pets_pendentes():
    try:
        pets = Pet.query.filter_by(mod_status='pending').all()
        
        size_labels = {
            'small': 'Pequeno',
            'medium': 'Médio',
            'large': 'Grande',
            'giant': 'Gigante'
        }
        
        return jsonify({
            'pets': [
                {
                    'id': p.id,
                    'name': p.nome,
                    'species': p.especie,
                    'breed': p.raca,
                    'age': f'{p.idade_anos} anos' if p.idade_anos else 'filhote',
                    'size': p.porte,
                    'sizeLabel': size_labels.get(p.porte, p.porte),
                    'city': p.cidade,
                    'state': p.estado,
                    'photo': p.foto_capa,
                    'description': p.descricao,
                    'owner': p.usuario.name if p.usuario_id and p.usuario else 'Sem usuário',
                    'mod_status': p.mod_status
                }
                for p in pets
            ]
        })
    except Exception as e:
        print(f"Erro em listar_pets_pendentes: {e}")
        return jsonify({'erro': str(e)}), 500


# POST - Aprovar pet
@app.route('/api/admin/pets/<int:pet_id>/approve', methods=['POST'])
@login_required
@admin_required
def aprovar_pet(pet_id):
    try:
        pet = Pet.query.get(pet_id)
        if not pet:
            return jsonify({'erro': 'Pet não encontrado'}), 404
        
        pet.mod_status = 'approved'
        db.session.commit()
        
        return jsonify({
            'sucesso': True,
            'mensagem': f'Pet "{pet.nome}" foi aprovado!'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500


# POST - Remover/Rejeitar pet
@app.route('/api/admin/pets/<int:pet_id>/remove', methods=['POST'])
@login_required
@admin_required
def remover_pet(pet_id):
    try:
        pet = Pet.query.get(pet_id)
        if not pet:
            return jsonify({'erro': 'Pet não encontrado'}), 404
        
        pet.mod_status = 'removed'
        db.session.commit()
        
        return jsonify({
            'sucesso': True,
            'mensagem': f'Pet "{pet.nome}" foi removido.'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(Usuario, int(user_id))

# GET - Dados do usuário logado
@app.route('/api/user', methods=['GET'])
@login_required
def get_user():
    return jsonify({
        'id': current_user.id,
        'name': current_user.name,
        'email': current_user.email,
        'role': current_user.role
    })

# GET - Meus Pets (do usuário logado)
@app.route('/api/user/pets', methods=['GET'])
@login_required
def get_my_pets():
    try:
        print(f"DEBUG: current_user.id = {current_user.id}, name = {current_user.name}")
        pets = Pet.query.filter_by(usuario_id=current_user.id).all()
        print(f"DEBUG: Encontrados {len(pets)} pets para o usuário {current_user.id}")
        
        size_labels = {
            'small': 'Pequeno',
            'medium': 'Médio',
            'large': 'Grande',
            'giant': 'Gigante'
        }
        
        return jsonify({
            'pets': [
                {
                    'id': p.id,
                    'name': p.nome,
                    'breed': p.raca,
                    'species': p.especie,
                    'size': p.porte,
                    'sizeLabel': size_labels.get(p.porte, p.porte),
                    'city': p.cidade,
                    'state': p.estado,
                    'photo': p.foto_capa,
                    'status': p.status,
                    'modStatus': p.mod_status
                }
                for p in pets
            ]
        }), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# PATCH - Atualizar status do pet
@app.route('/api/pets/<int:pet_id>/status', methods=['PATCH'])
@login_required
def update_pet_status(pet_id):
    try:
        pet = Pet.query.get(pet_id)
        if not pet:
            return jsonify({'erro': 'Pet não encontrado'}), 404
        
        # Verificar se é o dono
        if pet.usuario_id != current_user.id:
            return jsonify({'erro': 'Você não pode modificar este pet'}), 403
        
        new_status = request.json.get('status')
        if new_status not in ['available', 'reserved', 'adopted']:
            return jsonify({'erro': 'Status inválido'}), 400
        
        pet.status = new_status
        db.session.commit()
        
        return jsonify({'sucesso': True, 'mensagem': f'Status atualizado para {new_status}'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

# PUT - Editar pet
@app.route('/api/pets/<int:pet_id>', methods=['PUT'])
@login_required
def update_pet(pet_id):
    try:
        pet = Pet.query.get(pet_id)
        if not pet:
            return jsonify({'erro': 'Pet não encontrado'}), 404
        
        # Verificar se é o dono
        if pet.usuario_id != current_user.id:
            return jsonify({'erro': 'Você não pode modificar este pet'}), 403
        
        # Atualizar campos
        name = request.json.get('name', '').strip()
        city = request.json.get('city', '').strip()
        state = request.json.get('state', '').strip().upper()
        
        if not name or not city or not state:
            return jsonify({'erro': 'Nome, cidade e estado são obrigatórios'}), 400
        
        pet.nome = name
        pet.raca = request.json.get('breed', '').strip()
        pet.cidade = city
        pet.estado = state
        pet.descricao = request.json.get('description', '')
        
        db.session.commit()
        
        return jsonify({'sucesso': True, 'mensagem': 'Pet atualizado com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Erro em update_pet: {e}")
        return jsonify({'erro': str(e)}), 500

# DELETE - Remover pet
@app.route('/api/pets/<int:pet_id>', methods=['DELETE'])
@login_required
def delete_pet(pet_id):
    try:
        pet = Pet.query.get(pet_id)
        if not pet:
            return jsonify({'erro': 'Pet não encontrado'}), 404
        
        # Verificar se é o dono
        if pet.usuario_id != current_user.id:
            return jsonify({'erro': 'Você não pode remover este pet'}), 403
        
        pet_name = pet.nome
        db.session.delete(pet)
        db.session.commit()
        
        return jsonify({'sucesso': True, 'mensagem': f'{pet_name} foi removido'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@app.route('/')
def index():
    return render_template('index.html')

class LoginForm(FlaskForm):
    email = StringField('E-mail', validators=[DataRequired(), Email()])
    senha = PasswordField('Senha', validators=[DataRequired(), Length(min=6)])
    submit = SubmitField('Entrar')


@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        usuario = Usuario.query.filter_by(email=form.email.data).first()
        if usuario and usuario.check_senha(form.senha.data):
            login_user(usuario)
            return redirect(url_for('dashboard'))
        flash('E-mail ou senha Inválidos.', 'erro')
    return render_template('login.html', form=form, titulo='Login')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/pets')
def pets():
    return render_template('pets.html')

@app.route('/pet/<int:pet_id>')
def pet(pet_id):
    return render_template('pet.html', pet_id=pet_id)

@app.route('/new-pet')
def new_pet():
    return render_template('new-pet.html')

@app.route('/ongs')
def ongs():
    return render_template('ongs.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/sobre')
def sobre():
    return render_template('sobre.html')

if __name__ == '__main__':
    app.run(debug=True)