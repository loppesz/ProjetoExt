from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

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
def dashboard():
    return render_template('dashboard.html')

@app.route('/sobre')
def sobre():
    return render_template('sobre.html')

if __name__ == '__main__':
    app.run(debug=True)