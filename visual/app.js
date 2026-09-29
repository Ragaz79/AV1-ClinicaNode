"use strict";

class ApiError extends Error {
  constructor(message, details = [], status = 0) {
    super(message);
    this.details = details;
    this.status = status;
  }
}

const definitions = {
  pacientes: {
    title: "Pacientes",
    singular: "paciente",
    endpoint: "/pacientes",
    description: "Consulte e mantenha os cadastros de pacientes.",
    searchPlaceholder: "Buscar paciente",
    fields: [
      { name: "nome", label: "Nome completo", type: "text", maxLength: 100, autocomplete: "name", wide: true },
      { name: "cpf", label: "CPF", type: "text", inputmode: "numeric", maxLength: 14, placeholder: "000.000.000-00" },
      { name: "telefone", label: "Telefone", type: "tel", inputmode: "tel", maxLength: 20, placeholder: "(00) 00000-0000", autocomplete: "tel" },
      { name: "dataNascimento", label: "Data de nascimento", type: "date" },
      { name: "sexo", label: "Sexo", type: "select", options: [["F", "Feminino"], ["M", "Masculino"]] }
    ],
    columns: [
      { label: "Paciente", render: record => primaryCell(record.nome, `Código ${record.id}`) },
      { label: "CPF", render: record => escapeHtml(formatCpf(record.cpf)) },
      { label: "Telefone", render: record => escapeHtml(formatPhone(record.telefone)) },
      { label: "Nascimento", render: record => escapeHtml(formatDate(record.dataNascimento)) },
      { label: "Sexo", render: record => record.sexo === "F" ? "Feminino" : "Masculino" }
    ],
    searchable: record => [record.nome, record.cpf, record.telefone]
  },
  medicos: {
    title: "Médicos",
    singular: "médico",
    endpoint: "/medicos",
    description: "Consulte e mantenha os cadastros dos médicos.",
    searchPlaceholder: "Buscar médico",
    fields: [
      { name: "nome", label: "Nome completo", type: "text", maxLength: 100, autocomplete: "name", wide: true },
      { name: "crm", label: "CRM", type: "text", maxLength: 20, placeholder: "Número do CRM" },
      { name: "especialidade", label: "Especialidade", type: "text", maxLength: 100, placeholder: "Ex.: Cardiologia" },
      { name: "cpf", label: "CPF", type: "text", inputmode: "numeric", maxLength: 14, placeholder: "000.000.000-00" },
      { name: "dataNascimento", label: "Data de nascimento", type: "date" },
      { name: "telefone", label: "Telefone", type: "tel", inputmode: "tel", maxLength: 20, placeholder: "(00) 00000-0000", autocomplete: "tel" },
      { name: "plantaoInicio", label: "Início do plantão", type: "time", step: 60 },
      { name: "plantaoFim", label: "Fim do plantão", type: "time", step: 60 },
      { name: "sexo", label: "Sexo", type: "select", options: [["f", "Feminino"], ["m", "Masculino"]] }
    ],
    columns: [
      { label: "Médico", render: record => primaryCell(record.nome, `Código ${record.id}`) },
      { label: "CRM", render: record => escapeHtml(record.crm) },
      { label: "Especialidade", render: record => escapeHtml(record.especialidade) },
      { label: "Telefone", render: record => escapeHtml(formatPhone(record.telefone)) },
      { label: "Plantão", render: record => `${escapeHtml(formatTime(record.plantaoInicio))}–${escapeHtml(formatTime(record.plantaoFim))}` }
    ],
    searchable: record => [record.nome, record.crm, record.especialidade, record.telefone]
  },
  consultas: {
    title: "Consultas",
    singular: "consulta",
    endpoint: "/consultas",
    description: "Agende e acompanhe as consultas da clínica.",
    searchPlaceholder: "Buscar por paciente ou médico",
    fields: [
      { name: "pacienteId", label: "Paciente", type: "select", options: () => state.data.pacientes.map(item => [String(item.id), `${item.nome} · #${item.id}`]), wide: true },
      { name: "medicoId", label: "Médico", type: "select", options: () => state.data.medicos.map(item => [String(item.id), `${item.nome} · ${item.especialidade}`]), wide: true },
      { name: "dataConsulta", label: "Data da consulta", type: "date" },
      { name: "status", label: "Status", type: "select", options: [["a", "Agendada"], ["r", "Realizada"], ["c", "Cancelada"]] },
      { name: "horaInicio", label: "Horário de início", type: "time", step: 60 },
      { name: "horaFim", label: "Horário de fim", type: "time", step: 60 }
    ],
    columns: [
      { label: "Data e horário", render: record => primaryCell(formatDate(record.dataConsulta), `${formatTime(record.horaInicio)}–${formatTime(record.horaFim)}`) },
      { label: "Paciente", render: record => escapeHtml(findById("pacientes", record.pacienteId)?.nome || `Paciente #${record.pacienteId}`) },
      { label: "Médico", render: record => escapeHtml(findById("medicos", record.medicoId)?.nome || `Médico #${record.medicoId}`) },
      { label: "Status", render: record => statusBadge(record.status) }
    ],
    searchable: record => [
      findById("pacientes", record.pacienteId)?.nome,
      findById("medicos", record.medicoId)?.nome,
      statusLabel(record.status),
      record.dataConsulta
    ]
  }
};

const elements = {
  title: document.getElementById("page-title"),
  description: document.getElementById("page-description"),
  nav: document.querySelector(".main-nav"),
  newButton: document.getElementById("new-record"),
  search: document.getElementById("search"),
  count: document.getElementById("record-count"),
  tableScroll: document.getElementById("table-scroll"),
  tableHead: document.getElementById("table-head"),
  tableBody: document.getElementById("table-body"),
  loading: document.getElementById("loading-state"),
  empty: document.getElementById("empty-state"),
  error: document.getElementById("error-state"),
  errorMessage: document.getElementById("error-message"),
  retry: document.getElementById("retry-load"),
  formDialog: document.getElementById("form-dialog"),
  form: document.getElementById("record-form"),
  formTitle: document.getElementById("form-title"),
  formDescription: document.getElementById("form-description"),
  formFields: document.getElementById("form-fields"),
  formError: document.getElementById("form-error"),
  save: document.getElementById("save-record"),
  deleteDialog: document.getElementById("delete-dialog"),
  deleteDescription: document.getElementById("delete-description"),
  deleteError: document.getElementById("delete-error"),
  confirmDelete: document.getElementById("confirm-delete"),
  toast: document.getElementById("toast")
};

const state = {
  section: null,
  data: { pacientes: [], medicos: [], consultas: [] },
  loading: false,
  error: null,
  editingId: null,
  deletingId: null,
  searchTimer: null,
  toastTimer: null
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function onlyDigits(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function formatCpf(value) {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return String(value ?? "");
  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

function formatPhone(value) {
  const digits = onlyDigits(value);
  if (digits.length === 11) return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  if (digits.length === 10) return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  return String(value ?? "");
}

function formatDate(value) {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : String(value ?? "—");
}

function formatTime(value) {
  return String(value ?? "").slice(0, 5) || "—";
}

function normalizeSearch(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function primaryCell(title, subtitle) {
  return `<div class="primary-cell"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(subtitle)}</span></div>`;
}

function findById(section, id) {
  return state.data[section].find(item => item.id === Number(id));
}

function statusLabel(status) {
  return ({ a: "Agendada", r: "Realizada", c: "Cancelada" })[status] || "—";
}

function statusBadge(status) {
  return `<span class="status status-${escapeHtml(status)}">${statusLabel(status)}</span>`;
}

function selectedRecords() {
  const definition = definitions[state.section];
  const term = normalizeSearch(elements.search.value.trim());
  const records = state.data[state.section];
  if (!term) return records;
  return records.filter(record => definition.searchable(record)
    .filter(Boolean)
    .some(value => normalizeSearch(value).includes(term)));
}

function render() {
  const definition = definitions[state.section];
  elements.title.textContent = definition.title;
  elements.description.textContent = definition.description;
  elements.newButton.textContent = `Novo ${definition.singular}`;
  elements.search.placeholder = definition.searchPlaceholder;

  elements.nav.querySelectorAll("a[data-section]").forEach(link => {
    const active = link.dataset.section === state.section;
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  elements.loading.hidden = !state.loading;
  elements.error.hidden = true;
  elements.empty.hidden = true;
  elements.tableScroll.hidden = true;
  if (state.loading) return;

  if (state.error) {
    elements.errorMessage.textContent = state.error.message;
    elements.error.hidden = false;
    elements.count.textContent = "";
    return;
  }

  const records = selectedRecords();
  const total = records.length;
  elements.count.textContent = `${total} ${total === 1 ? definition.singular : `${definition.singular}s`}`;
  elements.tableHead.innerHTML = `<tr>${definition.columns.map(column => `<th scope="col">${column.label}</th>`).join("")}<th scope="col">Ações</th></tr>`;

  if (total === 0) {
    const searching = elements.search.value.trim().length > 0;
    elements.empty.innerHTML = searching
      ? `<strong>Nenhum resultado encontrado</strong><p>Tente outro termo ou limpe a busca.</p><button class="button button-secondary" data-clear-search type="button">Limpar busca</button>`
      : `<strong>Nenhum ${definition.singular} cadastrado</strong><p>Os cadastros feitos aqui ficam salvos no banco de dados da clínica.</p><button class="button button-primary" data-create-record type="button">Novo ${definition.singular}</button>`;
    elements.empty.hidden = false;
    return;
  }

  elements.tableBody.innerHTML = records.map(record => `
    <tr>
      ${definition.columns.map(column => `<td>${column.render(record)}</td>`).join("")}
      <td><div class="row-actions">
        <button class="text-button" type="button" data-action="edit" data-id="${record.id}">Editar</button>
        <button class="text-button delete" type="button" data-action="delete" data-id="${record.id}">Excluir</button>
      </div></td>
    </tr>`).join("");
  elements.tableScroll.hidden = false;
}

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers }
    });
  } catch {
    throw new ApiError("Não foi possível conectar à API. Confira se o servidor está ligado.");
  }

  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.mensagem || "Não foi possível concluir a operação.", data.erros || [], response.status);
  }
  return data;
}

async function loadData() {
  state.loading = true;
  state.error = null;
  render();
  try {
    const [pacientes, medicos, consultas] = await Promise.all([
      request("/pacientes"),
      request("/medicos"),
      request("/consultas")
    ]);
    state.data = { pacientes, medicos, consultas };
  } catch (error) {
    state.error = error instanceof Error ? error : new ApiError("Não foi possível carregar os dados.");
  } finally {
    state.loading = false;
    render();
  }
}

function setSection(section) {
  if (!definitions[section]) {
    window.location.hash = "pacientes";
    return;
  }
  if (state.section === section && !state.error) return;
  state.section = section;
  elements.search.value = "";
  render();
  void loadData();
}

function clearFormErrors() {
  elements.formError.hidden = true;
  elements.formError.textContent = "";
  elements.form.querySelectorAll("[aria-invalid='true']").forEach(field => field.removeAttribute("aria-invalid"));
  elements.form.querySelectorAll("[data-error-for]").forEach(message => { message.textContent = ""; });
}

function displayFormError(error) {
  clearFormErrors();
  if (!error.details.length) {
    elements.formError.textContent = error.message;
    elements.formError.hidden = false;
    return;
  }
  error.details.forEach(detail => {
    const field = elements.form.elements.namedItem(detail.campo);
    if (field instanceof HTMLElement && "setAttribute" in field) field.setAttribute("aria-invalid", "true");
    const message = elements.form.querySelector(`[data-error-for="${CSS.escape(detail.campo)}"]`);
    if (message) message.textContent = detail.mensagem;
  });
  elements.formError.textContent = "Revise os campos indicados.";
  elements.formError.hidden = false;
}

function fieldOptions(field) {
  return typeof field.options === "function" ? field.options() : field.options || [];
}

function renderFields(definition) {
  const fields = definition.fields.map(field => {
    const wide = field.wide ? " field-wide" : "";
    const descriptionId = `field-error-${field.name}`;
    const options = field.type === "select"
      ? `<select id="field-${field.name}" name="${field.name}" required aria-describedby="${descriptionId}"><option value="">Selecione</option>${fieldOptions(field).map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("")}</select>`
      : `<input id="field-${field.name}" name="${field.name}" type="${field.type}"${field.maxLength ? ` maxlength="${field.maxLength}"` : ""}${field.step ? ` step="${field.step}"` : ""}${field.inputmode ? ` inputmode="${field.inputmode}"` : ""}${field.autocomplete ? ` autocomplete="${field.autocomplete}"` : ""}${field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : ""} required aria-describedby="${descriptionId}">`;
    return `<div class="field${wide}"><label for="field-${field.name}">${field.label}</label>${options}<small class="field-error" data-error-for="${field.name}" id="${descriptionId}"></small></div>`;
  });
  if (state.section === "consultas" && (!state.data.pacientes.length || !state.data.medicos.length)) {
    fields.unshift(`<p class="field-note field-wide">Para agendar uma consulta, cadastre primeiro pelo menos um paciente e um médico.</p>`);
  }
  elements.formFields.innerHTML = fields.join("");
}

function fillForm(record, definition) {
  definition.fields.forEach(field => {
    const control = elements.form.elements.namedItem(field.name);
    if (!control || !(control instanceof HTMLElement) || !("value" in control)) return;
    const value = record?.[field.name] ?? "";
    control.value = field.name === "cpf" ? formatCpf(value) : field.name === "telefone" ? formatPhone(value) : String(value);
  });
}

function openForm(id = null) {
  const definition = definitions[state.section];
  const record = id === null ? null : state.data[state.section].find(item => item.id === id);
  if (id !== null && !record) return;
  state.editingId = id;
  renderFields(definition);
  elements.form.reset();
  fillForm(record, definition);
  clearFormErrors();
  elements.formTitle.textContent = `${record ? "Editar" : "Novo"} ${definition.singular}`;
  elements.formDescription.textContent = record ? `Cadastro ${record.id}` : "Preencha os dados abaixo.";
  elements.save.textContent = record ? "Salvar alterações" : `Salvar ${definition.singular}`;
  elements.save.disabled = state.section === "consultas" && (!state.data.pacientes.length || !state.data.medicos.length);
  elements.formDialog.showModal();
  elements.form.querySelector("input, select")?.focus();
}

function closeForm() {
  elements.formDialog.close();
  state.editingId = null;
}

function makePayload(formData, definition) {
  const payload = {};
  definition.fields.forEach(field => {
    const value = String(formData.get(field.name) ?? "").trim();
    if (field.name === "cpf") payload[field.name] = onlyDigits(value);
    else if (field.type === "number" || field.name === "pacienteId" || field.name === "medicoId") payload[field.name] = Number(value);
    else payload[field.name] = value;
  });
  return payload;
}

async function saveRecord(event) {
  event.preventDefault();
  clearFormErrors();
  const definition = definitions[state.section];
  const editing = state.editingId !== null;
  const url = editing ? `${definition.endpoint}/${state.editingId}` : definition.endpoint;
  const payload = makePayload(new FormData(elements.form), definition);
  elements.save.disabled = true;
  elements.save.textContent = "Salvando...";
  try {
    await request(url, { method: editing ? "PUT" : "POST", body: JSON.stringify(payload) });
    closeForm();
    await loadData();
    showToast(`${definition.singular[0].toUpperCase()}${definition.singular.slice(1)} ${editing ? "atualizado" : "cadastrado"} com sucesso.`);
  } catch (error) {
    displayFormError(error instanceof ApiError ? error : new ApiError("Não foi possível salvar este cadastro."));
  } finally {
    elements.save.disabled = false;
    elements.save.textContent = editing ? "Salvar alterações" : `Salvar ${definition.singular}`;
  }
}

function describeRecord(record) {
  if (state.section === "consultas") {
    const patient = findById("pacientes", record.pacienteId)?.nome || `Paciente #${record.pacienteId}`;
    return `${formatDate(record.dataConsulta)} às ${formatTime(record.horaInicio)} · ${patient}`;
  }
  return record.nome;
}

function openDelete(record) {
  state.deletingId = record.id;
  elements.deleteDescription.textContent = `O cadastro de ${describeRecord(record)} será removido permanentemente.`;
  elements.deleteError.hidden = true;
  elements.deleteError.textContent = "";
  elements.deleteDialog.showModal();
}

function closeDelete() {
  elements.deleteDialog.close();
  state.deletingId = null;
}

async function deleteRecord() {
  if (state.deletingId === null) return;
  const definition = definitions[state.section];
  elements.confirmDelete.disabled = true;
  elements.confirmDelete.textContent = "Excluindo...";
  elements.deleteError.hidden = true;
  try {
    await request(`${definition.endpoint}/${state.deletingId}`, { method: "DELETE" });
    closeDelete();
    await loadData();
    showToast(`${definition.singular[0].toUpperCase()}${definition.singular.slice(1)} excluído com sucesso.`);
  } catch (error) {
    elements.deleteError.textContent = error instanceof Error ? error.message : "Não foi possível excluir este cadastro.";
    elements.deleteError.hidden = false;
  } finally {
    elements.confirmDelete.disabled = false;
    elements.confirmDelete.textContent = "Excluir";
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => { elements.toast.hidden = true; }, 3200);
}

elements.newButton.addEventListener("click", () => openForm());
elements.retry.addEventListener("click", () => void loadData());
elements.form.addEventListener("submit", saveRecord);
elements.form.addEventListener("input", event => {
  const field = event.target;
  if (!(field instanceof HTMLInputElement)) return;
  if (field.name === "cpf") field.value = formatCpfInput(field.value);
  if (field.name === "telefone") field.value = formatPhoneInput(field.value);
  field.removeAttribute("aria-invalid");
  const message = elements.form.querySelector(`[data-error-for="${CSS.escape(field.name)}"]`);
  if (message) message.textContent = "";
});
elements.form.addEventListener("change", event => {
  const field = event.target;
  if (!(field instanceof HTMLSelectElement)) return;
  field.removeAttribute("aria-invalid");
  const message = elements.form.querySelector(`[data-error-for="${CSS.escape(field.name)}"]`);
  if (message) message.textContent = "";
});
elements.formDialog.addEventListener("click", event => {
  if (event.target === elements.formDialog) closeForm();
});
document.getElementById("close-form").addEventListener("click", closeForm);
document.getElementById("cancel-form").addEventListener("click", closeForm);
document.getElementById("close-delete").addEventListener("click", closeDelete);
document.getElementById("cancel-delete").addEventListener("click", closeDelete);
elements.confirmDelete.addEventListener("click", deleteRecord);
elements.deleteDialog.addEventListener("click", event => {
  if (event.target === elements.deleteDialog) closeDelete();
});
elements.deleteDialog.addEventListener("cancel", () => { state.deletingId = null; });
elements.empty.addEventListener("click", event => {
  if (!(event.target instanceof Element)) return;
  if (event.target.closest("[data-create-record]")) openForm();
  if (event.target.closest("[data-clear-search]")) {
    elements.search.value = "";
    render();
    elements.search.focus();
  }
});
elements.tableBody.addEventListener("click", event => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  const record = state.data[state.section].find(item => item.id === id);
  if (!record) return;
  if (button.dataset.action === "edit") openForm(id);
  if (button.dataset.action === "delete") openDelete(record);
});
elements.search.addEventListener("input", () => {
  window.clearTimeout(state.searchTimer);
  state.searchTimer = window.setTimeout(render, 120);
});
window.addEventListener("hashchange", () => setSection(window.location.hash.slice(1) || "pacientes"));

function formatCpfInput(value) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.replace(/^(\d{3})(\d+)/, "$1.$2");
  if (digits.length <= 9) return digits.replace(/^(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d+)/, "$1.$2.$3-$4");
}

function formatPhoneInput(value) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 6) return digits.replace(/^(\d{2})(\d+)/, "($1) $2");
  if (digits.length <= 10) return digits.replace(/^(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
  return digits.replace(/^(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
}

const initialSection = window.location.hash.slice(1) || "pacientes";
if (!window.location.hash || !definitions[initialSection]) window.history.replaceState(null, "", "#pacientes");
setSection(definitions[initialSection] ? initialSection : "pacientes");
