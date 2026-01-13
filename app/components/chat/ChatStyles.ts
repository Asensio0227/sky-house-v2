import { StyleSheet } from 'react-native';
import { MD2Colors, MD3Colors } from 'react-native-paper';

// Note: These styles should be used with theme colors passed as props
// since StyleSheet.create is called outside component scope
export const createChatStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    rightMessage: {
      alignSelf: 'flex-end',
      backgroundColor: MD3Colors.primary40,
      padding: 8,
      borderRadius: 10,
      margin: 4,
      maxWidth: '80%',
      color: theme.colors.outline,
    },
    leftMessage: {
      alignSelf: 'flex-start',
      backgroundColor: MD3Colors.primary70,
      padding: 8,
      borderRadius: 10,
      margin: 4,
      maxWidth: '80%',
      color: theme.colors.surface,
    },
    image: {
      width: 200,
      height: 200,
      borderRadius: 10,
    },
    caption: {
      marginTop: 4,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
  });

// Export base styles for backwards compatibility
export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rightMessage: {
    alignSelf: 'flex-end',
    backgroundColor: MD3Colors.primary40,
    padding: 8,
    borderRadius: 10,
    margin: 4,
    maxWidth: '80%',
  },
  leftMessage: {
    alignSelf: 'flex-start',
    backgroundColor: MD3Colors.primary70,
    padding: 8,
    borderRadius: 10,
    margin: 4,
    maxWidth: '80%',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  caption: {
    marginTop: 4,
    fontSize: 14,
    color: '#333',
  },
});
