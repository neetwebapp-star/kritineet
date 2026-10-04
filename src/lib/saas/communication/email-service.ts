/**
 * Phase 8: Email Service Abstraction & Notification Preferences
 * Provides provider-agnostic transactional email dispatch and user notification preference management.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  type:
    | 'VERIFICATION'
    | 'WELCOME'
    | 'PASSWORD_RESET'
    | 'INVITATION'
    | 'ASSIGNMENT'
    | 'TEST_REMINDER'
    | 'SUBSCRIPTION'
    | 'PAYMENT_FAILURE'
    | 'WEEKLY_REPORT';
  html: string;
  text?: string;
}

export interface UserNotificationPreferences {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  categories: {
    assignments: boolean;
    tests: boolean;
    revision: boolean;
    billing: boolean;
    system: boolean; // Cannot be disabled (mandatory security/account alerts)
  };
}

export class EmailService {
  private static sentMessages: EmailMessage[] = [];

  /**
   * Dispatches email message (pluggable with SMTP, SendGrid, Resend, or Sandbox)
   */
  public static async sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId: string }> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    this.sentMessages.push({ ...message });

    // Keep memory history bounded
    if (this.sentMessages.length > 500) {
      this.sentMessages.shift();
    }

    return {
      success: true,
      messageId,
    };
  }

  /**
   * Helper to retrieve recent sent emails (useful for acceptance tests)
   */
  public static getSentMessages(): EmailMessage[] {
    return [...this.sentMessages];
  }

  /**
   * Validates if notification category should be dispatched based on preferences
   */
  public static shouldDispatch(
    category: 'assignments' | 'tests' | 'revision' | 'billing' | 'system',
    prefs?: UserNotificationPreferences
  ): boolean {
    if (!prefs) return true; // Default to allow
    if (category === 'system') return true; // Mandatory security/account notifications cannot be turned off
    return prefs.emailEnabled && (prefs.categories[category] ?? true);
  }
}
