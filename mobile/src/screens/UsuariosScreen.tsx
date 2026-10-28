import { CrudScreen, FormValues } from "../components/CrudScreen";
import { DetailLine } from "../components/DetailLine";
import { FormFieldSpec } from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { Usuario } from "../types";

const fields: FormFieldSpec[] = [
    { key: "nome", label: "Nome", placeholder: "Nome do usuario", autoCapitalize: "words" },
    {
        key: "email",
        label: "Email",
        placeholder: "usuario@clinica.com",
        keyboardType: "email-address",
        autoCapitalize: "none"
    },
    {
        key: "senha",
        label: "Senha",
        type: "password",
        placeholder: "Minimo de 6 caracteres",
        editOptional: true,
        autoCapitalize: "none"
    }
];

const initialValues: FormValues = {
    nome: "",
    email: "",
    senha: ""
};

export function UsuariosScreen() {
    const { usuario } = useAuth();

    return (
        <CrudScreen<Usuario>
            title="Usuarios"
            singular="Usuario"
            endpoint="/usuarios"
            fields={fields}
            initialValues={initialValues}
            valuesFromItem={item => ({
                nome: item.nome,
                email: item.email,
                senha: ""
            })}
            payloadFromValues={(values, editing) => {
                if (editing && !values.senha) {
                    return { nome: values.nome, email: values.email };
                }
                return values;
            }}
            renderTitle={item => item.nome}
            renderDetails={item => (
                <>
                    <DetailLine label="Email" value={item.email} />
                    {item.id === usuario?.id && <DetailLine label="Sessao" value="Usuario atual" />}
                </>
            )}
            canDelete={item => item.id !== usuario?.id}
        />
    );
}

