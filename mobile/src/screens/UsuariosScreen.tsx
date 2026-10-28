import { CrudScreen, FormValues } from "../components/CrudScreen";
import { DetailLine } from "../components/DetailLine";
import { FormFieldSpec } from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { Usuario } from "../types";

const fields: FormFieldSpec[] = [
    { key: "nome", label: "Nome", placeholder: "Nome do usuário", autoCapitalize: "words" },
    {
        key: "email",
        label: "E-mail",
        placeholder: "usuario@clinica.com",
        keyboardType: "email-address",
        autoCapitalize: "none"
    },
    {
        key: "senha",
        label: "Senha",
        type: "password",
        placeholder: "Mínimo de 6 caracteres",
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
            title="Usuários"
            singular="Usuário"
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
                    <DetailLine label="E-mail" value={item.email} />
                    {item.id === usuario?.id && <DetailLine label="Sessão" value="Usuário atual" />}
                </>
            )}
            canDelete={item => item.id !== usuario?.id}
        />
    );
}

