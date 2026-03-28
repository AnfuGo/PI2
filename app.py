# FERRAMENTA EDUCACIONAL ORIENTATIVA PARA ALUNOS DE GRADUAÇÃO
# NA DISCIPLINA DE MANUFATURA INTEGRADA DA UTFPR
#     Copyright (C) 2025
# Alunos: Jhulia Andrade de Souza Nogueira e Henrique Marques Dias Chaves
# Orientador: Prof. Dr. Sidney Carlos Gasoto
# Banca: Prof. Dr. Luiz Carlos de Abreu Rodrigues e Prof. Dr. Márcio Alves Sodré de Souza
# Palavras-chave: manufatura integrada; programação de CLPs; interface de usuário; ferramenta educacional.
# Data da defesa: 27/11/2025

import os
from flask import Flask, jsonify, request, redirect, url_for, flash
from flask_cors import CORS
from werkzeug.utils import secure_filename
from modules.analyser import analisar_arquivo_grafcet

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'xml'}

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'sua-chave-secreta-aqui')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limite de 16MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analisar', methods=['POST'])
def analisar():
    if 'file' not in request.files:
        flash('Nenhum arquivo foi selecionado', 'error')
        return redirect(url_for('index'))
    
    file = request.files['file']
    
    if file.filename == '':
        flash('Nenhum arquivo foi selecionado', 'error')
        return redirect(url_for('index'))
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        caminho_arquivo = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        try:
            file.save(caminho_arquivo)
            resultado_da_analise = analisar_arquivo_grafcet(caminho_arquivo)
            return jsonify({
                "resultado": resultado_da_analise,
                "filename": filename
            })
        except Exception as e:
            flash(f'Erro ao processar arquivo: {str(e)}', 'error')
            return redirect(url_for('index'))
    else:
        flash('Extensão de arquivo não permitida! Use apenas arquivos .xml', 'error')
        return redirect(url_for('index'))

@app.errorhandler(413)
def too_large(e):
    flash('Arquivo muito grande! O tamanho máximo é 16MB', 'error')
    return redirect(url_for('index'))
