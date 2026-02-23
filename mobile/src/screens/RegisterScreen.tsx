import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, useAuth, useToast } from '@/hooks';
import type { AuthStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

const registerSchema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterScreen(): React.JSX.Element {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { register, isLoading } = useAuth();
  const { showError, showSuccess } = useToast();
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: RegisterFormValues): Promise<void> => {
    try {
      await register(values.email, values.password, values.displayName);
      showSuccess('Account Created', `Welcome, ${values.displayName}!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      showError('Registration Failed', message);
    }
  };

  const styles = StyleSheet.create({
    flex: { flex: 1 },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing[6],
      paddingVertical: theme.spacing[10],
    },
    header: {
      marginBottom: theme.spacing[8],
    },
    appName: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
      marginBottom: theme.spacing[2],
    },
    subtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      padding: theme.spacing[6],
      ...theme.shadows.md,
    },
    fieldWrapper: {
      marginBottom: theme.spacing[4],
    },
    fieldLabel: {
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
    inputError: {
      borderColor: theme.colors.error,
    },
    errorText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.error,
      marginTop: theme.spacing[1],
    },
    passwordWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    passwordInput: {
      flex: 1,
      height: 48,
      paddingHorizontal: theme.spacing[4],
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
    },
    passwordToggle: {
      paddingHorizontal: theme.spacing[3],
      height: 48,
      justifyContent: 'center',
    },
    passwordToggleText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.medium,
    },
    submitButton: {
      height: 52,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing[2],
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.semiBold,
    },
    footer: {
      marginTop: theme.spacing[6],
      alignItems: 'center',
    },
    footerText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    },
    footerLink: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
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
          <View style={styles.header}>
            <Text style={styles.appName}>ForgeAI Builder</Text>
            <Text style={styles.subtitle}>Create your account to get started</Text>
          </View>

          <View style={styles.card}>
            {/* Display Name */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <Controller
                control={control}
                name="displayName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.displayName ? styles.inputError : null]}
                    placeholder="Alice Chen"
                    placeholderTextColor={theme.colors.text.tertiary}
                    autoCapitalize="words"
                    autoCorrect={false}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.displayName ? (
                <Text style={styles.errorText}>{errors.displayName.message}</Text>
              ) : null}
            </View>

            {/* Email */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.email ? styles.inputError : null]}
                    placeholder="you@example.com"
                    placeholderTextColor={theme.colors.text.tertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              ) : null}
            </View>

            {/* Password */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[styles.passwordWrapper, errors.password ? styles.inputError : null]}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Min. 8 characters"
                      placeholderTextColor={theme.colors.text.tertiary}
                      secureTextEntry={securePassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setSecurePassword((prev) => !prev)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.passwordToggleText}>
                        {securePassword ? 'Show' : 'Hide'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              ) : null}
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Confirm Password</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    style={[styles.passwordWrapper, errors.confirmPassword ? styles.inputError : null]}
                  >
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Re-enter password"
                      placeholderTextColor={theme.colors.text.tertiary}
                      secureTextEntry={secureConfirm}
                      autoCapitalize="none"
                      autoCorrect={false}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setSecureConfirm((prev) => !prev)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.passwordToggleText}>
                        {secureConfirm ? 'Show' : 'Hide'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading ? styles.submitButtonDisabled : null]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
