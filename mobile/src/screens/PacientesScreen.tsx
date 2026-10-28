import { CrudScreen, FormValues } from "../components/CrudScreen";
import { DetailLine } from "../components/DetailLine";
import { FormFieldSpec } from "../components/FormField";
import { Paciente } from "../types";

const fields: FormFieldSpec[] = [
    { key: "nome", label: "Nome", placeholder: "Nome completo", autoCapitalize: "words" },
    { key: "cpf", label: "CPF", placeholder: "Somente 11 numeros", keyboardType: "number-pad" },
    { key: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", keyboardType: "phone-pad" },
    { key: "dataNascimento", label: "Data de nascimento", placeholder: "AAAA-MM-DD" },
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
                cpf: item.cpf,
                telefone: item.telefone,
                dataNascimento: item.dataNascimento,
                sexo: item.sexo
            })}
            payloadFromValues={values => values}
            renderTitle={item => item.nome}
            renderDetails={item => (
                <>
                    <DetailLine label="CPF" value={item.cpf} />
                    <DetailLine label="Telefone" value={item.telefone} />
                    <DetailLine label="Nascimento" value={item.dataNascimento} />
                </>
            )}
        />
    );
}

