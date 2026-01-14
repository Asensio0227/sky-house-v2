import { useFocusEffect, useRoute } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Card,
  Chip,
  Divider,
  IconButton,
  Text,
  useTheme,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootEstateState } from '../../../store';
import Loading from '../../components/custom/Loading';
import UserProfile from '../../components/custom/UserProfile';
import ImageGrid from '../../components/ImageGrid';
import { retrieveAd } from '../../features/estate/estateSlice';

const Listing = () => {
  const router: any = useRoute();
  const items = router.params;
  const [readMore, setReadMore] = useState(false);
  const dispatch: any = useDispatch();
  const { isLoading, singleHouse } = useSelector(
    (store: RootEstateState) => store.ESTATE
  );
  const theme = useTheme();

  // Safely get the listing data
  const listing = singleHouse || items;

  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (items?._id) {
          try {
            await dispatch(retrieveAd(items._id));
          } catch (error: any) {
            console.log(`Error fetching ad: ${error}`);
          }
        }
      })();
    }, [items?._id])
  );

  if (isLoading) return <Loading />;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: any) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    section: {
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: 16,
    },
    priceCard: {
      marginHorizontal: 16,
      marginVertical: 12,
      padding: 20,
      borderRadius: 16,
      backgroundColor: theme.colors.primaryContainer,
      elevation: 0,
    },
    priceText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    priceLabel: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },
    depositText: {
      fontSize: 16,
      color: theme.colors.onSurface,
      marginTop: 8,
      fontWeight: '500',
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    chip: {
      marginRight: 8,
      marginBottom: 8,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    infoLabel: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 14,
      color: theme.colors.onSurface,
      fontWeight: '600',
      flex: 1,
      textAlign: 'right',
    },
    description: {
      fontSize: 15,
      color: theme.colors.onSurface,
      lineHeight: 24,
      marginBottom: 12,
    },
    readMoreButton: {
      alignSelf: 'flex-start',
    },
    readMoreText: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontSize: 14,
    },
    contactCard: {
      marginHorizontal: 16,
      marginVertical: 12,
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceVariant,
      elevation: 0,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginVertical: 6,
    },
    contactIcon: {
      marginRight: 8,
    },
    contactLabel: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '500',
      width: 70,
    },
    contactValue: {
      fontSize: 14,
      color: theme.colors.onSurface,
      flex: 1,
      fontWeight: '500',
    },
    divider: {
      marginVertical: 8,
    },
  });

  const InfoRow = ({ label, value }: { label: string; value: any }) => {
    if (!value && value !== 0) return null;
    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* User Profile */}
      {listing?.user && (
        <UserProfile
          user={listing.user}
          rating={listing.average_rating}
          items={listing}
        />
      )}

      {/* Image Gallery */}
      {listing?.photo && listing.photo.length > 0 && (
        <View style={{ marginVertical: 12 }}>
          <ImageGrid data={listing.photo} />
        </View>
      )}

      {/* Status Chips */}
      {listing && (
        <View style={styles.section}>
          <View style={styles.chipContainer}>
            {listing.listingType && (
              <Chip
                mode='flat'
                style={[
                  styles.chip,
                  { backgroundColor: theme.colors.primaryContainer },
                ]}
                textStyle={{ color: theme.colors.onPrimaryContainer }}
              >
                {listing.listingType === 'sale' ? 'For Sale' : 'For Rent'}
              </Chip>
            )}
            {listing.category && (
              <Chip mode='outlined' style={styles.chip}>
                {listing.category}
              </Chip>
            )}
            {listing.taken && (
              <Chip
                mode='flat'
                style={[
                  styles.chip,
                  { backgroundColor: theme.colors.errorContainer },
                ]}
                textStyle={{ color: theme.colors.onErrorContainer }}
              >
                Taken
              </Chip>
            )}
            {listing.isVerified && (
              <Chip
                mode='flat'
                style={[styles.chip, { backgroundColor: '#4CAF50' }]}
                textStyle={{ color: '#FFFFFF' }}
                icon='check-circle'
              >
                Verified
              </Chip>
            )}
            {listing.isFurnished !== undefined && (
              <Chip mode='outlined' style={styles.chip}>
                {listing.isFurnished ? 'Furnished' : 'Unfurnished'}
              </Chip>
            )}
          </View>
        </View>
      )}

      {/* Price Section - Sale */}
      {listing?.listingType === 'sale' && listing?.price && (
        <Card style={styles.priceCard}>
          <Text style={styles.priceText}>{formatPrice(listing.price)}</Text>
          <Text style={styles.priceLabel}>Sale Price</Text>
        </Card>
      )}

      {/* Price Section - Rent */}
      {listing?.listingType === 'rent' && listing?.rentPrice && (
        <Card style={styles.priceCard}>
          <Text style={styles.priceText}>{formatPrice(listing.rentPrice)}</Text>
          <Text style={styles.priceLabel}>
            {listing.rentFrequency
              ? `Per ${listing.rentFrequency
                  .charAt(0)
                  .toUpperCase()}${listing.rentFrequency.slice(1)}`
              : 'Rent'}
          </Text>
          {listing.depositAmount && (
            <Text style={styles.depositText}>
              Deposit: {formatPrice(listing.depositAmount)}
            </Text>
          )}
        </Card>
      )}

      {/* Property Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Property Details</Text>
        {listing?.bedrooms !== undefined && listing.bedrooms !== null && (
          <InfoRow
            label='Bedrooms'
            value={`${listing.bedrooms} bed${
              listing.bedrooms !== 1 ? 's' : ''
            }`}
          />
        )}
        {listing?.bathrooms !== undefined && listing.bathrooms !== null && (
          <InfoRow
            label='Bathrooms'
            value={`${listing.bathrooms} bath${
              listing.bathrooms !== 1 ? 's' : ''
            }`}
          />
        )}
        {listing?.minimumStay && (
          <InfoRow
            label='Minimum Stay'
            value={`${listing.minimumStay} day${
              listing.minimumStay !== 1 ? 's' : ''
            }`}
          />
        )}
        {listing?.availableFrom && (
          <InfoRow
            label='Available From'
            value={formatDate(listing.availableFrom)}
          />
        )}
        {listing?.listingSource && (
          <InfoRow
            label='Listed By'
            value={
              listing.listingSource.charAt(0).toUpperCase() +
              listing.listingSource.slice(1)
            }
          />
        )}
        {listing?.viewsCount !== undefined && (
          <InfoRow label='Views' value={listing.viewsCount.toLocaleString()} />
        )}
      </View>

      <Divider style={styles.divider} />

      {/* Description */}
      {listing?.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {readMore
              ? listing.description
              : listing.description.length > 200
              ? `${listing.description.substring(0, 200)}...`
              : listing.description}
          </Text>
          {listing.description.length > 200 && (
            <TouchableOpacity
              onPress={() => setReadMore((prev) => !prev)}
              style={styles.readMoreButton}
            >
              <Text style={styles.readMoreText}>
                {readMore ? 'Show Less' : 'Read More'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Divider style={styles.divider} />

      {/* Contact Details */}
      {listing?.contact_details && (
        <View style={{ marginBottom: 16 }}>
          <View style={[styles.section, { paddingBottom: 8 }]}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
          </View>
          <Card style={styles.contactCard}>
            {listing.contact_details.phone_number && (
              <View style={styles.contactRow}>
                <IconButton
                  icon='phone'
                  size={20}
                  iconColor={theme.colors.primary}
                  style={styles.contactIcon}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactLabel}>Phone</Text>
                  <Text style={styles.contactValue}>
                    {listing.contact_details.phone_number}
                  </Text>
                </View>
              </View>
            )}
            {listing.contact_details.email && (
              <View style={styles.contactRow}>
                <IconButton
                  icon='email'
                  size={20}
                  iconColor={theme.colors.primary}
                  style={styles.contactIcon}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>
                    {listing.contact_details.email}
                  </Text>
                </View>
              </View>
            )}
            {listing.contact_details.address && (
              <View style={styles.contactRow}>
                <IconButton
                  icon='map-marker'
                  size={20}
                  iconColor={theme.colors.primary}
                  style={styles.contactIcon}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactLabel}>Address</Text>
                  <Text style={styles.contactValue}>
                    {listing.contact_details.address}
                  </Text>
                </View>
              </View>
            )}
          </Card>
        </View>
      )}

      {/* Reviews & Ratings */}
      {(listing?.average_rating !== undefined ||
        listing?.numOfReviews !== undefined) && (
        <>
          <Divider style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
            {listing.average_rating !== undefined && (
              <InfoRow
                label='Average Rating'
                value={`${Number(listing.average_rating).toFixed(1)} ⭐`}
              />
            )}
            {listing.numOfReviews !== undefined && (
              <InfoRow
                label='Total Reviews'
                value={`${listing.numOfReviews} review${
                  listing.numOfReviews !== 1 ? 's' : ''
                }`}
              />
            )}
          </View>
        </>
      )}

      {/* Additional Information */}
      {(listing?.featuredUntil ||
        listing?.createdAt ||
        listing?.isClaimable) && (
        <>
          <Divider style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            {listing.featuredUntil && (
              <InfoRow
                label='Featured Until'
                value={formatDate(listing.featuredUntil)}
              />
            )}
            {listing.createdAt && (
              <InfoRow
                label='Listed On'
                value={formatDate(listing.createdAt)}
              />
            )}
            {listing.isClaimable && <InfoRow label='Claimable' value='Yes' />}
          </View>
        </>
      )}

      {/* Bottom Spacing */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default Listing;
