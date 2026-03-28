const API_URL = "https://pi2-production.up.railway.app";

// =======================
// NAVEGAÇÃO
// =======================
function goIndex() {
    window.location.href = "index.html";
}

// =======================
// RESULTADO
// =======================
function preencherResultado(data) {

    document.getElementById("filename").innerText = data.filename;

    if (!data.success) {
        document.getElementById("errorBox").innerHTML = `
            <div class="error-card">
                <div class="error-icon">❌</div>
                <h2>Erro ao Processar Arquivo</h2>
                <p>${data.resultado.error}</p>
            </div>
        `;
        return;
    }

    const resultados = data.resultados;

    let success = 0, warning = 0, error = 0;

    resultados.forEach(r => {
        if (r.status === "success") success++;
        else if (r.status === "warning") warning++;
        else error++;
    });

    // resumo
    let resumo = "";

    if (error === 0 && warning === 0) {
        resumo = `<div class="summary-card"><h3>🎉 Perfeito!</h3></div>`;
    } else if (error === 0) {
        resumo = `<div class="summary-card"><h3>⚠️ Quase perfeito!</h3></div>`;
    } else {
        resumo = `<div class="summary-card"><h3>🚫 Precisa corrigir</h3></div>`;
    }

    document.getElementById("summary").innerHTML = resumo;

    // lista
    let lista = "";

    resultados.forEach(item => {
        let icon = item.status === "success" ? "✅" :
                   item.status === "warning" ? "⚠️" : "❌";

        lista += `
            <div class="result-card result-${item.status}">
                <div class="result-icon">${icon}</div>
                <div class="result-content">
                    <div class="result-status">${item.status}</div>
                    <div class="result-message">${item.message}</div>
                </div>
            </div>
        `;
    });

    document.getElementById("results").innerHTML = lista;

    document.getElementById("stats").innerHTML = `
        <div class="summary-stats">
            <div>${success} OK</div>
            <div>${warning} Avisos</div>
            <div>${error} Erros</div>
        </div>
    `;
}

// =======================
// INDEX (UPLOAD)
// =======================
document.addEventListener("DOMContentLoaded", () => {

    const fileInput = document.getElementById('file');
    const fileNameDisplay = document.getElementById('fileName');
    const uploadForm = document.getElementById('uploadForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');
    const loadingOverlay = document.getElementById('loadingOverlay');

    if (!uploadForm) return;

    fileInput.addEventListener('change', function (e) {
        const fileName = e.target.files[0]?.name || 'Nenhum arquivo selecionado';
        fileNameDisplay.textContent = fileName;
    });

    uploadForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!fileInput.files.length) {
            alert("Selecione um arquivo!");
            return;
        }

        submitBtn.disabled = true;
        btnIcon.textContent = '⏳';
        btnText.textContent = 'Processando...';
        loadingOverlay.style.display = 'flex';

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        try {
            const res = await fetch(`${API_URL}/analisar`, {
                method: "POST",
                body: formData
            });

            // Verifica erro HTTP (500, 400, etc)
            if (!res.ok) {
                throw new Error("Erro no servidor");
            }

            const data = await res.json();

            console.log("Resposta backend:", data); // DEBUG

            // Salva resultado real
            localStorage.setItem("resultado", JSON.stringify(data));

            // Redireciona
            window.location.href = "resultado.html";

        } catch (err) {
            alert("Erro ao enviar ou processar arquivo");
            console.error(err);

            // opcional: esconder loading
            // loadingOverlay.style.display = 'none';
        }
    });

});