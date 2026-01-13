// utils/signUpHelpers.ts
import { Alert } from 'react-native';
import * as Yup from 'yup';

/**
 * Password Strength Checker
 */
export interface PasswordStrength {
  score: number; // 0-4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  color: string;
  feedback: string[];
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length === 0) {
    return {
      score: 0,
      label: 'Weak',
      color: '#FF3B30',
      feedback: ['Password is required'],
    };
  }

  // Length check
  if (password.length >= 8) score++;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score++;

  // Character variety checks
  if (/[a-z]/.test(password)) score++;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Add numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Add special characters');

  // Common password check
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123'];
  if (
    commonPasswords.some((common) => password.toLowerCase().includes(common))
  ) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common passwords');
  }

  // Determine label and color
  let label: PasswordStrength['label'];
  let color: string;

  if (score <= 1) {
    label = 'Weak';
    color = '#FF3B30';
  } else if (score === 2) {
    label = 'Fair';
    color = '#FF9500';
  } else if (score === 3) {
    label = 'Good';
    color = '#FFCC00';
  } else if (score === 4) {
    label = 'Strong';
    color = '#34C759';
  } else {
    label = 'Very Strong';
    color = '#30B0C7';
  }

  return { score, label, color, feedback: feedback.slice(0, 3) };
};

/**
 * Username Validation & Availability Check
 */
export const validateUsername = (
  username: string
): {
  isValid: boolean;
  message?: string;
} => {
  if (username.length < 3) {
    return {
      isValid: false,
      message: 'Username must be at least 3 characters',
    };
  }

  if (username.length > 20) {
    return {
      isValid: false,
      message: 'Username must not exceed 20 characters',
    };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return {
      isValid: false,
      message:
        'Username can only contain letters, numbers, underscores and hyphens',
    };
  }

  // Reserved usernames
  const reserved = ['admin', 'support', 'skyhousing', 'official'];
  if (reserved.includes(username.toLowerCase())) {
    return { isValid: false, message: 'This username is reserved' };
  }

  return { isValid: true };
};

/**
 * Phone Number Formatter
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Format based on length
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else if (cleaned.length <= 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  } else {
    return `+${cleaned.slice(0, cleaned.length - 10)} (${cleaned.slice(
      -10,
      -7
    )}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
  }
};

/**
 * Email Domain Validator
 */
export const validateEmailDomain = async (
  email: string
): Promise<{
  isValid: boolean;
  message?: string;
}> => {
  const domain = email.split('@')[1];

  if (!domain) {
    return { isValid: false, message: 'Invalid email format' };
  }

  // Common disposable email domains to block
  const disposableDomains = [
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
  ];

  if (disposableDomains.some((d) => domain.toLowerCase().includes(d))) {
    return {
      isValid: false,
      message: 'Please use a permanent email address',
    };
  }

  return { isValid: true };
};

/**
 * Age Verification from Date of Birth
 */
export const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }

  return age;
};

export const verifyMinimumAge = (
  dateOfBirth: Date,
  minimumAge: number = 18
): {
  isValid: boolean;
  message?: string;
} => {
  const age = calculateAge(dateOfBirth);

  if (age < minimumAge) {
    return {
      isValid: false,
      message: `You must be at least ${minimumAge} years old to register`,
    };
  }

  return { isValid: true };
};

/**
 * Address Auto-completion Helper
 */
export interface AddressSuggestion {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

export const parseAddressFromLocation = (
  latitude: number,
  longitude: number
): Promise<AddressSuggestion | null> => {
  // This would integrate with a geocoding service
  // For now, return a placeholder
  return Promise.resolve(null);
};

/**
 * Form Data Sanitization
 */
export const sanitizeFormData = (data: any): any => {
  const sanitized = { ...data };

  // Trim string fields
  Object.keys(sanitized).forEach((key) => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitized[key].trim();
    }
  });

  // Remove confirmPassword
  delete sanitized.confirmPassword;

  // Normalize phone number
  if (sanitized.phone_number) {
    sanitized.phone_number = sanitized.phone_number.replace(/\D/g, '');
  }

  // Normalize email
  if (sanitized.email) {
    sanitized.email = sanitized.email.toLowerCase();
  }

  return sanitized;
};

/**
 * Progress Tracking
 */
export interface StepProgress {
  step: number;
  completed: boolean;
  fields: string[];
}

export const calculateFormProgress = (
  values: any,
  stepFields: { [key: number]: string[] }
): number => {
  let totalFields = 0;
  let completedFields = 0;

  Object.values(stepFields).forEach((fields) => {
    totalFields += fields.length;
    fields.forEach((field) => {
      if (values[field] && values[field] !== '') {
        completedFields++;
      }
    });
  });

  return totalFields > 0 ? completedFields / totalFields : 0;
};

/**
 * Error Handling Helpers
 */
export const handleSignUpError = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  // Common error mappings
  const errorMappings: { [key: string]: string } = {
    'Network Error':
      'Network connection error. Please check your internet connection.',
    timeout: 'Request timed out. Please try again.',
    ECONNREFUSED: 'Cannot connect to server. Please try again later.',
  };

  const errorString = String(error);
  for (const [key, message] of Object.entries(errorMappings)) {
    if (errorString.includes(key)) {
      return message;
    }
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Terms & Conditions Acceptance
 */
export const showTermsAndConditions = (
  onAccept: () => void,
  onDecline: () => void
) => {
  Alert.alert(
    'Terms & Conditions',
    'By creating an account, you agree to our Terms of Service and Privacy Policy. Do you accept?',
    [
      {
        text: 'Read Terms',
        onPress: () => {
          // Navigate to terms screen or open web view
          console.log('Open terms screen');
        },
      },
      {
        text: 'Decline',
        style: 'cancel',
        onPress: onDecline,
      },
      {
        text: 'Accept',
        onPress: onAccept,
      },
    ]
  );
};

/**
 * Field-specific validators for custom validation
 */
export const validators = {
  idNumber: (value: string, country: string): boolean => {
    // Country-specific ID validation
    switch (country.toLowerCase()) {
      case 'south africa':
        // SA ID number is 13 digits
        return /^\d{13}$/.test(value);
      case 'zimbabwe':
        // Zimbabwe ID format
        return /^[0-9]{2}-[0-9]{6,7}[A-Z][0-9]{2}$/.test(value);
      default:
        // Generic validation
        return value.length >= 6;
    }
  },

  postalCode: (value: string, country: string): boolean => {
    switch (country.toLowerCase()) {
      case 'united states':
        return /^\d{5}(-\d{4})?$/.test(value);
      case 'canada':
        return /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/.test(value);
      case 'united kingdom':
        return /^[A-Z]{1,2}\d{1,2} ?\d[A-Z]{2}$/.test(value);
      default:
        return value.length >= 3;
    }
  },
};

/**
 * Step Field Mapping
 */
export const stepFields = {
  0: ['avatar', 'first_name', 'last_name', 'date_of_birth', 'gender'],
  1: ['username', 'email', 'password', 'confirmPassword'],
  2: ['phone_number', 'ideaNumber'],
  3: ['street', 'city', 'province', 'postal_code', 'country'],
};

/**
 * Analytics Events
 */
export interface SignUpAnalyticsEvent {
  event: string;
  step?: number;
  timestamp: number;
  metadata?: any;
}

export const logSignUpEvent = (event: SignUpAnalyticsEvent) => {
  console.log('Sign Up Event:', event);
  // Integrate with analytics service (Firebase, Mixpanel, etc.)
};

/**
 * Form Auto-save to Local Storage
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY = 'signup_draft';

export const saveDraft = async (formData: any) => {
  try {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
  } catch (error) {
    console.error('Error saving draft:', error);
  }
};

export const loadDraft = async (): Promise<any | null> => {
  try {
    const draft = await AsyncStorage.getItem(DRAFT_KEY);
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

export const clearDraft = async () => {
  try {
    await AsyncStorage.removeItem(DRAFT_KEY);
  } catch (error) {
    console.error('Error clearing draft:', error);
  }
};
