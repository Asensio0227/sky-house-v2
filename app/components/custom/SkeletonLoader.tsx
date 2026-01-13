import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

import { designTokens } from '../../utils/designTokens';
// Skeleton loader component for better loading states
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = designTokens.borderRadius.sm,
  style,
}) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.surfaceVariant,
        },
        style,
      ]}
    />
  );
};

// Card skeleton for listings
export const CardSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <Card
      style={[styles.cardSkeleton, { backgroundColor: theme.colors.surface1 }]}
    >
      <View style={styles.cardContent}>
        <Skeleton height={200} style={styles.imageSkeleton} />
        <View style={styles.textContainer}>
          <Skeleton width='80%' height={20} style={styles.titleSkeleton} />
          <Skeleton width='60%' height={16} style={styles.subtitleSkeleton} />
          <View style={styles.priceContainer}>
            <Skeleton width={80} height={24} />
          </View>
        </View>
      </View>
    </Card>
  );
};

// List skeleton for multiple items
interface ListSkeletonProps {
  count?: number;
  showHeader?: boolean;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  count = 5,
  showHeader = false,
}) => {
  return (
    <View style={styles.listContainer}>
      {showHeader && (
        <View style={styles.headerSkeleton}>
          <Skeleton width={120} height={24} />
          <Skeleton width={80} height={20} />
        </View>
      )}
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </View>
  );
};

// Chat message skeleton
export const ChatSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={styles.chatContainer}>
      <View style={styles.messageGroup}>
        <View
          style={[
            styles.avatarSkeleton,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        />
        <View style={styles.messageContent}>
          <Skeleton width={200} height={16} style={styles.messageSkeleton} />
          <Skeleton width={150} height={16} style={styles.messageSkeleton} />
        </View>
      </View>
      <View style={[styles.messageGroup, styles.ownMessage]}>
        <View style={styles.messageContent}>
          <Skeleton width={180} height={16} style={styles.messageSkeleton} />
        </View>
        <View
          style={[
            styles.avatarSkeleton,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    // Animation would be added here with react-native-reanimated
  },
  cardSkeleton: {
    borderRadius: designTokens.borderRadius.lg,
    marginVertical: designTokens.spacing.sm,
    marginHorizontal: designTokens.spacing.sm,
    elevation: designTokens.elevation.sm,
  },
  cardContent: {
    padding: designTokens.spacing.md,
  },
  imageSkeleton: {
    marginBottom: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.md,
  },
  textContainer: {
    gap: designTokens.spacing.sm,
  },
  titleSkeleton: {
    marginBottom: designTokens.spacing.xs,
  },
  subtitleSkeleton: {
    marginBottom: designTokens.spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listContainer: {
    padding: designTokens.spacing.md,
  },
  headerSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designTokens.spacing.lg,
  },
  chatContainer: {
    padding: designTokens.spacing.md,
    gap: designTokens.spacing.md,
  },
  messageGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: designTokens.spacing.sm,
  },
  ownMessage: {
    flexDirection: 'row-reverse',
  },
  avatarSkeleton: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageContent: {
    flex: 1,
    gap: designTokens.spacing.xs,
  },
  messageSkeleton: {
    borderRadius: designTokens.borderRadius.md,
  },
});
