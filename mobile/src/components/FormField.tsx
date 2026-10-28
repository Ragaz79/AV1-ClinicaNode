import { Picker } from "@react-native-picker/picker";
import {
    KeyboardTypeOptions,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { colors } from "../theme";

export interface SelectOption {
    label: string;
    value: string;
}

export interface FormFieldSpec {
    key: string;
    label: string;
    type?: "text" | "password" | "select";
    placeholder?: string;
    options?: SelectOption[];
    keyboardType?: KeyboardTypeOptions;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    required?: boolean;
    editOptional?: boolean;
}

interface FormFieldProps {
    field: FormFieldSpec;
    value: string;
    editing: boolean;
    onChange(value: string): void;
}

export function FormField({ field, value, editing, onChange }: FormFieldProps) {
    const opcional = field.required === false || (editing && field.editOptional);

    return (
        <View style={styles.group}>
            <Text style={styles.label}>
                {field.label}{opcional ? " (opcional)" : ""}
            </Text>

            {field.type === "select" ? (
                <View style={styles.pickerContainer}>
                    <Picker
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
                    value={value}
                    onChangeText={onChange}
                    placeholder={field.placeholder}
                    placeholderTextColor="#8A9694"
                    secureTextEntry={field.type === "password"}
                    keyboardType={field.keyboardType}
                    autoCapitalize={field.autoCapitalize ?? "sentences"}
                    autoCorrect={false}
                    style={styles.input}
                />
            )}
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
    }
});

