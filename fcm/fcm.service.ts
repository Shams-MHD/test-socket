import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  // For this POC, we'll store the token in memory.
  // In a real app, you'd store this in a database (e.g., using Prisma) against a user ID.
  private deviceToken: string | null = null;

  constructor() {
    this.initializeFirebaseAdmin();
  }

  private initializeFirebaseAdmin() {
    // We'll use a try-catch to handle potential errors, e.g., if the file is missing.
    try {
      const serviceAccount = require('../../../../firebase-admin-sdk.json') as ServiceAccount;

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.logger.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
    }
  }

  // Method to store the token
  saveDeviceToken(token: string): void {
    this.logger.log(`Saving new device token: ${token}`);
    this.deviceToken = token;
  }

  // Method to send a test push notification
  async sendTestNotification(): Promise<string> {
    if (!this.deviceToken) {
      this.logger.warn('No device token available to send a notification.');
      return 'No device token registered.';
    }

    const message: admin.messaging.Message = {
      token: this.deviceToken,
      notification: {
        title: 'Test Notification from NestJS!',
        body: `This is a test message sent at ${new Date().toLocaleTimeString()}`,
      },
      webpush: {
        fcmOptions: {
          link: 'http://localhost:3001', // URL to open on click
        },
      },
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log('Successfully sent message:', response);
      return `Message sent successfully to token: ${this.deviceToken}`;
    } catch (error) {
      this.logger.error('Error sending message:', error);
      return 'Error sending message.';
    }
  }

  async validateToken(token: string): Promise<boolean> {
    if (!token) return false;

    try {
      // The `dryRun: true` flag is the key.
      // Firebase checks the token's validity without sending a message.
      await admin.messaging().send({ token }, true);
      this.logger.log(`Token ${token} is valid.`);
      return true;
    } catch (error) {
      // The Admin SDK throws specific error codes for invalid tokens.
      if (
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        this.logger.warn(`Token ${token} is invalid. It should be deleted.`);
        // This is where you trigger cleanup.
        // await this.deleteDeviceByToken(token);
        return false;
      }
      this.logger.error('Unexpected error validating FCM token', error);
      return false; // Treat other errors as temporary failures
    }

  }
}