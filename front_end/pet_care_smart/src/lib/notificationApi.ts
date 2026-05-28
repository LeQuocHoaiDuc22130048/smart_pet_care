/**
 * Notification Service API
 * Route prefix: /pet_care_notification
 */

import { apiRequest, type ApiResponse } from './api';

export type NotificationType = 'SYSTEM' | 'USER' | 'ORDER' | 'PAYMENT' | 'BOOKING' | 'FEEDBACK';

export interface NotificationItem {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    referenceId?: string | null;
    read: boolean;
    createdAt?: string;
}

export interface UnreadCountResponse {
    unreadCount: number;
}

export const notificationApi = {
    getMyNotifications(unreadOnly = false): Promise<ApiResponse<NotificationItem[]>> {
        return apiRequest(`/pet_care_notification/notifications/my?unreadOnly=${unreadOnly}`, {
            requireAuth: true,
        });
    },

    getUnreadCount(): Promise<ApiResponse<UnreadCountResponse>> {
        return apiRequest('/pet_care_notification/notifications/my/unread-count', {
            requireAuth: true,
        });
    },

    markAsRead(notificationId: string): Promise<ApiResponse<NotificationItem>> {
        return apiRequest(`/pet_care_notification/notifications/${notificationId}/read`, {
            method: 'PATCH',
            requireAuth: true,
        });
    },

    markAllAsRead(): Promise<ApiResponse<null>> {
        return apiRequest('/pet_care_notification/notifications/my/read-all', {
            method: 'PATCH',
            requireAuth: true,
        });
    },
};
