// app/navigation/CreateNavigation.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import Create from '../screens/Home/Create';

const Stack = createNativeStackNavigator();

const CreateNavigation = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
        },
        animation: 'slide_from_bottom',
        presentation: 'modal',
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShown: false,
      }}
    >
      <Stack.Screen
        name='createListing'
        component={Create}
        options={{
          headerTitle: 'Create Listing',
          headerBackTitle: 'Cancel',
        }}
      />
    </Stack.Navigator>
  );
};

export default CreateNavigation;
