import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme } from 'react-native-paper';
import ResetPwd from '../screens/Auth/ResetPWD';
import SignIn from '../screens/Auth/SignIn';
import SignUp from '../screens/Auth/SignUp';
import VerifyEmail from '../screens/Auth/VerifyEmail';
import Welcome from '../screens/Auth/Welcome';

const Stack = createNativeStackNavigator();

const AuthNavigation = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName='welcome'
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name='welcome'
        component={Welcome}
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name='sign-in'
        component={SignIn}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name='sign-up'
        component={SignUp}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name='verify'
        component={VerifyEmail}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name='reset'
        component={ResetPwd}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigation;
