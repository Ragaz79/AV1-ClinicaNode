import { CrudScreen, FormValues } from "../components/CrudScreen";
import { DetailLine } from "../components/DetailLine";
import { FormFieldSpec } from "../components/FormField";
import { Paciente } from "../types";
import { cpfFromApi, cpfToApi, dateFromApi, dateToApi, phoneFromApi } from "../utils/dateTime";

const validarData = (value: string) => dateToApi(value)
    ? undefined
    : "Informe uma data válida no formato DD/MM/AAAA.";

const fields: FormFieldSpec[] = [
    { key: "nome", label: "Nome", placeholder: "Nome completo", autoCapitalize: "words" },
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
        key: "sexo",
        label: "Sexo",
        type: "select",
        options: [
            { label: "Feminino", value: "F" },
            { label: "Masculino", value: "M" }
        ]
    }
];

const initialValues: FormValues = {
    nome: "",
    cpf: "",
    telefone: "",
    dataNascimento: "",
    sexo: ""
};

export function PacientesScreen() {
    return (
        <CrudScreen<Paciente>
            title="Pacientes"
            singular="Paciente"
            endpoint="/pacientes"
            fields={fields}
            initialValues={initialValues}
            valuesFromItem={item => ({
                nome: item.nome,
                cpf: cpfFromApi(item.cpf),
                telefone: phoneFromApi(item.telefone),
                dataNascimento: dateFromApi(item.dataNascimento),
                sexo: item.sexo
            })}
            payloadFromValues={values => ({
                ...values,
                cpf: cpfToApi(values.cpf ?? ""),
                dataNascimento: dateToApi(values.dataNascimento ?? "") ?? ""
            })}
            renderTitle={item => item.nome}
            renderDetails={item => (
                <>
                    <DetailLine label="CPF" value={cpfFromApi(item.cpf)} />
                    <DetailLine label="Telefone" value={phoneFromApi(item.telefone)} />
                    <DetailLine label="Nascimento" value={dateFromApi(item.dataNascimento)} />
                </>
            )}
        />
    );
}
