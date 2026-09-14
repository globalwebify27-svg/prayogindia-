/**
 * Prayog India Central Notification Engine (B9)
 * Handles customer notifications & triggers non-blocking email dispatches.
 */

import { db } from "@/lib/db";
import { getEmailService } from "@/lib/email";

export interface CreateNotificationParams {
  userId: string;
  type:
    | "ORDER_PLACED"
    | "ORDER_SHIPPED"
    | "ORDER_DELIVERED"
    | "SUPPORT_REPLY"
    | "SERVICE_ENQUIRY_RECEIVED"
    | "SYSTEM_NOTICE";
  title: string;
  message: string;
  data?: Record<string, any>;
  customerEmail?: string;
}

export class NotificationService {
  /**
   * Create a customer notification record and trigger non-blocking email dispatch.
   * Email failures will NEVER cause database operations to fail or roll back.
   */
  static async createNotification(
    params: CreateNotificationParams,
  ): Promise<any> {
    const { userId, type, title, message, data, customerEmail } = params;

    let notificationRecord = null;

    if (process.env.DATABASE_URL) {
      try {
        notificationRecord = await db.notification.create({
          data: {
            userId,
            type,
            title,
            message,
            data: data || {},
          },
        });
      } catch (err) {
        console.warn("Failed to insert notification into database", err);
      }
    }

    // Trigger Non-Blocking Email Dispatch
    if (customerEmail) {
      const emailService = getEmailService();
      // Catch any potential rejection so execution never throws
      emailService
        .sendTemplate(customerEmail, type, {
          title,
          message,
          ...data,
        })
        .catch((err) => {
          console.warn("[NON-BLOCKING EMAIL FAILURE]", err);
        });
    }

    return (
      notificationRecord || {
        id: `notif-mock-${Date.now()}`,
        userId,
        type,
        title,
        message,
        createdAt: new Date().toISOString(),
      }
    );
  }

  /**
   * Get unread notification count for a customer using efficient DB count.
   */
  static async getUnreadCount(userId: string): Promise<number> {
    if (!process.env.DATABASE_URL) return 0;
    try {
      return await db.notification.count({
        where: {
          userId,
          readAt: null,
        },
      });
    } catch {
      return 0;
    }
  }

  /**
   * Mark a single notification as read (with customer isolation).
   */
  static async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<boolean> {
    if (!process.env.DATABASE_URL) return true;
    try {
      const notif = await db.notification.findFirst({
        where: { id: notificationId, userId },
      });
      if (!notif) return false;

      await db.notification.update({
        where: { id: notif.id },
        data: { readAt: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Mark all notifications for a customer as read.
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    if (!process.env.DATABASE_URL) return true;
    try {
      await db.notification.updateMany({
        where: { userId, readAt: null },
        data: { readAt: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  }
}
