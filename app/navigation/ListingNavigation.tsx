import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import EditListing from '../screens/Mylistings/EditListing';
import Listing from '../screens/Mylistings/Listing';
import Listings from '../screens/Mylistings/Listings';

const Stack = createNativeStackNavigator();

const MyListingNavigation = () => {
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
        headerShadowVisible: true,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name='MyListingScreen'
        component={Listings}
        options={{
          headerTitle: 'My Listings',
        }}
      />
      <Stack.Screen
        name='edit-listing'
        component={EditListing}
        options={{
          headerTitle: 'Edit Listing',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name='info'
        component={Listing}
        options={{
          headerTitle: 'Listing Details',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
};

export default MyListingNavigation;
