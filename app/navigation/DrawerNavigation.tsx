import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTheme } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomDrawer from '../components/custom/CustomDrawer';
import Notify from '../screens/notification/Notify';
import Help from '../screens/support /help';
import AccountNavigation from './AccountNavigation';
import ConversationNavigator from './ConversationNavigation';
import MyListingNavigation from './ListingNavigation';
import TabNavigation from './TabNavigation';

const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {
  const theme = useTheme();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: {
          backgroundColor: theme.colors.background,
          width: 280,
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurfaceVariant,
        drawerActiveBackgroundColor: theme.colors.primaryContainer,
        drawerInactiveBackgroundColor: 'transparent',
        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 12,
          paddingHorizontal: 12,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          marginLeft: -16,
        },
        overlayColor: 'rgba(0,0,0,0.5)',
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen
        name='home'
        component={TabNavigation}
        options={{
          drawerLabel: ' Home',
          drawerIcon: ({ color, size }) => (
            <Ionicons name='home-outline' color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name='myListings'
        component={MyListingNavigation}
        options={{
          drawerLabel: ' My Listings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name='list-outline' color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name='conversation'
        component={ConversationNavigator}
        options={{
          drawerLabel: ' Messages',
          drawerIcon: ({ color, size }) => (
            <Ionicons name='chatbubbles-outline' color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name='account'
        component={AccountNavigation}
        options={{
          drawerLabel: ' Profile',
          drawerIcon: ({ color, size }) => (
            <Ionicons name='person-outline' color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name='notifications'
        component={Notify}
        options={{
          drawerLabel: ' Notifications',
          drawerIcon: ({ color, size }) => (
            <Ionicons name='notifications-outline' color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name='help'
        component={Help}
        options={{
          drawerLabel: ' Help & Support',
          drawerIcon: ({ color, size }) => (
            <Ionicons name='help-circle-outline' color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigation;
