import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import ChatHeader from '../components/ChatHeader';
import Chat from '../screens/Message/Chat';
import Chats from '../screens/Message/Chats';

const Stack = createNativeStackNavigator();

const ConversationNavigator = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name='chats'
        component={Chats}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='chat'
        component={Chat}
        options={{
          headerTitle: (props: any) => <ChatHeader {...props} />,
          headerBackTitle: 'Chats',
        }}
      />
    </Stack.Navigator>
  );
};

export default ConversationNavigator;
