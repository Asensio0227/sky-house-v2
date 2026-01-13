import React, { useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card, Divider, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import AppText from '../../components/custom/AppText';
import Screen from '../../components/custom/Screen';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const Help = () => {
  const theme = useTheme();
  const { isDark } = useSelector((store: RootState) => store.THEME);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I create a property listing?',
      answer:
        'To create a listing, tap the "+" button on the home screen, fill in the property details including photos, price, and location, then tap "Post Listing".',
    },
    {
      id: '2',
      question: 'How do I search for properties?',
      answer:
        'Use the search bar on the home screen to search by location, property type, or price range. You can also apply filters to narrow down your results.',
    },
    {
      id: '3',
      question: 'How do I contact a property owner?',
      answer:
        'Tap on any property listing to view details, then use the "Contact" button to send a message or call the owner directly.',
    },
    {
      id: '4',
      question: 'Can I save properties to view later?',
      answer:
        'Yes! Tap the heart icon on any property card to save it to your favorites. Access saved properties from your profile.',
    },
    {
      id: '5',
      question: 'How do I edit or delete my listing?',
      answer:
        'Go to your profile, tap "My Listings", select the property you want to edit or delete, then use the menu options.',
    },
    {
      id: '6',
      question: 'Is my personal information secure?',
      answer:
        'Yes, we take privacy seriously. Your personal information is encrypted and never shared with third parties without your consent.',
    },
  ];

  const handleEmail = () => {
    Linking.openURL('mailto:skycodingjr@gmail.com');
  };

  const handlePhone = () => {
    Linking.openURL('tel:+263786974895');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/263786974895');
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <Screen>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Icon
            name='help-circle-outline'
            size={64}
            color={theme.colors.primary}
          />
          <AppText
            title='Help & Support'
            style={styles.headerTitle}
            color={theme.colors.onBackground}
          />
          <AppText
            title="We're here to help you with any questions or issues"
            style={styles.headerSubtitle}
            color={theme.colors.onSurfaceVariant}
          />
        </View>

        {/* Contact Options */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <AppText
              title='Contact Sky Coding'
              style={styles.sectionTitle}
              color={theme.colors.onSurface}
            />

            {/* Email */}
            <TouchableOpacity
              style={[
                styles.contactItem,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
              onPress={handleEmail}
              activeOpacity={0.7}
            >
              <View style={styles.contactIcon}>
                <Icon
                  name='email-outline'
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.contactText}>
                <AppText
                  title='Email Us'
                  style={styles.contactLabel}
                  color={theme.colors.onSurface}
                />
                <AppText
                  title='skycodingjr@gmail.com'
                  style={styles.contactValue}
                  color={theme.colors.primary}
                />
              </View>
              <Icon
                name='chevron-right'
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            {/* Phone */}
            <TouchableOpacity
              style={[
                styles.contactItem,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
              onPress={handlePhone}
              activeOpacity={0.7}
            >
              <View style={styles.contactIcon}>
                <Icon
                  name='phone-outline'
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.contactText}>
                <AppText
                  title='Call Us'
                  style={styles.contactLabel}
                  color={theme.colors.onSurface}
                />
                <AppText
                  title='+263 78 697 4895'
                  style={styles.contactValue}
                  color={theme.colors.primary}
                />
              </View>
              <Icon
                name='chevron-right'
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            {/* WhatsApp */}
            <TouchableOpacity
              style={[
                styles.contactItem,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
              onPress={handleWhatsApp}
              activeOpacity={0.7}
            >
              <View style={styles.contactIcon}>
                <Icon name='whatsapp' size={24} color='#25D366' />
              </View>
              <View style={styles.contactText}>
                <AppText
                  title='WhatsApp'
                  style={styles.contactLabel}
                  color={theme.colors.onSurface}
                />
                <AppText
                  title='+263 78 697 4895'
                  style={styles.contactValue}
                  color='#25D366'
                />
              </View>
              <Icon
                name='chevron-right'
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <AppText
              title='Quick Actions'
              style={styles.sectionTitle}
              color={theme.colors.onSurface}
            />

            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[
                  styles.quickActionButton,
                  { backgroundColor: theme.colors.primaryContainer },
                ]}
                onPress={() => Linking.openURL('https://skycoding.com')}
                activeOpacity={0.7}
              >
                <Icon name='web' size={32} color={theme.colors.primary} />
                <AppText
                  title='Visit Website'
                  style={styles.quickActionText}
                  color={theme.colors.onPrimaryContainer}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickActionButton,
                  { backgroundColor: theme.colors.secondaryContainer },
                ]}
                onPress={() =>
                  Linking.openURL(
                    'mailto:skycodingjr@gmail.com?subject=Bug Report'
                  )
                }
                activeOpacity={0.7}
              >
                <Icon
                  name='bug-outline'
                  size={32}
                  color={theme.colors.secondary}
                />
                <AppText
                  title='Report Bug'
                  style={styles.quickActionText}
                  color={theme.colors.onSecondaryContainer}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickActionButton,
                  { backgroundColor: theme.colors.tertiaryContainer },
                ]}
                onPress={() =>
                  Linking.openURL(
                    'mailto:skycodingjr@gmail.com?subject=Feature Request'
                  )
                }
                activeOpacity={0.7}
              >
                <Icon
                  name='lightbulb-outline'
                  size={32}
                  color={theme.colors.tertiary}
                />
                <AppText
                  title='Suggest Feature'
                  style={styles.quickActionText}
                  color={theme.colors.onTertiaryContainer}
                />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* FAQs */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <AppText
              title='Frequently Asked Questions'
              style={styles.sectionTitle}
              color={theme.colors.onSurface}
            />

            {faqs.map((faq, index) => (
              <View key={faq.id}>
                <TouchableOpacity
                  style={styles.faqItem}
                  onPress={() => toggleFAQ(faq.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqQuestion}>
                    <Icon
                      name={
                        expandedFAQ === faq.id
                          ? 'chevron-down'
                          : 'chevron-right'
                      }
                      size={24}
                      color={theme.colors.primary}
                    />
                    <AppText
                      title={faq.question}
                      style={styles.faqQuestionText}
                      color={theme.colors.onSurface}
                    />
                  </View>
                </TouchableOpacity>

                {expandedFAQ === faq.id && (
                  <View
                    style={[
                      styles.faqAnswer,
                      { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                  >
                    <AppText
                      title={faq.answer}
                      style={styles.faqAnswerText}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </View>
                )}

                {index < faqs.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Support Hours */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.supportHours}>
              <Icon
                name='clock-outline'
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.supportHoursText}>
                <AppText
                  title='Support Hours'
                  style={styles.supportHoursTitle}
                  color={theme.colors.onSurface}
                />
                <AppText
                  title='Monday - Friday: 8:00 AM - 5:00 PM'
                  style={styles.supportHoursDetail}
                  color={theme.colors.onSurfaceVariant}
                />
                <AppText
                  title='Saturday - Sunday: 9:00 AM - 2:00 PM'
                  style={styles.supportHoursDetail}
                  color={theme.colors.onSurfaceVariant}
                />
                <AppText
                  title='CAT (Central Africa Time)'
                  style={styles.supportHoursDetail}
                  color={theme.colors.onSurfaceVariant}
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* App Info */}
        <View style={styles.appInfo}>
          <AppText
            title='Sky Coding Real Estate App'
            style={styles.appInfoText}
            color={theme.colors.onSurfaceVariant}
          />
          <AppText
            title='Version 1.0.0'
            style={styles.appInfoText}
            color={theme.colors.onSurfaceVariant}
          />
          <AppText
            title='© 2024 Sky Coding. All rights reserved.'
            style={styles.appInfoText}
            color={theme.colors.onSurfaceVariant}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </Screen>
  );
};

export default Help;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  faqItem: {
    paddingVertical: 12,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  faqAnswer: {
    marginTop: 8,
    marginLeft: 32,
    padding: 12,
    borderRadius: 8,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    marginVertical: 8,
  },
  supportHours: {
    flexDirection: 'row',
    gap: 16,
  },
  supportHoursText: {
    flex: 1,
  },
  supportHoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  supportHoursDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  appInfoText: {
    fontSize: 12,
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 24,
  },
});
