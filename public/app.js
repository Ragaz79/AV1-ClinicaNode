"use strict";
class ErroDaApi extends Error {
    detalhes;
    constructor(message, detalhes = []) {
        super(message);
        this.detalhes = detalhes;
    }
}
function selecionar(seletor) {
    const elemento = document.querySelector(seletor);
    if (!elemento)
        throw new Error(`Elemento não encontrado: ${seletor}`);
    return elemento;
}
const elements = {
    grid: selecionar("#pacientes-grid"),
    table: selecionar("#tabela-container"),
    loading: selecionar("#estado-carregando"),
    empty: selecionar("#estado-vazio"),
    counter: selecionar("#contador"),
    search: selecionar("#busca"),
    newPatient: selecionar("#novo-paciente"),
    formDialog: selecionar("#form-dialog"),
    form: selecionar("#paciente-form"),
    formTitle: selecionar("#form-titulo"),
    formContext: selecionar("#form-contexto"),
    formError: selecionar("#form-error"),
    save: selecionar("#salvar-paciente"),
    closeForm: selecionar("#fechar-form"),
    cancelForm: selecionar("#cancelar-form"),
    deleteDialog: selecionar("#delete-dialog"),
    deleteName: selecionar("#delete-nome"),
    confirmDelete: selecionar("#confirmar-delete"),
    closeDelete: selecionar("#fechar-delete"),
    cancelDelete: selecionar("#cancelar-delete"),
    toast: selecionar("#toast")
};
function obterInput(nome) {
    const campo = elements.form.elements.namedItem(nome);
    if (!(campo instanceof HTMLInputElement)) {
        throw new Error(`Campo não encontrado: ${nome}`);
    }
    return campo;
}
const state = {
    patients: [],
    editingId: null,
    deletingId: null
};
function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
function onlyDigits(value) {
    return value.replace(/\D/g, "");
}
function formatCpf(value) {
    const digits = onlyDigits(value).slice(0, 11);
    return digits
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2");
}
function formatPhone(value) {
    const digits = onlyDigits(value).slice(0, 11);
    if (digits.length <= 10) {
        return digits
            .replace(/^(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return digits
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
}
function formatDate(value) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
}
function showToast(message) {
    clearTimeout(state.toastTimer);
    elements.toast.textContent = message;
    elements.toast.hidden = false;
    state.toastTimer = window.setTimeout(() => {
        elements.toast.hidden = true;
    }, 3200);
}
function updateView() {
    const total = state.patients.length;
    elements.counter.textContent = `${total} ${total === 1 ? "paciente" : "pacientes"}`;
    elements.loading.hidden = true;
    elements.empty.hidden = total !== 0;
    elements.table.hidden = total === 0;
    elements.grid.innerHTML = state.patients.map((patient) => `
        <tr>
            <td data-label="Paciente">
                <div class="patient-name">
                    <strong>${escapeHtml(patient.nome)}</strong>
                    <span>Código ${patient.id}</span>
                </div>
            </td>
            <td data-label="CPF">${formatCpf(patient.cpf)}</td>
            <td data-label="Telefone">${formatPhone(patient.telefone)}</td>
            <td data-label="Nascimento">${formatDate(patient.dataNascimento)}</td>
            <td data-label="Sexo">${patient.sexo === "F" ? "Feminino" : "Masculino"}</td>
            <td data-label="Ações">
                <div class="row-actions">
                    <button class="action-button" type="button" data-action="edit" data-id="${patient.id}">Editar</button>
                    <button class="action-button delete" type="button" data-action="delete" data-id="${patient.id}">Excluir</button>
                </div>
            </td>
        </tr>
    `).join("");
}
async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });
    if (response.status === 204)
        return null;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const errorData = data;
        throw new ErroDaApi(errorData.mensagem || "Não foi possível concluir a operação.", errorData.erros || []);
    }
    return data;
}
function normalizarErro(error) {
    if (error instanceof ErroDaApi)
        return error;
    return new ErroDaApi("Não foi possível concluir a operação.");
}
async function loadPatients() {
    elements.loading.textContent = "Carregando pacientes...";
    elements.loading.hidden = false;
    elements.empty.hidden = true;
    elements.table.hidden = true;
    try {
        const name = elements.search.value.trim();
        const query = name ? `?nome=${encodeURIComponent(name)}` : "";
        state.patients = await request(`/pacientes${query}`);
        updateView();
    }
    catch (error) {
        const apiError = normalizarErro(error);
        elements.loading.textContent = apiError.message;
        showToast(apiError.message);
    }
}
function clearErrors() {
    elements.formError.hidden = true;
    elements.formError.textContent = "";
    elements.form.querySelectorAll("[aria-invalid]").forEach((input) => {
        input.removeAttribute("aria-invalid");
    });
    elements.form.querySelectorAll("[data-error-for]").forEach((element) => {
        element.textContent = "";
    });
}
function showFormErrors(error) {
    clearErrors();
    if (!error.detalhes.length) {
        elements.formError.textContent = error.message;
        elements.formError.hidden = false;
        return;
    }
    error.detalhes.forEach((detail) => {
        const field = elements.form.elements.namedItem(detail.campo);
        const message = elements.form.querySelector(`[data-error-for="${detail.campo}"]`);
        if (field instanceof RadioNodeList) {
            elements.form.querySelectorAll(`[name="${detail.campo}"]`).forEach((input) => {
                input.setAttribute("aria-invalid", "true");
            });
        }
        else if (field instanceof Element) {
            field.setAttribute("aria-invalid", "true");
        }
        if (message)
            message.textContent = detail.mensagem;
    });
}
function openCreateForm() {
    state.editingId = null;
    elements.form.reset();
    clearErrors();
    elements.formTitle.textContent = "Cadastrar paciente";
    elements.formContext.textContent = "NOVO CADASTRO";
    elements.save.textContent = "Salvar paciente";
    elements.formDialog.showModal();
    obterInput("nome").focus();
}
function openEditForm(patient) {
    state.editingId = patient.id;
    elements.form.reset();
    clearErrors();
    elements.formTitle.textContent = "Editar paciente";
    elements.formContext.textContent = `PACIENTE ${patient.id}`;
    elements.save.textContent = "Salvar alterações";
    obterInput("nome").value = patient.nome;
    obterInput("cpf").value = formatCpf(patient.cpf);
    obterInput("telefone").value = formatPhone(patient.telefone);
    obterInput("dataNascimento").value = patient.dataNascimento;
    const sexo = elements.form.elements.namedItem("sexo");
    if (sexo instanceof RadioNodeList)
        sexo.value = patient.sexo;
    elements.formDialog.showModal();
    obterInput("nome").focus();
}
function closeForm() {
    elements.formDialog.close();
    state.editingId = null;
}
async function savePatient(event) {
    event.preventDefault();
    clearErrors();
    const formData = new FormData(elements.form);
    const payload = {
        nome: String(formData.get("nome") || "").trim(),
        cpf: onlyDigits(String(formData.get("cpf") || "")),
        telefone: onlyDigits(String(formData.get("telefone") || "")),
        dataNascimento: String(formData.get("dataNascimento") || ""),
        sexo: String(formData.get("sexo") || "")
    };
    const editing = state.editingId !== null;
    const url = editing ? `/pacientes/${state.editingId}` : "/pacientes";
    elements.save.disabled = true;
    elements.save.textContent = "Salvando...";
    try {
        await request(url, {
            method: editing ? "PUT" : "POST",
            body: JSON.stringify(payload)
        });
        closeForm();
        await loadPatients();
        showToast(editing ? "Paciente atualizado com sucesso." : "Paciente cadastrado com sucesso.");
    }
    catch (error) {
        showFormErrors(normalizarErro(error));
    }
    finally {
        elements.save.disabled = false;
        elements.save.textContent = editing ? "Salvar alterações" : "Salvar paciente";
    }
}
function openDeleteDialog(patient) {
    state.deletingId = patient.id;
    elements.deleteName.textContent = patient.nome;
    elements.deleteDialog.showModal();
}
function closeDeleteDialog() {
    elements.deleteDialog.close();
    state.deletingId = null;
}
async function deletePatient() {
    if (state.deletingId === null)
        return;
    elements.confirmDelete.disabled = true;
    elements.confirmDelete.textContent = "Excluindo...";
    try {
        await request(`/pacientes/${state.deletingId}`, { method: "DELETE" });
        closeDeleteDialog();
        await loadPatients();
        showToast("Paciente excluído com sucesso.");
    }
    catch (error) {
        showToast(normalizarErro(error).message);
    }
    finally {
        elements.confirmDelete.disabled = false;
        elements.confirmDelete.textContent = "Excluir";
    }
}
elements.newPatient.addEventListener("click", openCreateForm);
elements.closeForm.addEventListener("click", closeForm);
elements.cancelForm.addEventListener("click", closeForm);
elements.form.addEventListener("submit", savePatient);
elements.closeDelete.addEventListener("click", closeDeleteDialog);
elements.cancelDelete.addEventListener("click", closeDeleteDialog);
elements.confirmDelete.addEventListener("click", deletePatient);
elements.search.addEventListener("input", () => {
    clearTimeout(state.searchTimer);
    state.searchTimer = window.setTimeout(loadPatients, 300);
});
obterInput("cpf").addEventListener("input", (event) => {
    const input = event.currentTarget;
    input.value = formatCpf(input.value);
});
obterInput("telefone").addEventListener("input", (event) => {
    const input = event.currentTarget;
    input.value = formatPhone(input.value);
});
elements.grid.addEventListener("click", (event) => {
    if (!(event.target instanceof Element))
        return;
    const button = event.target.closest("button[data-action]");
    if (!button)
        return;
    const patient = state.patients.find((item) => item.id === Number(button.dataset.id));
    if (!patient)
        return;
    if (button.dataset.action === "edit")
        openEditForm(patient);
    if (button.dataset.action === "delete")
        openDeleteDialog(patient);
});
elements.formDialog.addEventListener("click", (event) => {
    if (event.target === elements.formDialog)
        closeForm();
});
elements.deleteDialog.addEventListener("click", (event) => {
    if (event.target === elements.deleteDialog)
        closeDeleteDialog();
});
obterInput("dataNascimento").max = new Date().toISOString().slice(0, 10);
void loadPatients();
