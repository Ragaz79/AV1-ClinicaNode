import { useCallback, useEffect, useMemo, useState } from "react";
import { CrudScreen, FormValues } from "../components/CrudScreen";
import { DetailLine } from "../components/DetailLine";
import { FormFieldSpec } from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { ApiError, apiRequest } from "../services/api";
import { dateFromApi, dateToApi, timeFromApi, timeToApi } from "../utils/dateTime";
import { Consulta, Medico, Paciente } from "../types";

const statusLabels: Record<Consulta["status"], string> = {
    a: "Agendada",
    r: "Realizada",
    c: "Cancelada"
};

const initialValues: FormValues = {
    pacienteId: "",
    medicoId: "",
    dataConsulta: "",
    horaInicio: "",
    horaFim: "",
    status: "a"
};

function validarData(value: string) {
    return dateToApi(value) ? undefined : "Informe uma data válida no formato DD/MM/AAAA.";
}

function validarHora(value: string) {
    return timeToApi(value) ? undefined : "Informe um horário válido no formato HH:MM (00:00 a 23:59).";
}

function formatarData(value: string) {
    const [year, month, day] = value.split("-");
    return year && month && day ? `${day}/${month}/${year}` : dateFromApi(value);
}

export function ConsultasScreen() {
    const { token, sair } = useAuth();
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [medicos, setMedicos] = useState<Medico[]>([]);
    const [referenciasCarregando, setReferenciasCarregando] = useState(true);
    const [erroReferencias, setErroReferencias] = useState("");

    const carregarReferencias = useCallback(async () => {
        setReferenciasCarregando(true);
        setErroReferencias("");
        try {
            const [listaPacientes, listaMedicos] = await Promise.all([
                apiRequest<Paciente[]>("/pacientes", {}, token),
                apiRequest<Medico[]>("/medicos", {}, token)
            ]);
            setPacientes(listaPacientes);
            setMedicos(listaMedicos);
        } catch (error) {
            setErroReferencias(error instanceof Error
                ? error.message
                : "Não foi possível carregar pacientes e médicos.");
            if (error instanceof ApiError && error.status === 401) await sair();
        } finally {
            setReferenciasCarregando(false);
        }
    }, [token, sair]);

    useEffect(() => {
        void carregarReferencias();
    }, [carregarReferencias]);

    const fields = useMemo<FormFieldSpec[]>(() => [
        {
            key: "pacienteId",
            label: "Paciente",
            type: "select",
            options: pacientes.map(item => ({ label: item.nome, value: String(item.id) }))
        },
        {
            key: "medicoId",
            label: "Médico",
            type: "select",
            options: medicos.map(item => ({
                label: `${item.nome} - ${item.especialidade}`,
                value: String(item.id)
            }))
        },
        {
            key: "dataConsulta",
            label: "Data da consulta",
            type: "date",
            placeholder: "DD/MM/AAAA",
            validate: validarData
        },
        {
            key: "horaInicio",
            label: "Hora de início",
            type: "time",
            placeholder: "HH:MM",
            validate: validarHora
        },
        {
            key: "horaFim",
            label: "Hora de fim",
            type: "time",
            placeholder: "HH:MM",
            validate: validarHora
        },
        {
            key: "status",
            label: "Status",
            type: "select",
            options: [
                { label: "Agendada", value: "a" },
                { label: "Realizada", value: "r" },
                { label: "Cancelada", value: "c" }
            ]
        }
    ], [pacientes, medicos]);

    function nomePaciente(id: number) {
        return pacientes.find(item => item.id === id)?.nome ?? `Paciente #${id}`;
    }

    function nomeMedico(id: number) {
        return medicos.find(item => item.id === id)?.nome ?? `Médico #${id}`;
    }

    const canCreate = !referenciasCarregando && !erroReferencias && pacientes.length > 0 && medicos.length > 0;
    const disabledMessage = referenciasCarregando
        ? "Carregando pacientes e médicos..."
        : erroReferencias
            ? `Não foi possível carregar os dados necessários: ${erroReferencias}`
            : pacientes.length === 0 || medicos.length === 0
                ? "Cadastre pelo menos um paciente e um médico antes de agendar uma consulta."
                : undefined;
    const emptyDescription = erroReferencias
        ? "Confira a conexão e tente novamente."
        : "As consultas agendadas aparecerão aqui.";

    return (
        <CrudScreen<Consulta>
            title="Consultas"
            singular="Consulta"
            endpoint="/consultas"
            fields={fields}
            initialValues={initialValues}
            canCreate={canCreate}
            createDisabledMessage={disabledMessage}
            onRetryCreateDisabled={erroReferencias ? () => void carregarReferencias() : undefined}
            emptyDescription={emptyDescription}
            valuesFromItem={item => ({
                pacienteId: String(item.pacienteId),
                medicoId: String(item.medicoId),
                dataConsulta: dateFromApi(item.dataConsulta),
                horaInicio: timeFromApi(item.horaInicio),
                horaFim: timeFromApi(item.horaFim),
                status: item.status
            })}
            payloadFromValues={values => ({
                pacienteId: Number(values.pacienteId),
                medicoId: Number(values.medicoId),
                dataConsulta: dateToApi(values.dataConsulta ?? "") ?? "",
                horaInicio: timeToApi(values.horaInicio ?? "") ?? "",
                horaFim: timeToApi(values.horaFim ?? "") ?? "",
                status: values.status ?? "a"
            })}
            validateValues={(values): Record<string, string> => {
                const start = timeToApi(values.horaInicio ?? "");
                const end = timeToApi(values.horaFim ?? "");
                return start && end && end <= start
                    ? { horaFim: "A hora de fim deve ser depois da hora de início." }
                    : {};
            }}
            renderTitle={item => `${formatarData(item.dataConsulta)} às ${timeFromApi(item.horaInicio)}`}
            renderDetails={item => (
                <>
                    <DetailLine label="Paciente" value={nomePaciente(item.pacienteId)} />
                    <DetailLine label="Médico" value={nomeMedico(item.medicoId)} />
                    <DetailLine label="Horário" value={`${timeFromApi(item.horaInicio)}–${timeFromApi(item.horaFim)}`} />
                    <DetailLine label="Status" value={statusLabels[item.status]} />
                    <DetailLine label="Agendado por" value={item.usuarioNome ?? "Não informado"} />
                </>
            )}
        />
    );
}
