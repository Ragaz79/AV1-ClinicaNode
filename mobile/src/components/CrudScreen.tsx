import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    Alert,
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
}

export function CrudScreen<T extends { id: number }>(props: CrudScreenProps<T>) {
    const { token, sair } = useAuth();
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const [values, setValues] = useState<FormValues>(props.initialValues);

    const tratarErro = useCallback(async (error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
            Alert.alert("Sessao encerrada", "Entre novamente para continuar.");
            await sair();
            return;
        }
        Alert.alert(
            "Nao foi possivel concluir",
            error instanceof Error ? error.message : "Tente novamente."
        );
    }, [sair]);

    const carregar = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const data = await apiRequest<T[]>(props.endpoint, {}, token);
            setItems(data);
        } catch (error) {
            await tratarErro(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [props.endpoint, token, tratarErro]);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    function abrirCadastro() {
        setEditingItem(null);
        setValues({ ...props.initialValues });
        setModalVisible(true);
    }

    function abrirEdicao(item: T) {
        setEditingItem(item);
        setValues(props.valuesFromItem(item));
        setModalVisible(true);
    }

    async function salvar() {
        const campoAusente = props.fields.find(field => {
            const opcional = field.required === false || (!!editingItem && field.editOptional);
            return !opcional && !values[field.key]?.trim();
        });
        if (campoAusente) {
            Alert.alert("Campo obrigatorio", `Preencha o campo ${campoAusente.label}.`);
            return;
        }

        setSaving(true);
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
            await tratarErro(error);
        } finally {
            setSaving(false);
        }
    }

    function confirmarExclusao(item: T) {
        Alert.alert(
            `Excluir ${props.singular.toLowerCase()}`,
            `Deseja excluir "${props.renderTitle(item)}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: () => void excluir(item)
                }
            ]
        );
    }

    async function excluir(item: T) {
        try {
            await apiRequest(`${props.endpoint}/${item.id}`, { method: "DELETE" }, token);
            await carregar(false);
        } catch (error) {
            await tratarErro(error);
        }
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Carregando {props.title.toLowerCase()}...</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <View style={styles.titleRow}>
                <View>
                    <Text style={styles.title}>{props.title}</Text>
                    <Text style={styles.count}>
                        {items.length} {items.length === 1 ? "registro" : "registros"}
                    </Text>
                </View>
                <Pressable
                    accessibilityLabel={`Cadastrar ${props.singular.toLowerCase()}`}
                    onPress={abrirCadastro}
                    style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
                >
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Cadastrar</Text>
                </Pressable>
            </View>

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
                        <Ionicons name="file-tray-outline" size={38} color={colors.muted} />
                        <Text style={styles.emptyTitle}>Nenhum registro encontrado</Text>
                        <Text style={styles.emptyText}>Use Cadastrar para adicionar o primeiro.</Text>
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
                                accessibilityLabel="Editar"
                                onPress={() => abrirEdicao(item)}
                                style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                            >
                                <Ionicons name="pencil-outline" size={20} color={colors.primary} />
                            </Pressable>
                            {(props.canDelete?.(item) ?? true) && (
                                <Pressable
                                    accessibilityLabel="Excluir"
                                    onPress={() => confirmarExclusao(item)}
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
                                {editingItem ? "Editar" : "Cadastrar"} {props.singular.toLowerCase()}
                            </Text>
                            <Text style={styles.modalSubtitle}>Preencha os dados abaixo</Text>
                        </View>
                        <Pressable
                            accessibilityLabel="Fechar"
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
                        {props.fields.map(field => (
                            <FormField
                                key={field.key}
                                field={field}
                                value={values[field.key] ?? ""}
                                editing={!!editingItem}
                                onChange={value => setValues(current => ({
                                    ...current,
                                    [field.key]: value
                                }))}
                            />
                        ))}
                    </ScrollView>

                    <View style={styles.modalActions}>
                        <Pressable
                            disabled={saving}
                            onPress={() => setModalVisible(false)}
                            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                        >
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </Pressable>
                        <Pressable
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
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12
    },
    loadingText: {
        color: colors.muted,
        fontSize: 15
    },
    titleRow: {
        minHeight: 82,
        paddingHorizontal: 18,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface
    },
    title: {
        color: colors.text,
        fontSize: 24,
        fontWeight: "700"
    },
    count: {
        color: colors.muted,
        fontSize: 13,
        marginTop: 3
    },
    addButton: {
        height: 42,
        borderRadius: 6,
        paddingHorizontal: 12,
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        gap: 5
    },
    addButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700"
    },
    list: {
        padding: 14,
        gap: 10
    },
    emptyList: {
        flexGrow: 1
    },
    empty: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24
    },
    emptyTitle: {
        color: colors.text,
        fontSize: 17,
        fontWeight: "700",
        marginTop: 12
    },
    emptyText: {
        color: colors.muted,
        fontSize: 14,
        marginTop: 4,
        textAlign: "center"
    },
    card: {
        minHeight: 98,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    cardBody: {
        flex: 1
    },
    cardTitle: {
        color: colors.text,
        fontSize: 17,
        fontWeight: "700"
    },
    details: {
        marginTop: 7,
        gap: 3
    },
    actions: {
        flexDirection: "row",
        gap: 4
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.border
    },
    pressed: {
        opacity: 0.65
    },
    modal: {
        flex: 1,
        backgroundColor: colors.background
    },
    modalHeader: {
        paddingHorizontal: 18,
        paddingVertical: 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    modalTitle: {
        color: colors.text,
        fontSize: 20,
        fontWeight: "700"
    },
    modalSubtitle: {
        color: colors.muted,
        fontSize: 13,
        marginTop: 2
    },
    closeButton: {
        width: 42,
        height: 42,
        alignItems: "center",
        justifyContent: "center"
    },
    form: {
        padding: 18,
        gap: 15
    },
    modalActions: {
        minHeight: 76,
        padding: 14,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
        flexDirection: "row",
        gap: 10
    },
    cancelButton: {
        flex: 1,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.border
    },
    cancelText: {
        color: colors.text,
        fontSize: 15,
        fontWeight: "700"
    },
    saveButton: {
        flex: 1,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        backgroundColor: colors.primary,
        flexDirection: "row",
        gap: 7
    },
    saveText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700"
    },
    disabled: {
        opacity: 0.55
    }
});

