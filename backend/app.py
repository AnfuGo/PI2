# FERRAMENTA EDUCACIONAL ORIENTATIVA PARA ALUNOS DE GRADUAÇÃO
# NA DISCIPLINA DE MANUFATURA INTEGRADA DA UTFPR

import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
from modules.analyser import analisar_arquivo_grafcet

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'xml'}

app = Flask(__name__)
CORS(app)  # permite acesso do GitHub Pages

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# =========================
# UTIL
# =========================
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# =========================
# HEALTH CHECK (opcional)
# =========================
@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "message": "API GRAFCET funcionando"
    })

# =========================
# ENDPOINT PRINCIPAL
# =========================
@app.route('/analisar', methods=['POST'])
def analisar():

    # -------------------------
    # validação
    # -------------------------
    if 'file' not in request.files:
        return jsonify({
            "success": False,
            "error": "Nenhum arquivo enviado"
        }), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({
            "success": False,
            "error": "Nome de arquivo inválido"
        }), 400

    if not allowed_file(file.filename):
        return jsonify({
            "success": False,
            "error": "Extensão inválida. Use .xml"
        }), 400

    # -------------------------
    # processamento
    # -------------------------
    filename = secure_filename(file.filename)
    caminho_arquivo = os.path.join(app.config['UPLOAD_FOLDER'], filename)

    try:
        file.save(caminho_arquivo)

        resultado_da_analise = analisar_arquivo_grafcet(caminho_arquivo)

        return jsonify({
            "success": True,
            "filename": filename,
            "resultado": resultado_da_analise
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro ao processar arquivo: {str(e)}"
        }), 500

# =========================
# ERRO: arquivo grande
# =========================
@app.errorhandler(413)
def too_large(e):
    return jsonify({
        "success": False,
        "error": "Arquivo muito grande (máx 16MB)"
    }), 413

# =========================
# RUN
# =========================
if __name__ == '__main__':
    app.run(debug=True)