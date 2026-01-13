import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const TextLink: React.FC<{ text: string; linkText: string; link: any }> = ({
  text,
  linkText,
  link,
}) => {
  const navigation: any = useNavigation();
  const theme = useTheme();

  return (
    <View style={styles.formContainer}>
      <Text style={[styles.formText, { color: theme.colors.onSurface }]}>
        {text}
      </Text>
      <Pressable
        onPress={() => {
          navigation.navigate(link);
        }}
      >
        <Text style={[styles.link, { color: theme.colors.primary }]}>
          {linkText}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 5,
  },
  formText: {
    marginRight: 5,
    textAlign: 'center',
    marginVertical: 2,
  },
  link: {
    textDecorationLine: 'underline',
  },
});

export default TextLink;
