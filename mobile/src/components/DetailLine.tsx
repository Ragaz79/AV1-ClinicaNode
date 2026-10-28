import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

interface DetailLineProps {
    label: string;
    value: string;
}

export function DetailLine({ label, value }: DetailLineProps) {
    return (
        <View style={styles.line}>
            <Text style={styles.label}>{label}:</Text>
            <Text style={styles.value} numberOfLines={2}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    line: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 5
    },
    label: {
        color: colors.muted,
        fontSize: 13,
        fontWeight: "600"
    },
    value: {
        flex: 1,
        color: colors.text,
        fontSize: 13
    }
});

