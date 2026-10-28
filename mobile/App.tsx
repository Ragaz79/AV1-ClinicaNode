import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { ConsultasScreen } from "./src/screens/ConsultasScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { MedicosScreen } from "./src/screens/MedicosScreen";
import { PacientesScreen } from "./src/screens/PacientesScreen";
import { UsuariosScreen } from "./src/screens/UsuariosScreen";
import { colors } from "./src/theme";

type Tab = "pacientes" | "medicos" | "consultas" | "usuarios";

const tabs = [
    { key: "pacientes" as const, label: "Pacientes", icon: "people-outline" as const },
    { key: "medicos" as const, label: "Medicos", icon: "medical-outline" as const },
    { key: "consultas" as const, label: "Consultas", icon: "calendar-outline" as const },
    { key: "usuarios" as const, label: "Usuarios", icon: "person-circle-outline" as const }
];

function ConteudoAutenticado() {
    const { usuario, sair } = useAuth();
    const [tab, setTab] = useState<Tab>("pacientes");

    function confirmarSaida() {
        if (Platform.OS === "web") {
            if (globalThis.confirm("Deseja encerrar sua sessao?")) {
                void sair();
            }
            return;
        }

        Alert.alert("Sair", "Deseja encerrar sua sessao?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Sair", style: "destructive", onPress: () => void sair() }
        ]);
    }

    function renderScreen() {
        switch (tab) {
            case "medicos":
                return <MedicosScreen />;
            case "consultas":
                return <ConsultasScreen />;
            case "usuarios":
                return <UsuariosScreen />;
            default:
                return <PacientesScreen />;
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <View style={styles.headerBrand}>
                    <Ionicons name="medkit" size={22} color="#FFFFFF" />
                    <View>
                        <Text style={styles.brandName}>Clinica</Text>
                        <Text style={styles.userName} numberOfLines={1}>{usuario?.nome}</Text>
                    </View>
                </View>
                <Pressable
                    accessibilityLabel="Sair"
                    onPress={confirmarSaida}
                    style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
                >
                    <Ionicons name="log-out-outline" size={23} color="#FFFFFF" />
                </Pressable>
            </View>

            <View style={styles.content}>{renderScreen()}</View>

            <View style={styles.tabBar}>
                {tabs.map(item => {
                    const active = tab === item.key;
                    return (
                        <Pressable
                            key={item.key}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: active }}
                            onPress={() => setTab(item.key)}
                            style={({ pressed }) => [
                                styles.tab,
                                active && styles.activeTab,
                                pressed && styles.pressed
                            ]}
                        >
                            <Ionicons
                                name={item.icon}
                                size={22}
                                color={active ? colors.primary : colors.muted}
                            />
                            <Text
                                numberOfLines={1}
                                style={[styles.tabLabel, active && styles.activeTabLabel]}
                            >
                                {item.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </SafeAreaView>
    );
}

function Root() {
    const { token, carregando } = useAuth();

    if (carregando) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return token ? <ConteudoAutenticado /> : <LoginScreen />;
}

export default function App() {
    return (
        <AuthProvider>
            <Root />
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.primaryDark
    },
    loading: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background
    },
    header: {
        minHeight: 64,
        paddingHorizontal: 16,
        paddingVertical: 9,
        backgroundColor: colors.primaryDark,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    headerBrand: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    brandName: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "800"
    },
    userName: {
        maxWidth: 220,
        color: "#C8E0DC",
        fontSize: 12,
        marginTop: 1
    },
    logoutButton: {
        width: 42,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6
    },
    content: {
        flex: 1,
        backgroundColor: colors.background
    },
    tabBar: {
        minHeight: 66,
        paddingHorizontal: 4,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        flexDirection: "row"
    },
    tab: {
        flex: 1,
        minWidth: 0,
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        borderTopWidth: 3,
        borderTopColor: "transparent"
    },
    activeTab: {
        borderTopColor: colors.accent
    },
    tabLabel: {
        color: colors.muted,
        fontSize: 11,
        fontWeight: "600"
    },
    activeTabLabel: {
        color: colors.primary,
        fontWeight: "800"
    },
    pressed: {
        opacity: 0.65
    }
});

