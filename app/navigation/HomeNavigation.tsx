import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme } from 'react-native-paper';
import CommentsScreen from '../screens/Home/Comments';
import Details from '../screens/Home/Details';
import Home from '../screens/Home/Home';
import Search from '../screens/Home/Search';

const Stack = createNativeStackNavigator();

const HomeNavigation = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
      initialRouteName='listings'
    >
      <Stack.Group>
        <Stack.Screen
          name='listings'
          component={Home}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name='details'
          component={Details}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name='search'
          component={Search}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
      </Stack.Group>
      <Stack.Group
        screenOptions={{
          presentation: 'transparentModal',
          animation: 'fade',
        }}
      >
        <Stack.Screen name='comments' component={CommentsScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default HomeNavigation;
