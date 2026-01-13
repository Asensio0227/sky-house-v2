import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Avatar,
  Card,
  Chip,
  Divider,
  IconButton,
  Portal,
  Surface,
  useTheme,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import AppButton from '../../components/custom/AppButton';
import AppText from '../../components/custom/AppText';
import ViewModal from '../../components/custom/ViewModal';
import { showModal } from '../../features/auth/authSlice';
import { getCurrentUser } from '../../features/user/userSlice'; // ✅ Changed import

const windowWidth = Dimensions.get('window').width;

const Profile = () => {
  // ✅ Get user from USER slice and modal visibility from AUTH
  const { currentUser } = useSelector((store: RootState) => store.USER);
  const { visible } = useSelector((store: RootState) => store.AUTH);
  const theme = useTheme();
  const dispatch: any = useDispatch();
  const navigation: any = useNavigation();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchCurrentUser = async () => {
        try {
          if (isActive) {
            // ✅ Use getCurrentUser from userSlice
            await dispatch(getCurrentUser());
          }
        } catch (error) {
          console.log('Error fetching current user:', error);
        }
      };

      fetchCurrentUser();

      return () => {
        isActive = false;
      };
    }, [dispatch])
  );

  // ✅ Guard against null user
  if (!currentUser) {
    return (
      <View style={styles.container}>
        <AppText title='Loading profile...' />
      </View>
    );
  }

  const {
    physical_address,
    contact_details,
    first_name,
    last_name,
    gender,
    ideaNumber,
    avatar,
    email,
    username,
    date_of_birth,
  } = currentUser;

  const InfoRow = ({ icon, label, value }: any) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelContainer}>
        <IconButton
          icon={icon}
          size={20}
          iconColor={theme.colors.primary}
          style={styles.infoIcon}
        />
        <AppText
          title={label}
          style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}
        />
      </View>
      <AppText
        title={value || 'Not provided'}
        style={[styles.infoValue, { color: theme.colors.onSurface }]}
      />
    </View>
  );

  const SectionCard = ({ title, children }: any) => (
    <Card
      style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
      elevation={1}
    >
      <Card.Content>
        <AppText
          title={title}
          variant='titleLarge'
          style={[styles.sectionTitle, { color: theme.colors.primary }]}
        />
        <Divider
          style={[
            styles.sectionDivider,
            { backgroundColor: theme.colors.outlineVariant },
          ]}
        />
        {children}
      </Card.Content>
    </Card>
  );

  return (
    <Portal.Host>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Surface
          style={[
            styles.header,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
          elevation={0}
        >
          <View style={styles.headerContent}>
            {/* Avatar with Edit Badge */}
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => navigation.navigate('edit-profile', currentUser)}
              activeOpacity={0.8}
            >
              <Avatar.Image
                size={120}
                source={
                  avatar
                    ? { uri: avatar }
                    : require('../../assets/user-icon.png')
                }
                style={styles.avatar}
              />
              <Surface
                style={[
                  styles.editBadge,
                  { backgroundColor: theme.colors.primary },
                ]}
                elevation={3}
              >
                <IconButton
                  icon='pencil'
                  size={16}
                  iconColor={theme.colors.onPrimary}
                  style={styles.editIcon}
                />
              </Surface>
            </TouchableOpacity>

            {/* User Info */}
            <View style={styles.userInfo}>
              <AppText
                title={`${first_name} ${last_name}`}
                variant='headlineMedium'
                style={[
                  styles.userName,
                  { color: theme.colors.onPrimaryContainer },
                ]}
              />
              <AppText
                title={`@${username}`}
                variant='bodyLarge'
                style={[
                  styles.userUsername,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              />
              <Chip
                icon='email'
                style={[
                  styles.emailChip,
                  { backgroundColor: theme.colors.surface },
                ]}
                textStyle={{ color: theme.colors.onSurface, fontSize: 13 }}
              >
                {email}
              </Chip>
            </View>

            {/* Edit Button */}
            <AppButton
              title='Edit Profile'
              mode='contained'
              onPress={() => navigation.navigate('edit-profile', currentUser)}
              style={styles.editButton}
              icon='account-edit'
            />
          </View>
        </Surface>

        {/* Content */}
        <View style={styles.content}>
          {/* Personal Information */}
          <SectionCard title='Personal Information'>
            <InfoRow icon='gender-male-female' label='Gender' value={gender} />
            <InfoRow
              icon='cake-variant'
              label='Date of Birth'
              value={date_of_birth}
            />
            <InfoRow
              icon='card-account-details'
              label='ID Number'
              value={ideaNumber}
            />
          </SectionCard>

          {/* Contact Details */}
          <SectionCard title='Contact Details'>
            <InfoRow
              icon='phone'
              label='Phone Number'
              value={contact_details?.phone_number}
            />
            <InfoRow icon='email' label='Email' value={email} />
          </SectionCard>

          {/* Physical Address */}
          <SectionCard title='Physical Address'>
            <InfoRow
              icon='road'
              label='Street'
              value={physical_address?.street}
            />
            <InfoRow icon='city' label='City' value={physical_address?.city} />
            <InfoRow
              icon='map-marker'
              label='Province'
              value={physical_address?.province}
            />
            <InfoRow
              icon='mailbox'
              label='Postal Code'
              value={physical_address?.postal_code}
            />
            <InfoRow
              icon='earth'
              label='Country'
              value={physical_address?.country}
            />
          </SectionCard>

          {/* Security Section */}
          <Card
            style={[
              styles.securityCard,
              { backgroundColor: theme.colors.errorContainer },
            ]}
            elevation={1}
          >
            <Card.Content>
              <View style={styles.securityHeader}>
                <IconButton
                  icon='lock'
                  size={24}
                  iconColor={theme.colors.onErrorContainer}
                />
                <AppText
                  title='Security'
                  variant='titleLarge'
                  style={{ color: theme.colors.onErrorContainer }}
                />
              </View>
              <AppButton
                title='Change Password'
                onPress={() => dispatch(showModal())}
                mode='contained-tonal'
                icon='lock-reset'
                style={styles.passwordButton}
              />
            </Card.Content>
          </Card>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
      {visible && <ViewModal />}
    </Portal.Host>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    margin: 0,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 4,
  },
  userName: {
    fontWeight: '700',
    textAlign: 'center',
  },
  userUsername: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emailChip: {
    marginTop: 8,
  },
  editButton: {
    width: windowWidth - 48,
    borderRadius: 16,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDivider: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    margin: 0,
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  securityCard: {
    borderRadius: 16,
    marginTop: 8,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  passwordButton: {
    borderRadius: 12,
  },
  bottomSpacer: {
    height: 24,
  },
});
