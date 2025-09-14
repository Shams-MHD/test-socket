import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class FcmService {

  private readonly logger = new Logger(FcmService.name);
  // For this POC, we'll store the token in memory.
  // In a real app, you'd store this in a database (e.g., using Prisma) against a user ID.
  private deviceToken: string | null = null;

  constructor(private readonly prisma:PrismaService) {
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

    // lets assume that the user has id=1
    const userId = 1;

    this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    })
    .then(user => {
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
  
      if (user.fcmToken.includes(token)) {
        this.logger.log(`Token already exists for user ${userId}, skipping update.`);
        return;
      }
  
      const updatedTokens = [...user.fcmToken, token];
  
      return this.prisma.user.update({
        where: { id: userId },
        data: { fcmToken: { set: updatedTokens } },
      });
    })
    .then(() => {
      this.logger.log(`Token added successfully for user ${userId}`);
    })
    .catch(error => {
      this.logger.error(`Failed to save device token for user ${userId}:`, error);
    });
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

  async switchProfile(sourceProfileId:number, targetProfileId:number, token:string){

    
    this.logger.log(`Moving token ${token} from profile ${sourceProfileId} to profile ${targetProfileId}`);

    const sourceProfile = await this.prisma.profile.findUnique({
      where: { id: sourceProfileId },
      select: { fcmTokens: true },
    });
  
    if (!sourceProfile) {
      throw new Error(`Source profile with ID ${sourceProfileId} not found.`);
    }
  
    if (!sourceProfile.fcmTokens.includes(token)) {
      throw new Error(`Token ${token} not found in source profile ${sourceProfileId}.`);
    }
  
    const updatedSourceTokens = sourceProfile.fcmTokens.filter(t => t !== token);
    await this.prisma.profile.update({
      where: { id: sourceProfileId },
      data: { fcmTokens: { set: updatedSourceTokens } },
    });
  
    const targetProfile = await this.prisma.profile.findUnique({
      where: { id: targetProfileId },
      select: { fcmTokens: true },
    });
  
    if (!targetProfile) {
      throw new Error(`Target profile with ID ${targetProfileId} not found.`);
    }
  
    // Add the token to the target profile
    const updatedTargetTokens = [...targetProfile.fcmTokens, token];
    await this.prisma.profile.update({
      where: { id: targetProfileId },
      data: { fcmTokens: { set: updatedTargetTokens } },
    });
  
    this.logger.log(`Token ${token} moved successfully from profile ${sourceProfileId} to profile ${targetProfileId}`);
  }


  async validateToken(token: string): Promise<boolean> {
    if (!token) return false;

    try {
      await admin.messaging().send({ token }, true);
      this.logger.log(`Token ${token} is valid.`);
      return true;
    } catch (error) {
      if (
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        this.logger.warn(`Token ${token} is invalid. It should be deleted.`);
       
        return false;
      }
      this.logger.error('Unexpected error validating FCM token', error);
      return false; 
    }

  }
}