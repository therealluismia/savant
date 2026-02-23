import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, useToast } from '@/hooks';
import { useProjects } from '../hooks/useProjects';
import type { AppStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

const schema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(48, 'Name must be under 48 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description must be under 200 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function CreateProjectScreen(): React.JSX.Element {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { createProject, isLoading: globalLoading } = useProjects();
  const { showSuccess, showError } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  const isLoading = isSubmitting || globalLoading;

  const onSubmit = async (values: FormValues): Promise<void> => {
    try {
      const project = await createProject({ name: values.name, description: values.description });
      showSuccess('Project created', `"${project.name}" is ready.`);
      navigation.navigate('ProjectDetail', { projectId: project.id });
    } catch {
      showError('Creation failed', 'Could not create project. Please try again.');
    }
  };

  const styles = StyleSheet.create({
    flex: { flex: 1 },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: theme.spacing[5],
      paddingBottom: theme.spacing[12],
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semiBold,
      color: theme.colors.text.secondary,
      letterSpacing: theme.typography.letterSpacing.wider,
      marginBottom: theme.spacing[4],
      textTransform: 'uppercase',
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      padding: theme.spacing[5],
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing[5],
    },
    fieldWrapper: {
      marginBottom: theme.spacing[4],
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[1.5],
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing[4],
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    inputError: { borderColor: theme.colors.error },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
      paddingTop: theme.spacing[3],
    },
    errorText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.error,
      marginTop: theme.spacing[1],
    },
    submitBtn: {
      height: 52,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitBtnDisabled: { opacity: 0.6 },
    submitText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semiBold,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Project Details</Text>
          <View style={styles.card}>
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Project Name</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.name ? styles.inputError : undefined]}
                    placeholder="e.g. Neural Gateway"
                    placeholderTextColor={theme.colors.text.tertiary}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                )}
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name.message}</Text> : null}
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Description</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea, errors.description ? styles.inputError : undefined]}
                    placeholder="Describe what this project does..."
                    placeholderTextColor={theme.colors.text.tertiary}
                    multiline
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    returnKeyType="done"
                  />
                )}
              />
              {errors.description ? (
                <Text style={styles.errorText}>{errors.description.message}</Text>
              ) : null}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, isLoading ? styles.submitBtnDisabled : undefined]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>
              {isLoading ? 'Creating...' : 'Create Project'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
