import { CrudScreen, FormValues } from "../components/CrudScreen";
import { DetailLine } from "../components/DetailLine";
import { FormFieldSpec } from "../components/FormField";
import { Medico } from "../types";
import { cpfFromApi, cpfToApi, dateFromApi, dateToApi, phoneFromApi, timeFromApi, timeToApi } from "../utils/dateTime";

const validarData = (value: string) => dateToApi(value)
    ? undefined
    : "Informe uma data válida no formato DD/MM/AAAA.";
const validarHora = (value: string) => timeToApi(value)
    ? undefined
    : "Informe um horário válido no formato HH:MM (00:00 a 23:59).";

const fields: FormFieldSpec[] = [
    { key: "nome", label: "Nome", placeholder: "Nome completo", autoCapitalize: "words" },
    { key: "crm", label: "CRM", placeholder: "Ex.: SP-123456", autoCapitalize: "characters" },
    { key: "especialidade", label: "Especialidade", placeholder: "Ex.: Cardiologia", autoCapitalize: "words" },
    { key: "cpf", label: "CPF", type: "cpf", placeholder: "000.000.000-00" },
    { key: "telefone", label: "Telefone", type: "phone", placeholder: "(00) 00000-0000" },
    {
        key: "dataNascimento",
        label: "Data de nascimento",
        type: "date",
        placeholder: "DD/MM/AAAA",
        validate: validarData
    },
    {
        key: "plantaoInicio",
        label: "Início do plantão",
        type: "time",
        placeholder: "HH:MM",
        validate: validarHora
    },
    {
        key: "plantaoFim",
        label: "Fim do plantão",
        type: "time",
        placeholder: "HH:MM",
        validate: validarHora
    },
    {
        key: "sexo",
        label: "Sexo",
        type: "select",
        options: [
            { label: "Feminino", value: "f" },
            { label: "Masculino", value: "m" }
        ]
    }
];

const initialValues: FormValues = {
    nome: "",
    crm: "",
    especialidade: "",
    cpf: "",
    telefone: "",
    dataNascimento: "",
    plantaoInicio: "",
    plantaoFim: "",
    sexo: ""
};

export function MedicosScreen() {
    return (
        <CrudScreen<Medico>
            title="Médicos"
            singular="Médico"
            endpoint="/medicos"
            fields={fields}
            initialValues={initialValues}
            valuesFromItem={item => ({
                nome: item.nome,
                crm: item.crm,
                especialidade: item.especialidade,
                cpf: cpfFromApi(item.cpf),
                telefone: phoneFromApi(item.telefone),
                dataNascimento: dateFromApi(item.dataNascimento),
                plantaoInicio: timeFromApi(item.plantaoInicio),
                plantaoFim: timeFromApi(item.plantaoFim),
                sexo: item.sexo
            })}
            payloadFromValues={values => ({
                ...values,
                cpf: cpfToApi(values.cpf ?? ""),
                dataNascimento: dateToApi(values.dataNascimento ?? "") ?? "",
                plantaoInicio: timeToApi(values.plantaoInicio ?? "") ?? "",
                plantaoFim: timeToApi(values.plantaoFim ?? "") ?? ""
            })}
            validateValues={(values): Record<string, string> => {
                const start = timeToApi(values.plantaoInicio ?? "");
                const end = timeToApi(values.plantaoFim ?? "");
                return start && end && end <= start
                    ? { plantaoFim: "O fim do plantão deve ser posterior ao início." }
                    : {};
            }}
            renderTitle={item => item.nome}
            renderDetails={item => (
                <>
                    <DetailLine label="CRM" value={item.crm} />
                    <DetailLine label="Especialidade" value={item.especialidade} />
                    <DetailLine label="Plantão" value={`${timeFromApi(item.plantaoInicio)}–${timeFromApi(item.plantaoFim)}`} />
                </>
            )}
        />
    );
}
