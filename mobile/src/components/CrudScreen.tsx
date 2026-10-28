import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ApiError, apiRequest } from "../services/api";
import { colors } from "../theme";
import { FormField, FormFieldSpec } from "./FormField";

export type FormValues = Record<string, string>;

interface CrudScreenProps<T extends { id: number }> {
    title: string;
    singular: string;
    endpoint: string;
    fields: FormFieldSpec[];
    initialValues: FormValues;
    valuesFromItem(item: T): FormValues;
    payloadFromValues(values: FormValues, editing: boolean): unknown;
    renderTitle(item: T): string;
    renderDetails(item: T): ReactNode;
    canDelete?(item: T): boolean;
    canCreate?: boolean;
    createDisabledMessage?: string;
    onRetryCreateDisabled?: () => void;
    emptyTitle?: string;
    emptyDescription?: string;
    validateValues?(values: FormValues): Record<string, string>;
}

function mensagemDoErro(error: unknown): string {
    if (error instanceof ApiError && error.status === 401) {
        return "Sua sessão expirou. Entre novamente para continuar.";
    }
    return error instanceof Error ? error.message : "Tente novamente.";
}

export function CrudScreen<T extends { id: number }>(props: CrudScreenProps<T>) {
    const { token, sair } = useAuth();
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [listError, setListError] = useState("");
    const [formError, setFormError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [deleteError, setDeleteError] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const [values, setValues] = useState<FormValues>(props.initialValues);

    const carregar = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setListError("");
        try {
            const data = await apiRequest<T[]>(props.endpoint, {}, token);
            setItems(data);
        } catch (error) {
            setListError(mensagemDoErro(error));
            if (error instanceof ApiError && error.status === 401) await sair();
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [props.endpoint, token, sair]);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    function limparErrosDoFormulario() {
        setFormError("");
        setFieldErrors({});
    }

    function abrirCadastro() {
        setEditingItem(null);
        setValues({ ...props.initialValues });
        limparErrosDoFormulario();
        setModalVisible(true);
    }

    function abrirEdicao(item: T) {
        setEditingItem(item);
        setValues(props.valuesFromItem(item));
        limparErrosDoFormulario();
        setModalVisible(true);
    }

    async function salvar() {
        const errors: Record<string, string> = {};
        for (const field of props.fields) {
            const value = values[field.key]?.trim() ?? "";
            const optional = field.required === false || (!!editingItem && field.editOptional);
            if (!optional && !value) {
                errors[field.key] = `Preencha ${field.label.toLocaleLowerCase("pt-BR")}.`;
            } else if (value) {
                const validationMessage = field.validate?.(value);
                if (validationMessage) errors[field.key] = validationMessage;
            }
        }
        Object.assign(errors, props.validateValues?.(values) ?? {});
        if (Object.keys(errors).length) {
            setFieldErrors(errors);
            setFormError("Revise os campos destacados antes de salvar.");
            return;
        }

        setSaving(true);
        limparErrosDoFormulario();
        try {
            const path = editingItem
                ? `${props.endpoint}/${editingItem.id}`
                : props.endpoint;
            await apiRequest(path, {
                method: editingItem ? "PUT" : "POST",
                body: JSON.stringify(props.payloadFromValues(values, !!editingItem))
            }, token);
            setModalVisible(false);
            await carregar(false);
        } catch (error) {
            setFormError(mensagemDoErro(error));
            if (error instanceof ApiError) {
                const mappedErrors: Record<string, string> = {};
                for (const item of error.erros) {
                    if (props.fields.some(field => field.key === item.campo)) {
                        mappedErrors[item.campo] = item.mensagem;
                    }
                }
                setFieldErrors(mappedErrors);
                if (error.status === 401) await sair();
            }
        } finally {
            setSaving(false);
        }
    }

    async function excluir() {
        if (!deleteTarget) return;
        setDeleting(true);
        setDeleteError("");
        try {
            await apiRequest(`${props.endpoint}/${deleteTarget.id}`, { method: "DELETE" }, token);
            setDeleteTarget(null);
            await carregar(false);
        } catch (error) {
            setDeleteError(mensagemDoErro(error));
            if (error instanceof ApiError && error.status === 401) await sair();
        } finally {
            setDeleting(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Carregando {props.title.toLocaleLowerCase("pt-BR")}...</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <View style={styles.titleRow}>
                <View style={styles.heading}>
                    <Text style={styles.title}>{props.title}</Text>
                    <Text style={styles.count}>
                        {items.length} {items.length === 1 ? "registro" : "registros"}
                    </Text>
                </View>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Cadastrar ${props.singular.toLocaleLowerCase("pt-BR")}`}
                    accessibilityHint={!props.canCreate ? props.createDisabledMessage : undefined}
                    accessibilityState={{ disabled: props.canCreate === false }}
                    disabled={props.canCreate === false}
                    onPress={abrirCadastro}
                    style={({ pressed }) => [
                        styles.addButton,
                        pressed && styles.pressed,
                        props.canCreate === false && styles.disabled
                    ]}
                >
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Cadastrar</Text>
                </Pressable>
            </View>

            {!!props.createDisabledMessage && props.canCreate === false && (
                <View style={styles.notice}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                    <Text style={styles.noticeText}>{props.createDisabledMessage}</Text>
                    {!!props.onRetryCreateDisabled && (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Tentar carregar pacientes e médicos novamente"
                            onPress={props.onRetryCreateDisabled}
                            style={styles.retryButton}
                        >
                            <Text style={styles.retryText}>Tentar novamente</Text>
                        </Pressable>
                    )}
                </View>
            )}

            {!!listError && (
                <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
                    <Text accessibilityRole="alert" style={styles.bannerText}>{listError}</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Tentar carregar novamente"
                        onPress={() => void carregar()}
                        style={styles.retryButton}
                    >
                        <Text style={styles.retryText}>Tentar novamente</Text>
                    </Pressable>
                </View>
            )}

            <FlatList
                data={items}
                keyExtractor={item => String(item.id)}
                contentContainerStyle={items.length ? styles.list : styles.emptyList}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        tintColor={colors.primary}
                        onRefresh={() => {
                            setRefreshing(true);
                            void carregar(false);
                        }}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons
                            name={listError ? "cloud-offline-outline" : "file-tray-outline"}
                            size={38}
                            color={colors.muted}
                        />
                        <Text style={styles.emptyTitle}>
                            {listError ? "Não foi possível carregar" : props.emptyTitle ?? "Nenhum registro encontrado"}
                        </Text>
                        <Text style={styles.emptyText}>
                            {listError ? "Confira a conexão e tente carregar novamente." : props.emptyDescription ?? "Use Cadastrar para adicionar o primeiro."}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardBody}>
                            <Text style={styles.cardTitle}>{props.renderTitle(item)}</Text>
                            <View style={styles.details}>{props.renderDetails(item)}</View>
                        </View>
                        <View style={styles.actions}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Editar ${props.singular.toLocaleLowerCase("pt-BR")}`}
                                onPress={() => abrirEdicao(item)}
                                style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                            >
                                <Ionicons name="pencil-outline" size={20} color={colors.primary} />
                            </Pressable>
                            {(props.canDelete?.(item) ?? true) && (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel={`Excluir ${props.singular.toLocaleLowerCase("pt-BR")}`}
                                    onPress={() => {
                                        setDeleteError("");
                                        setDeleteTarget(item);
                                    }}
                                    style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                                >
                                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                                </Pressable>
                            )}
                        </View>
                    </View>
                )}
            />

            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => {
                    if (!saving) setModalVisible(false);
                }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.modal}
                >
                    <View style={styles.modalHeader}>
                        <View>
                            <Text style={styles.modalTitle}>
                                {editingItem ? "Editar" : "Cadastrar"} {props.singular.toLocaleLowerCase("pt-BR")}
                            </Text>
                            <Text style={styles.modalSubtitle}>Preencha os dados abaixo</Text>
                        </View>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Fechar formulário"
                            disabled={saving}
                            onPress={() => setModalVisible(false)}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color={colors.text} />
                        </Pressable>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.form}
                        keyboardShouldPersistTaps="handled"
                    >
                        {!!formError && (
                            <View style={styles.errorBanner}>
                                <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
                                <Text accessibilityRole="alert" style={styles.bannerText}>{formError}</Text>
                            </View>
                        )}
                        {props.fields.map(field => (
                            <FormField
                                key={field.key}
                                field={field}
                                value={values[field.key] ?? ""}
                                editing={!!editingItem}
                                error={fieldErrors[field.key]}
                                onChange={value => {
                                    setValues(current => ({ ...current, [field.key]: value }));
                                    setFieldErrors(current => {
                                        if (!current[field.key]) return current;
                                        const next = { ...current };
                                        delete next[field.key];
                                        return next;
                                    });
                                    setFormError("");
                                }}
                            />
                        ))}
                    </ScrollView>

                    <View style={styles.modalActions}>
                        <Pressable
                            accessibilityRole="button"
                            disabled={saving}
                            onPress={() => setModalVisible(false)}
                            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                        >
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </Pressable>
                        <Pressable
                            accessibilityRole="button"
                            disabled={saving}
                            onPress={() => void salvar()}
                            style={({ pressed }) => [
                                styles.saveButton,
                                pressed && styles.pressed,
                                saving && styles.disabled
                            ]}
                        >
                            {saving ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                                    <Text style={styles.saveText}>Salvar</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <Modal
                visible={!!deleteTarget}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    if (!deleting) setDeleteTarget(null);
                }}
            >
                <View style={styles.confirmOverlay}>
                    <View style={styles.confirmCard}>
                        <Text style={styles.confirmTitle}>Excluir {props.singular.toLocaleLowerCase("pt-BR")}?</Text>
                        <Text style={styles.confirmText}>
                            Deseja excluir “{deleteTarget ? props.renderTitle(deleteTarget) : ""}”?
                        </Text>
                        {!!deleteError && <Text accessibilityRole="alert" style={styles.error}>{deleteError}</Text>}
                        <View style={styles.confirmActions}>
                            <Pressable
                                accessibilityRole="button"
                                disabled={deleting}
                                onPress={() => setDeleteTarget(null)}
                                style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                            >
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </Pressable>
                            <Pressable
                                accessibilityRole="button"
                                disabled={deleting}
                                onPress={() => void excluir()}
                                style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed, deleting && styles.disabled]}
                            >
                                {deleting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>Excluir</Text>}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loadingText: { color: colors.muted, fontSize: 15 },
    titleRow: {
        minHeight: 82, paddingHorizontal: 18, paddingVertical: 14,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface
    },
    heading: { flex: 1 },
    title: { color: colors.text, fontSize: 24, fontWeight: "700" },
    count: { color: colors.muted, fontSize: 13, marginTop: 3 },
    addButton: {
        minHeight: 42, borderRadius: 6, paddingHorizontal: 12,
        backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", gap: 5
    },
    addButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
    notice: {
        marginHorizontal: 14, marginTop: 12, padding: 12, borderRadius: 6,
        backgroundColor: "#EAF3F1", flexDirection: "row", alignItems: "flex-start", gap: 8
    },
    noticeText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 20 },
    errorBanner: {
        marginHorizontal: 14, marginTop: 12, padding: 12, borderRadius: 6,
        backgroundColor: "#FBEDEC", flexDirection: "row", alignItems: "center", gap: 8
    },
    bannerText: { flex: 1, color: colors.danger, fontSize: 14, lineHeight: 19 },
    retryButton: { padding: 5 },
    retryText: { color: colors.primary, fontSize: 13, fontWeight: "700" },
    list: { padding: 14, gap: 10 },
    emptyList: { flexGrow: 1 },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
    emptyTitle: { color: colors.text, fontSize: 17, fontWeight: "700", marginTop: 12 },
    emptyText: { color: colors.muted, fontSize: 14, marginTop: 4, textAlign: "center" },
    card: {
        minHeight: 98, backgroundColor: colors.surface, borderWidth: 1,
        borderColor: colors.border, borderRadius: 8, padding: 14,
        flexDirection: "row", alignItems: "center", gap: 10
    },
    cardBody: { flex: 1 },
    cardTitle: { color: colors.text, fontSize: 17, fontWeight: "700" },
    details: { marginTop: 7, gap: 3 },
    actions: { flexDirection: "row", gap: 4 },
    iconButton: {
        width: 40, height: 40, alignItems: "center", justifyContent: "center",
        borderRadius: 6, borderWidth: 1, borderColor: colors.border
    },
    pressed: { opacity: 0.65 },
    modal: { flex: 1, backgroundColor: colors.background },
    modalHeader: {
        paddingHorizontal: 18, paddingVertical: 16, backgroundColor: colors.surface,
        borderBottomWidth: 1, borderBottomColor: colors.border,
        flexDirection: "row", justifyContent: "space-between", alignItems: "center"
    },
    modalTitle: { color: colors.text, fontSize: 20, fontWeight: "700" },
    modalSubtitle: { color: colors.muted, fontSize: 13, marginTop: 2 },
    closeButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
    form: { padding: 18, gap: 15 },
    modalActions: {
        minHeight: 76, padding: 14, borderTopWidth: 1, borderTopColor: colors.border,
        backgroundColor: colors.surface, flexDirection: "row", gap: 10
    },
    cancelButton: {
        flex: 1, height: 48, alignItems: "center", justifyContent: "center",
        borderRadius: 6, borderWidth: 1, borderColor: colors.border
    },
    cancelText: { color: colors.text, fontSize: 15, fontWeight: "700" },
    saveButton: {
        flex: 1, height: 48, alignItems: "center", justifyContent: "center",
        borderRadius: 6, backgroundColor: colors.primary, flexDirection: "row", gap: 7
    },
    deleteButton: {
        flex: 1, height: 48, alignItems: "center", justifyContent: "center",
        borderRadius: 6, backgroundColor: colors.danger
    },
    saveText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
    disabled: { opacity: 0.55 },
    confirmOverlay: {
        flex: 1, alignItems: "center", justifyContent: "center",
        padding: 24, backgroundColor: colors.overlay
    },
    confirmCard: {
        width: "100%", maxWidth: 420, padding: 20, gap: 12,
        borderRadius: 10, backgroundColor: colors.surface
    },
    confirmTitle: { color: colors.text, fontSize: 19, fontWeight: "700" },
    confirmText: { color: colors.muted, fontSize: 15, lineHeight: 21 },
    confirmActions: { flexDirection: "row", gap: 10, marginTop: 4 },
    error: { color: colors.danger, fontSize: 13 }
});
