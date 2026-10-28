import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { ApiError, apiRequest } from "../services/api";
import { colors } from "../theme";
import { Usuario } from "../types";

export function LoginScreen() {
    const { entrar } = useAuth();
    const [cadastro, setCadastro] = useState(false);
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");

    async function enviar() {
        if ((cadastro && !nome.trim()) || !email.trim() || !senha) {
            setErro("Preencha todos os campos.");
            return;
        }

        setLoading(true);
        setErro("");
        try {
            if (cadastro) {
                await apiRequest<Usuario>("/usuarios", {
                    method: "POST",
                    body: JSON.stringify({ nome, email, senha })
                });
            }
            await entrar(email, senha);
        } catch (error) {
            setErro(
                error instanceof ApiError
                    ? error.message
                    : "Nao foi possivel conectar com a clinica."
            );
        } finally {
            setLoading(false);
        }
    }

    function alternarModo() {
        setCadastro(value => !value);
        setErro("");
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.screen}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.brand}>
                    <View style={styles.brandIcon}>
                        <Ionicons name="medkit" size={32} color="#FFFFFF" />
                    </View>
                    <Text style={styles.brandName}>Clinica</Text>
                    <Text style={styles.brandSubtitle}>
                        {cadastro ? "Crie o primeiro acesso" : "Acesse sua conta"}
                    </Text>
                </View>

                <View style={styles.form}>
                    {cadastro && (
                        <View style={styles.group}>
                            <Text style={styles.label}>Nome</Text>
                            <TextInput
                                value={nome}
                                onChangeText={setNome}
                                placeholder="Nome completo"
                                placeholderTextColor="#8A9694"
                                autoCapitalize="words"
                                style={styles.input}
                            />
                        </View>
                    )}

                    <View style={styles.group}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="usuario@clinica.com"
                            placeholderTextColor="#8A9694"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.group}>
                        <Text style={styles.label}>Senha</Text>
                        <TextInput
                            value={senha}
                            onChangeText={setSenha}
                            placeholder={cadastro ? "Minimo de 6 caracteres" : "Sua senha"}
                            placeholderTextColor="#8A9694"
                            secureTextEntry
                            autoCapitalize="none"
                            style={styles.input}
                            onSubmitEditing={() => void enviar()}
                        />
                    </View>

                    {!!erro && (
                        <View style={styles.errorBox}>
                            <Ionicons name="alert-circle-outline" size={19} color={colors.danger} />
                            <Text style={styles.errorText}>{erro}</Text>
                        </View>
                    )}

                    <Pressable
                        disabled={loading}
                        onPress={() => void enviar()}
                        style={({ pressed }) => [
                            styles.submit,
                            pressed && styles.pressed,
                            loading && styles.disabled
                        ]}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons
                                    name={cadastro ? "person-add-outline" : "log-in-outline"}
                                    size={21}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.submitText}>
                                    {cadastro ? "Criar e entrar" : "Entrar"}
                                </Text>
                            </>
                        )}
                    </Pressable>

                    <Pressable onPress={alternarModo} style={styles.switchButton}>
                        <Text style={styles.switchText}>
                            {cadastro ? "Ja tenho uma conta" : "Criar primeiro acesso"}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background
    },
    content: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 32
    },
    brand: {
        alignItems: "center",
        marginBottom: 30
    },
    brandIcon: {
        width: 62,
        height: 62,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primary,
        marginBottom: 14
    },
    brandName: {
        color: colors.text,
        fontSize: 30,
        fontWeight: "800"
    },
    brandSubtitle: {
        color: colors.muted,
        fontSize: 15,
        marginTop: 4
    },
    form: {
        width: "100%",
        maxWidth: 440,
        alignSelf: "center",
        gap: 16
    },
    group: {
        gap: 6
    },
    label: {
        color: colors.text,
        fontSize: 14,
        fontWeight: "600"
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        backgroundColor: colors.surface,
        paddingHorizontal: 13,
        color: colors.text,
        fontSize: 16
    },
    errorBox: {
        padding: 11,
        borderRadius: 6,
        backgroundColor: "#FBEDEC",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8
    },
    errorText: {
        flex: 1,
        color: colors.danger,
        fontSize: 14
    },
    submit: {
        height: 50,
        borderRadius: 6,
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
    },
    submitText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700"
    },
    switchButton: {
        minHeight: 42,
        alignItems: "center",
        justifyContent: "center"
    },
    switchText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: "700"
    },
    pressed: {
        opacity: 0.7
    },
    disabled: {
        opacity: 0.55
    }
});

