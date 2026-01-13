import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import EditProfile from '../screens/User/EditProfile';
import Profile from '../screens/User/Profile';

const Stack = createNativeStackNavigator();

const AccountNavigation = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName='profile'
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen name='profile' component={Profile} />
      <Stack.Screen
        name='edit-profile'
        component={EditProfile}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default AccountNavigation;
