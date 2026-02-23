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
import { useTheme, useToast } from '@/hooks';
import { simulateLatency } from '@/mock/latencySimulator';
import type { AuthStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordScreen(): React.JSX.Element {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotFormValues): Promise<void> => {
    setIsLoading(true);
    try {
      // Mock: simulate an email send (always succeeds)
      await simulateLatency(null, 800);
      setSent(true);
      showSuccess('Email Sent', `Check ${values.email} for a reset link.`);
    } catch {
      showError('Request Failed', 'Could not send reset email. Please try again.');
    } finally {
      setIsLoading(false);
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
    successBox: {
      backgroundColor: theme.colors.successSubtle,
      borderRadius: theme.radii.lg,
      padding: theme.spacing[5],
      alignItems: 'center',
      marginBottom: theme.spacing[5],
    },
    successTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semiBold,
      color: theme.colors.success,
      marginBottom: theme.spacing[1],
    },
    successBody: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      textAlign: 'center',
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
    hint: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.tertiary,
      marginTop: theme.spacing[1],
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
            <Text style={styles.subtitle}>Reset your password</Text>
          </View>

          <View style={styles.card}>
            {sent ? (
              <View style={styles.successBox}>
                <Text style={styles.successTitle}>Check your inbox</Text>
                <Text style={styles.successBody}>
                  We sent a reset link to {getValues('email')}. Follow the link to set a new password.
                </Text>
              </View>
            ) : null}

            {!sent ? (
              <>
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
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
                  <Text style={styles.hint}>
                    Enter the email associated with your account.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, isLoading ? styles.submitButtonDisabled : null]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.submitButtonText}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.85}
              >
                <Text style={styles.submitButtonText}>Back to Sign In</Text>
              </TouchableOpacity>
            )}
          </View>

          {!sent ? (
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                <Text style={styles.footerLink}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
