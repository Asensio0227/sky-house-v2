import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';

function ChatFileTransfer({ filePath }: { filePath: any }) {
  const theme = useTheme();
  var fileType = '';
  var name = '';
  if (filePath !== undefined) {
    name = filePath.split('/').pop();
    fileType = filePath.split('.').pop();
  }
  return (
    <View style={styles.container}>
      <View style={[styles.frame, { backgroundColor: theme.colors.surface }]}>
        <Image
          source={
            fileType === 'pdf'
              ? require('../assets/urban-city.jpg')
              : require('../assets/user-icon.png')
          }
          style={{ height: 60, width: 60 }}
        />
        <View>
          <Text style={[styles.text, { color: theme.colors.onSurface }]}>
            {name.replace('%20', '').replace(' ', '')}
          </Text>
          <Text style={[styles.textType, { color: theme.colors.onSurface }]}>
            {fileType.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 5,
    borderRadius: 15,
    padding: 5,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 20,
    marginLeft: 5,
    marginRight: 5,
  },
  textType: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  frame: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 5,
    marginTop: -4,
  },
});

export default ChatFileTransfer;
