import { Picker } from "@react-native-picker/picker";
import {
    KeyboardTypeOptions,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { colors } from "../theme";
import { maskCpfInput, maskDateInput, maskPhoneInput, maskTimeInput } from "../utils/dateTime";

export interface SelectOption {
    label: string;
    value: string;
}

export interface FormFieldSpec {
    key: string;
    label: string;
    type?: "text" | "password" | "select" | "date" | "time" | "cpf" | "phone";
    placeholder?: string;
    options?: SelectOption[];
    keyboardType?: KeyboardTypeOptions;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    required?: boolean;
    editOptional?: boolean;
    validate?(value: string): string | undefined;
}

interface FormFieldProps {
    field: FormFieldSpec;
    value: string;
    editing: boolean;
    error?: string;
    onChange(value: string): void;
}

export function FormField({ field, value, editing, error, onChange }: FormFieldProps) {
    const opcional = field.required === false || (editing && field.editOptional);
    const inputValue = (nextValue: string) => {
        if (field.type === "date") return maskDateInput(nextValue);
        if (field.type === "time") return maskTimeInput(nextValue);
        if (field.type === "cpf") return maskCpfInput(nextValue);
        if (field.type === "phone") return maskPhoneInput(nextValue);
        return nextValue;
    };

    return (
        <View style={styles.group}>
            <Text style={styles.label}>
                {field.label}{opcional ? " (opcional)" : ""}
            </Text>

            {field.type === "select" ? (
                <View style={[styles.pickerContainer, error && styles.invalid]}>
                    <Picker
                        accessibilityLabel={field.label}
                        selectedValue={value}
                        onValueChange={itemValue => onChange(String(itemValue))}
                        style={styles.picker}
                    >
                        <Picker.Item label="Selecione..." value="" />
                        {field.options?.map(option => (
                            <Picker.Item
                                key={option.value}
                                label={option.label}
                                value={option.value}
                            />
                        ))}
                    </Picker>
                </View>
            ) : (
                <TextInput
                    accessibilityLabel={field.label}
                    accessibilityHint={error}
                    value={value}
                    onChangeText={nextValue => onChange(inputValue(nextValue))}
                    placeholder={field.placeholder}
                    placeholderTextColor="#8A9694"
                    secureTextEntry={field.type === "password"}
                    keyboardType={field.keyboardType ?? (
                        field.type === "date" || field.type === "time" || field.type === "cpf" ? "number-pad" :
                            field.type === "phone" ? "phone-pad" : undefined
                    )}
                    autoCapitalize={field.autoCapitalize ?? "sentences"}
                    autoCorrect={false}
                    maxLength={field.type === "date" || field.type === "cpf" ? 14 : field.type === "time" ? 5 : field.type === "phone" ? 16 : undefined}
                    style={[styles.input, error && styles.invalid]}
                />
            )}
            {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    group: {
        gap: 6
    },
    label: {
        color: colors.text,
        fontSize: 14,
        fontWeight: "600"
    },
    input: {
        minHeight: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        backgroundColor: colors.surface,
        paddingHorizontal: 12,
        color: colors.text,
        fontSize: 16
    },
    pickerContainer: {
        minHeight: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        backgroundColor: colors.surface,
        overflow: "hidden",
        justifyContent: "center"
    },
    picker: {
        color: colors.text
    },
    invalid: {
        borderColor: colors.danger
    },
    error: {
        color: colors.danger,
        fontSize: 13
    }
});
