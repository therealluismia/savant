import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useTheme } from '@/hooks';
import { useThemeStore } from '@/store';
import { hapticSelection, hapticLight } from '@/utils/haptics';
import type { ThemeMode } from '@/types';

interface ThemeOptionProps {
  label: string;
  description: string;
  value: ThemeMode;
  selected: boolean;
  onSelect: () => void;
}

function ThemeOption({ label, description, value: _value, selected, onSelect }: ThemeOptionProps): React.JSX.Element {
  const theme = useTheme();

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderSubtle,
    },
    info: { flex: 1 },
    label: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[0.5],
    },
    description: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.tertiary,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: theme.radii.full,
      borderWidth: 2,
      borderColor: selected ? theme.colors.primary : theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.primary,
    },
  });

  return (
    <TouchableOpacity style={styles.row} onPress={() => { hapticSelection(); onSelect(); }} activeOpacity={0.7}>
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.radio}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </TouchableOpacity>
  );
}

interface SettingRowProps {
  label: string;
  description?: string;
  value: boolean;
  onToggle: (val: boolean) => void;
}

function SettingRow({ label, description, value, onToggle }: SettingRowProps): React.JSX.Element {
  const theme = useTheme();

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderSubtle,
    },
    info: { flex: 1, marginRight: theme.spacing[3] },
    label: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.primary,
    },
    description: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.tertiary,
      marginTop: theme.spacing[0.5],
    },
  });

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={(val) => { hapticLight(); onToggle(val); }}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor={theme.colors.surface}
      />
    </View>
  );
}

export default function SettingsScreen(): React.JSX.Element {
  const theme = useTheme();
  const { mode, setMode } = useThemeStore();

  // Derived booleans for non-theme toggles (mock state — no persistence needed for these)
  const [buildNotifications, setBuildNotifications] = React.useState(true);
  const [autoRefresh, setAutoRefresh] = React.useState(true);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: {
      paddingHorizontal: theme.spacing[5],
      paddingBottom: theme.spacing[12],
      paddingTop: theme.spacing[2],
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semiBold,
      color: theme.colors.text.secondary,
      letterSpacing: theme.typography.letterSpacing.wider,
      textTransform: 'uppercase',
      marginTop: theme.spacing[6],
      marginBottom: theme.spacing[3],
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      paddingHorizontal: theme.spacing[5],
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    versionRow: {
      paddingVertical: theme.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderSubtle,
    },
    versionLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.tertiary,
    },
    versionValue: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeight.medium,
      marginTop: theme.spacing[0.5],
    },
    lastRow: {
      borderBottomWidth: 0,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.card}>
          <ThemeOption
            label="System Default"
            description="Follows your device's light/dark mode setting"
            value="system"
            selected={mode === 'system'}
            onSelect={() => { void setMode('system'); }}
          />
          <ThemeOption
            label="Light"
            description="Always use the light theme"
            value="light"
            selected={mode === 'light'}
            onSelect={() => { void setMode('light'); }}
          />
          <ThemeOption
            label="Dark"
            description="Always use the dark theme"
            value="dark"
            selected={mode === 'dark'}
            onSelect={() => { void setMode('dark'); }}
          />
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <SettingRow
            label="Build Alerts"
            description="Get notified when builds succeed or fail"
            value={buildNotifications}
            onToggle={setBuildNotifications}
          />
          <View style={styles.lastRow}>
            <SettingRow
              label="Auto-Refresh Projects"
              description="Automatically refresh project statuses"
              value={autoRefresh}
              onToggle={setAutoRefresh}
            />
          </View>
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>App Version</Text>
            <Text style={styles.versionValue}>1.0.0 (mock)</Text>
          </View>
          <View style={[styles.versionRow, styles.lastRow]}>
            <Text style={styles.versionLabel}>Environment</Text>
            <Text style={styles.versionValue}>Development</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
