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
            <p>${data.error}</p>
            <p style="margin-top: 1rem; color: var(--text-secondary);">
                Verifique se o arquivo está em formato PLCopenXML exportado corretamente do Codesys.
            </p>
        </div>
    `;

    // limpa outras áreas (opcional, mas recomendado)
    document.getElementById("summary").innerHTML = "";
    document.getElementById("results").innerHTML = "";
    document.getElementById("stats").innerHTML = "";

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
        resumo = `<div class="summary-card">
        <h3>🎉 Parabéns! Seu GRAFCET está estruturado corretamente. </h3>
        <p>Todas as verificações foram aprovadas. O modelo está pronto para conversão em ladder para programação do CLP.</p>
        </div>`;
    } else if (error === 0) {
        resumo = `<div class="summary-card">
        <h3>⚠️ Seu GRAFCET está quase perfeito!</h3>
        <p>Foram encontrados alguns pontos de atenção. Corrija os avisos para melhorar a clareza e segurança do seu modelo.</p>
        </div>`;
    } else {
        resumo = `<div class="summary-card">
        <h3>🚫 Seu GRAFCET precisa de correções.</h3>
        <p>Foram detectados erros estruturais. Revise as mensagens abaixo e ajuste seu projeto no Codesys antes de reenviar.</p>
        </div>`;
    }

    document.getElementById("summary").innerHTML = resumo;

    // lista
    let lista = "";

    resultados.forEach(item => {

    let icon;
    let statusText;

    if (item.status === "success") {
        icon = "✅";
        statusText = "Verificação Aprovada";
    } else if (item.status === "warning") {
        icon = "⚠️";
        statusText = "Atenção Necessária";
    } else {
        icon = "❌";
        statusText = "Erro Encontrado";
    }

    lista += `
        <div class="result-card result-${item.status}">
            <div class="result-icon">
                ${icon}
            </div>

            <div class="result-content">
                <div class="result-status">
                    ${statusText}
                </div>
                <div class="result-message">
                    ${item.message}
                </div>
            </div>
        </div>
    `;
});

    document.getElementById("results").innerHTML = lista;

    document.getElementById("stats").innerHTML = `
            <h3>📋 Resumo da Análise</h3>
            <div class="summary-stats">
                <div class="stat">
                    <span class="stat-value">${success}</span>
                    <span class="stat-label">Aprovadas</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${warning}</span>
                    <span class="stat-label">Avisos</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${error}</span>
                    <span class="stat-label">Erros</span>
                </div>
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