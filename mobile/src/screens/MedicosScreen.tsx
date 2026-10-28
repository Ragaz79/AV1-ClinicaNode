import { CrudScreen, FormValues } from "../components/CrudScreen";
import { DetailLine } from "../components/DetailLine";
import { FormFieldSpec } from "../components/FormField";
import { Medico } from "../types";

const fields: FormFieldSpec[] = [
    { key: "nome", label: "Nome", placeholder: "Nome completo", autoCapitalize: "words" },
    { key: "crm", label: "CRM", placeholder: "Ex.: SP-123456", autoCapitalize: "characters" },
    { key: "especialidade", label: "Especialidade", placeholder: "Ex.: Cardiologia", autoCapitalize: "words" },
    { key: "cpf", label: "CPF", placeholder: "Somente 11 numeros", keyboardType: "number-pad" },
    { key: "telefone", label: "Telefone", placeholder: "(00) 00000-0000", keyboardType: "phone-pad" },
    { key: "dataNascimento", label: "Data de nascimento", placeholder: "AAAA-MM-DD" },
    { key: "plantaoInicio", label: "Inicio do plantao", placeholder: "HH:MM", keyboardType: "numbers-and-punctuation" },
    { key: "plantaoFim", label: "Fim do plantao", placeholder: "HH:MM", keyboardType: "numbers-and-punctuation" },
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
            title="Medicos"
            singular="Medico"
            endpoint="/medicos"
            fields={fields}
            initialValues={initialValues}
            valuesFromItem={item => ({
                nome: item.nome,
                crm: item.crm,
                especialidade: item.especialidade,
                cpf: item.cpf,
                telefone: item.telefone,
                dataNascimento: item.dataNascimento,
                plantaoInicio: item.plantaoInicio,
                plantaoFim: item.plantaoFim,
                sexo: item.sexo
            })}
            payloadFromValues={values => values}
            renderTitle={item => item.nome}
            renderDetails={item => (
                <>
                    <DetailLine label="CRM" value={item.crm} />
                    <DetailLine label="Especialidade" value={item.especialidade} />
                    <DetailLine label="Plantao" value={`${item.plantaoInicio} - ${item.plantaoFim}`} />
                </>
            )}
        />
    );
}

