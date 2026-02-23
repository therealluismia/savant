import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/HomeScreen';
import {
  ProjectsListScreen,
  CreateProjectScreen,
  ProjectDetailScreen,
  BuildLogsScreen,
} from '@/features/projects';
import { useTheme } from '@/hooks';
import type { AppStackParamList } from '@/types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack(): React.JSX.Element {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontWeight: theme.typography.fontWeight.semiBold,
          fontSize: theme.typography.fontSize.lg,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'ForgeAI Builder' }}
      />
      <Stack.Screen
        name="ProjectsList"
        component={ProjectsListScreen}
        options={{ title: 'Projects' }}
      />
      <Stack.Screen
        name="CreateProject"
        component={CreateProjectScreen}
        options={{ title: 'New Project' }}
      />
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={{ title: 'Project' }}
      />
      <Stack.Screen
        name="BuildLogs"
        component={BuildLogsScreen}
        options={{
          title: 'Build Logs',
          headerStyle: { backgroundColor: '#020617' },
          headerTintColor: '#F8FAFC',
          headerTitleStyle: {
            fontWeight: theme.typography.fontWeight.semiBold,
            fontSize: theme.typography.fontSize.lg,
          },
          contentStyle: { backgroundColor: '#020617' },
        }}
      />
    </Stack.Navigator>
  );
}
