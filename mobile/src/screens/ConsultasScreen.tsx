import { Alert } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { CrudScreen, FormValues } from "../components/CrudScreen";
import { DetailLine } from "../components/DetailLine";
import { FormFieldSpec } from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { ApiError, apiRequest } from "../services/api";
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

export function ConsultasScreen() {
    const { token, sair } = useAuth();
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [medicos, setMedicos] = useState<Medico[]>([]);

    useEffect(() => {
        Promise.all([
            apiRequest<Paciente[]>("/pacientes", {}, token),
            apiRequest<Medico[]>("/medicos", {}, token)
        ]).then(([listaPacientes, listaMedicos]) => {
            setPacientes(listaPacientes);
            setMedicos(listaMedicos);
        }).catch(async error => {
            if (error instanceof ApiError && error.status === 401) {
                await sair();
                return;
            }
            Alert.alert(
                "Dados indisponiveis",
                error instanceof Error ? error.message : "Nao foi possivel carregar pacientes e medicos."
            );
        });
    }, [token, sair]);

    const fields = useMemo<FormFieldSpec[]>(() => [
        {
            key: "pacienteId",
            label: "Paciente",
            type: "select",
            options: pacientes.map(item => ({ label: item.nome, value: String(item.id) }))
        },
        {
            key: "medicoId",
            label: "Medico",
            type: "select",
            options: medicos.map(item => ({
                label: `${item.nome} - ${item.especialidade}`,
                value: String(item.id)
            }))
        },
        { key: "dataConsulta", label: "Data da consulta", placeholder: "AAAA-MM-DD" },
        {
            key: "horaInicio",
            label: "Hora de inicio",
            placeholder: "HH:MM",
            keyboardType: "numbers-and-punctuation"
        },
        {
            key: "horaFim",
            label: "Hora de fim",
            placeholder: "HH:MM",
            keyboardType: "numbers-and-punctuation"
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
        return medicos.find(item => item.id === id)?.nome ?? `Medico #${id}`;
    }

    return (
        <CrudScreen<Consulta>
            title="Consultas"
            singular="Consulta"
            endpoint="/consultas"
            fields={fields}
            initialValues={initialValues}
            valuesFromItem={item => ({
                pacienteId: String(item.pacienteId),
                medicoId: String(item.medicoId),
                dataConsulta: item.dataConsulta,
                horaInicio: item.horaInicio,
                horaFim: item.horaFim,
                status: item.status
            })}
            payloadFromValues={values => ({
                pacienteId: Number(values.pacienteId),
                medicoId: Number(values.medicoId),
                dataConsulta: values.dataConsulta,
                horaInicio: values.horaInicio,
                horaFim: values.horaFim,
                status: values.status
            })}
            renderTitle={item => `${item.dataConsulta} as ${item.horaInicio}`}
            renderDetails={item => (
                <>
                    <DetailLine label="Paciente" value={nomePaciente(item.pacienteId)} />
                    <DetailLine label="Medico" value={nomeMedico(item.medicoId)} />
                    <DetailLine label="Horario" value={`${item.horaInicio} - ${item.horaFim}`} />
                    <DetailLine label="Status" value={statusLabels[item.status]} />
                </>
            )}
        />
    );
}

