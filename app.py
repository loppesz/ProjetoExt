from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
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
    telefone = db.Column(db.String(20), nullable=True)
    cidade = db.Column(db.String(100), nullable=True)
    estado = db.Column(db.String(2), nullable=True)

    def set_senha(self, senha):
        self.senha_hash = generate_password_hash(senha)

    def check_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)

    # backward-compatible aliases
    def set_password(self, senha):
        return self.set_senha(senha)

    def check_password(self, senha):
        return self.check_senha(senha)
    
## Tabela de ONGs
class Ong(db.Model):
    __tablename__ = 'ong'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)
    nome = db.Column(db.String(120), nullable=False)
    descricao = db.Column(db.String(255), nullable=True)
    descricao_completa = db.Column(db.Text, nullable=True)
    cidade = db.Column(db.String(100), nullable=True)
    estado = db.Column(db.String(2), nullable=True)
    whatsapp = db.Column(db.String(20), nullable=True)
    chave_pix = db.Column(db.String(120), nullable=True)
    link_vakinha = db.Column(db.String(255), nullable=True)
    foto_url = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    pets_count = db.Column(db.Integer, default=0)
    adopted_count = db.Column(db.Integer, default=0)
    donations_count = db.Column(db.Float, default=0.0)

## Tabela de Solicitações de Adoção
class SolicitacaoAdocao(db.Model):
    __tablename__ = 'solicitacao_adocao'
    id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(db.Integer, db.ForeignKey('pet.id'), nullable=False)
    solicitante_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    mensagem = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='pending') # pending, approved, rejected, cancelled
    criado_em = db.Column(db.DateTime, default=db.func.now())
    pet = db.relationship('Pet', backref='solicitacoes')
    solicitante = db.relationship('Usuario', backref='solicitacoes_feitas')

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
            mod_status='approved'
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
    
    if current_user.is_authenticated:
        query = Pet.query.filter((Pet.mod_status == 'approved') | (Pet.usuario_id == current_user.id))
    else:
        query = Pet.query.filter_by(mod_status='approved')
    
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
    
    pets_data = []
    for p in pets:
        owner_name = 'Tutor Parceiro'
        if p.usuario:
            if p.usuario.role == 'ong':
                ong = Ong.query.filter_by(usuario_id=p.usuario.id).first()
                owner_name = ong.nome if ong else p.usuario.name
            else:
                owner_name = p.usuario.name
                
        pets_data.append({
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
            'fav': False,
            'ownerName': owner_name
        })
        
    return jsonify({'pets': pets_data})

## ROTA QUE RETORNA AS ONGS
@app.route('/api/ongs', methods=['GET'])
def listar_ongs():
    ongs = Ong.query.filter_by(status='approved').all()
    return jsonify({
        'ongs': [
            {
                'id': str(o.id),
                'name': o.nome,
                'city': o.cidade,
                'state': o.estado,
                'desc': o.descricao,
                'descFull': o.descricao_completa,
                'whatsapp': o.whatsapp,
                'pets': o.pets_count,
                'adopted': o.adopted_count,
                'donations': o.donations_count,
                'photo': o.foto_url,
                'pix': o.chave_pix,
                'vakinha': o.link_vakinha
            } for o in ongs
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
        total_pets = Pet.query.count()
        total_ongs = Ong.query.count()
        
        return jsonify({
            'pending': pending,
            'approved': approved,
            'removed': removed,
            'total_pets': total_pets,
            'total_ongs': total_ongs
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


# GET - Listar ONGs pendentes
@app.route('/api/admin/ongs/pending', methods=['GET'])
@login_required
@admin_required
def listar_ongs_pendentes():
    try:
        ongs = Ong.query.filter_by(status='pending').all()
        return jsonify({
            'ongs': [{
                'id': o.id,
                'name': o.nome,
                'city': o.cidade,
                'state': o.estado,
                'desc': o.descricao,
                'whatsapp': o.whatsapp,
                'photo': o.foto_url
            } for o in ongs]
        })
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# POST - Aprovar ONG
@app.route('/api/admin/ongs/<int:ong_id>/approve', methods=['POST'])
@login_required
@admin_required
def aprovar_ong(ong_id):
    ong = Ong.query.get_or_404(ong_id)
    ong.status = 'approved'
    db.session.commit()
    return jsonify({'sucesso': True, 'mensagem': f'ONG "{ong.nome}" foi aprovada!'})

# POST - Recusar ONG
@app.route('/api/admin/ongs/<int:ong_id>/reject', methods=['POST'])
@login_required
@admin_required
def recusar_ong(ong_id):
    ong = Ong.query.get_or_404(ong_id)
    ong.status = 'rejected'
    db.session.commit()
    return jsonify({'sucesso': True, 'mensagem': f'ONG "{ong.nome}" foi recusada.'})

# POST - Criar Nova ONG (Apenas Admin)
@app.route('/api/ongs', methods=['POST'])
@login_required
@admin_required
def criar_ong():
    try:
        data = request.get_json()
        nome = data.get('nome')
        cidade = data.get('cidade')
        estado = data.get('estado')
        
        if not nome or not cidade or not estado:
            return jsonify({'erro': 'Nome, cidade e estado são obrigatórios'}), 400
            
        nova_ong = Ong(
            nome=nome,
            cidade=cidade,
            estado=estado,
            descricao=data.get('descricao', ''),
            whatsapp=data.get('whatsapp', ''),
            chave_pix=data.get('chave_pix', ''),
            foto_url=data.get('foto_url') or 'https://images.unsplash.com/photo-1601758124096-7093b3fef44d?w=600&q=80'
        )
        db.session.add(nova_ong)
        db.session.commit()
        return jsonify({'sucesso': True, 'mensagem': f'ONG {nome} cadastrada!'}), 201
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

# GET - Minhas Adoções (Solicitações que eu enviei)
@app.route('/api/user/adocoes', methods=['GET'])
@login_required
def get_user_adocoes():
    try:
        sols = SolicitacaoAdocao.query.filter_by(solicitante_id=current_user.id).all()
        return jsonify({'adocoes': [{
            'id': s.id,
            'petId': s.pet.id if s.pet else 0,
            'petName': s.pet.nome if s.pet else 'Pet Removido',
            'petBreed': s.pet.raca if s.pet else '',
            'city': s.pet.cidade if s.pet else '',
            'photo': s.pet.foto_capa if s.pet else 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
            'status': s.status,
            'date': s.criado_em.strftime('%d/%m/%Y') if s.criado_em else 'Recente'
        } for s in sols]}), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# GET - Pedidos Recebidos (Solicitações para pets que eu cadastrei)
@app.route('/api/user/solicitacoes', methods=['GET'])
@login_required
def get_user_solicitacoes():
    try:
        pets = Pet.query.filter_by(usuario_id=current_user.id).all()
        pet_ids = [p.id for p in pets]
        sols = SolicitacaoAdocao.query.filter(SolicitacaoAdocao.pet_id.in_(pet_ids)).all()
        return jsonify({'solicitacoes': [{
            'id': s.id,
            'petName': s.pet.nome if s.pet else 'Pet Removido',
            'from': s.solicitante.name if s.solicitante else 'Usuário Removido',
            'msg': s.mensagem,
            'status': s.status,
            'phone': s.solicitante.telefone or 'Não informado' if s.solicitante else '',
            'city': s.solicitante.cidade or 'Não informada' if s.solicitante else ''
        } for s in sols]}), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# POST - Cancelar Solicitação (Feita por mim)
@app.route('/api/user/solicitacao/<int:req_id>/cancel', methods=['POST'])
@login_required
def user_cancel_solicitacao(req_id):
    s = SolicitacaoAdocao.query.get(req_id)
    if not s or s.solicitante_id != current_user.id:
        return jsonify({'erro': 'Acesso negado'}), 403
    db.session.delete(s)
    db.session.commit()
    return jsonify({'sucesso': True})

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

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
        
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            email = data.get('email')
            senha = data.get('password')
        else:
            email = request.form.get('email')
            senha = request.form.get('password')
            
        usuario = Usuario.query.filter_by(email=email).first()
        if usuario and usuario.check_senha(senha):
            login_user(usuario) # Cria a sessão oficial do Flask
            if request.is_json:
                return jsonify({
                    'message': 'Login realizado com sucesso!', 
                    'role': usuario.role,
                    'name': usuario.name,
                    'email': usuario.email
                }), 200
            return redirect(url_for('dashboard'))
            
        if request.is_json:
            return jsonify({'message': 'E-mail ou senha inválidos.'}), 401
        flash('E-mail ou senha Inválidos.', 'erro')
        
    return render_template('login.html', titulo='Login')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
        
    if request.method == 'POST':
        try:
            data = request.get_json()
            nome = data.get('name')
            email = data.get('email')
            senha = data.get('password')
            
            # Validações básicas
            if not nome or not email or not senha:
                return jsonify({'message': 'Preencha todos os campos obrigatórios.'}), 400
                
            # Verifica se o email já existe no banco
            if Usuario.query.filter_by(email=email).first():
                return jsonify({'message': 'Este e-mail já está em uso.'}), 400
                
            # Cria um novo usuário com os dados do JSON
            novo_usuario = Usuario(
                name=nome,
                email=email,
                telefone=data.get('phone'),
                cidade=data.get('city'),
                estado=data.get('state'),
                role=data.get('role', 'user')
            )
            novo_usuario.set_senha(senha)
            db.session.add(novo_usuario)
            db.session.flush() # Gerar ID do usuário antes do commit
            
            if novo_usuario.role == 'ong':
                nova_ong = Ong(
                    usuario_id=novo_usuario.id,
                    nome=data.get('ong_nome') or nome,
                    cidade=data.get('city'),
                    estado=data.get('state'),
                    whatsapp=data.get('phone', '')
                )
                db.session.add(nova_ong)
                
            db.session.commit()
            login_user(novo_usuario) # Faz o login automático logo após criar a conta
            
            return jsonify({'message': 'Conta criada com sucesso!'}), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Erro ao criar conta: {str(e)}'}), 500
            
    return render_template('register.html')

@app.route('/pets')
def pets():
    return render_template('pets.html')

@app.route('/pet/<int:pet_id>')
def pet(pet_id):
    return render_template('pet.html', pet_id=pet_id)

@app.route('/new-pet')
@login_required
def new_pet():
    return render_template('new-pet.html')

@app.route('/ongs')
def ongs():
    return render_template('ongs.html')

@app.route('/ong/<int:ong_id>')
def ong_perfil(ong_id):
    ong = Ong.query.get_or_404(ong_id)
    pets = Pet.query.filter_by(usuario_id=ong.usuario_id, status='available', mod_status='approved').all() if ong.usuario_id else []
    return render_template('ong-perfil.html', ong=ong, pets=pets)

@app.route('/dashboard')
@login_required
def dashboard():
    if current_user.role == 'ong':
        return redirect(url_for('dashboard_ong'))
    return render_template('dashboard.html')

@app.route('/dashboard-ong')
@login_required
def dashboard_ong():
    if current_user.role != 'ong':
        return redirect(url_for('index'))
        
    ong = Ong.query.filter_by(usuario_id=current_user.id).first()
    if not ong or ong.status != 'approved':
        status = ong.status if ong else 'pending'
        return render_template('ong-pendente.html', status=status)
        
    return render_template('dashboard-ong.html', ong=ong)

@app.route('/api/ong/meus-pets', methods=['GET'])
@login_required
def api_ong_meus_pets():
    if current_user.role != 'ong':
        return jsonify({'erro': 'Acesso negado'}), 403
    pets = Pet.query.filter_by(usuario_id=current_user.id).all()
    return jsonify({'pets': [{'id': p.id, 'name': p.nome, 'status': p.status} for p in pets]})

@app.route('/api/ong/solicitacoes', methods=['GET'])
@login_required
def api_ong_solicitacoes():
    if current_user.role != 'ong':
        return jsonify({'erro': 'Acesso negado'}), 403
    pets = Pet.query.filter_by(usuario_id=current_user.id).all()
    pet_ids = [p.id for p in pets]
    solicitacoes = SolicitacaoAdocao.query.filter(SolicitacaoAdocao.pet_id.in_(pet_ids)).all()
    return jsonify({'solicitacoes': [{
        'id': s.id, 'petName': s.pet.nome, 'solicitanteName': s.solicitante.name,
        'mensagem': s.mensagem, 'status': s.status
    } for s in solicitacoes]})

@app.route('/api/ong/pet/<int:pet_id>/marcar-adotado', methods=['POST'])
@login_required
def api_ong_marcar_adotado(pet_id):
    if current_user.role != 'ong':
        return jsonify({'erro': 'Acesso negado'}), 403
    pet = Pet.query.get(pet_id)
    if not pet or pet.usuario_id != current_user.id:
        return jsonify({'erro': 'Pet não encontrado'}), 404
    pet.status = 'adopted'
    db.session.commit()
    return jsonify({'sucesso': True})

@app.route('/api/ong/perfil', methods=['GET', 'POST'])
@login_required
def api_ong_perfil():
    if current_user.role != 'ong':
        return jsonify({'erro': 'Acesso negado'}), 403
        
    ong = Ong.query.filter_by(usuario_id=current_user.id).first()
    if not ong:
        return jsonify({'erro': 'ONG não encontrada'}), 404
        
    # Se for GET, retorna os dados para preencher o formulário
    if request.method == 'GET':
        return jsonify({
            'nome': ong.nome, 'cidade': ong.cidade, 'estado': ong.estado,
            'whatsapp': ong.whatsapp, 'chave_pix': ong.chave_pix,
            'descricao': ong.descricao, 'descricao_completa': ong.descricao_completa,
            'foto_url': ong.foto_url
        })
        
    # Se for POST, salva as alterações
    try:
        ong.nome = request.form.get('nome', ong.nome).strip()
        ong.cidade = request.form.get('cidade', ong.cidade).strip()
        ong.estado = request.form.get('estado', ong.estado).strip().upper()
        ong.whatsapp = request.form.get('whatsapp', ong.whatsapp).strip()
        ong.chave_pix = request.form.get('chave_pix', ong.chave_pix).strip()
        ong.descricao = request.form.get('descricao', ong.descricao).strip()
        ong.descricao_completa = request.form.get('descricao_completa', ong.descricao_completa).strip()
        
        # Se a ONG enviou uma nova foto
        if 'foto' in request.files:
            arquivo = request.files['foto']
            if arquivo and arquivo.filename:
                ext_permitidas = {'png', 'jpg', 'jpeg', 'webp'}
                ext = arquivo.filename.rsplit('.', 1)[1].lower() if '.' in arquivo.filename else ''
                if ext in ext_permitidas:
                    timestamp = int(time.time())
                    filename = secure_filename(f"ong_{ong.id}_{timestamp}_{arquivo.filename}")
                    arquivo.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                    ong.foto_url = f'/static/uploads/{filename}'
        
        db.session.commit()
        return jsonify({'sucesso': True, 'mensagem': 'Perfil atualizado com sucesso!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f'Erro ao atualizar: {str(e)}'}), 500

@app.route('/api/ong/solicitacao/<int:req_id>/status', methods=['POST'])
@login_required
def api_ong_solicitacao_status(req_id):
    if current_user.role != 'ong':
        return jsonify({'erro': 'Acesso negado'}), 403
    solicitacao = SolicitacaoAdocao.query.get(req_id)
    if not solicitacao or solicitacao.pet.usuario_id != current_user.id:
        return jsonify({'erro': 'Solicitação não encontrada'}), 404
    data = request.get_json()
    solicitacao.status = data.get('status', solicitacao.status)
    db.session.commit()
    return jsonify({'sucesso': True})

@app.route('/api/pets/<int:pet_id>/solicitar', methods=['POST'])
@login_required
def solicitar_adocao(pet_id):
    try:
        pet = Pet.query.get(pet_id)
        if not pet:
            return jsonify({'erro': 'Pet não encontrado'}), 404
            
        if pet.usuario_id == current_user.id:
            return jsonify({'erro': 'Você não pode adotar seu próprio pet.'}), 400
            
        existente = SolicitacaoAdocao.query.filter_by(pet_id=pet_id, solicitante_id=current_user.id).first()
        if existente:
            return jsonify({'erro': 'Você já enviou uma solicitação para este pet. Aguarde o retorno.'}), 400
            
        data = request.get_json()
        mensagem = data.get('mensagem', '').strip()
        
        nova_solicitacao = SolicitacaoAdocao(
            pet_id=pet_id,
            solicitante_id=current_user.id,
            mensagem=mensagem
        )
        db.session.add(nova_solicitacao)
        db.session.commit()
        
        return jsonify({'sucesso': True}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/sobre')
def sobre():
    return render_template('sobre.html')

@app.after_request
def add_header(response):
    # Força o navegador a sempre recarregar o HTML para atualizar o status de login
    if 'text/html' in response.headers.get('Content-Type', ''):
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '-1'
    return response

if __name__ == '__main__':
    app.run(debug=True)