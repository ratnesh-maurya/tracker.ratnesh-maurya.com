'use client';

import { Habit } from '@/types';

export async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

export function checkAndScheduleReminders(habits: Habit[]) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    habits.forEach((habit) => {
        if (!habit.reminders?.enabled || !habit.reminders.times || habit.reminders.times.length === 0) {
            return;
        }

        habit.reminders.times.forEach((reminderTime) => {
            // Check if it's time for this reminder (within 1 minute window)
            if (isTimeMatch(currentTime, reminderTime)) {
                // Check if we've already shown this notification today
                const notificationKey = `habit-reminder-${habit._id}-${reminderTime}-${now.toDateString()}`;
                const lastShown = localStorage.getItem(notificationKey);
                
                if (!lastShown) {
                    showHabitReminder(habit, reminderTime).catch((error) => {
                        console.error('Failed to show habit reminder:', error);
                    });
                    localStorage.setItem(notificationKey, now.toISOString());
                }
            }
        });
    });
}

function isTimeMatch(currentTime: string, reminderTime: string): boolean {
    const [currentHour, currentMin] = currentTime.split(':').map(Number);
    const [reminderHour, reminderMin] = reminderTime.split(':').map(Number);

    // Check if current time matches reminder time (within 1 minute)
    return currentHour === reminderHour && Math.abs(currentMin - reminderMin) <= 1;
}

async function showHabitReminder(habit: Habit, reminderTime: string) {
    const message = habit.reminders?.message || `Time to work on: ${habit.title}`;
    const icon = habit.icon || '📝';
    const title = `${icon} ${habit.title}`;
    
    const options = {
        body: message,
        icon: '/web-app-manifest-192x192.png',
        badge: '/web-app-manifest-192x192.png',
        tag: `habit-reminder-${habit._id}`,
        requireInteraction: false,
        silent: false,
        data: {
            url: '/habits'
        }
    };

    try {
        // Check if service worker is available and active
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, options);
        } else if ('Notification' in window && Notification.permission === 'granted') {
            // Fallback to regular Notification API
            const notification = new Notification(title, options);
            
            notification.onclick = () => {
                window.focus();
                window.location.href = '/habits';
                notification.close();
            };

            // Auto-close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);
        }
    } catch (error) {
        console.error('Failed to show notification:', error);
    }
}

export function startReminderChecker(habits: Habit[]) {
    // Check immediately
    checkAndScheduleReminders(habits);

    // Check every minute
    const interval = setInterval(() => {
        checkAndScheduleReminders(habits);
    }, 60000); // Check every minute

    // Clean up old notification keys from localStorage (older than 1 day)
    cleanupOldNotificationKeys();

    return () => clearInterval(interval);
}

function cleanupOldNotificationKeys() {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('habit-reminder-')) {
            const timestamp = localStorage.getItem(key);
            if (timestamp) {
                const notificationTime = new Date(timestamp).getTime();
                if (notificationTime < oneDayAgo) {
                    keysToRemove.push(key);
                }
            }
        }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
}

