# Push Notifications Module

This module provides Expo push notification functionality for the Tawsyla backend application.

## Features

- Send push notifications to individual devices or multiple devices
- Order creation notifications
- Order status update notifications
- Welcome notifications
- Device token management for users

## Setup

### 1. Environment Variables

Add the following environment variable to your `.env` file:

```env
EXPO_ACCESS_TOKEN=your-expo-access-token
```

To get an Expo access token:
1. Go to [Expo Developer Tools](https://expo.dev/)
2. Sign in to your account
3. Go to Settings > Access Tokens
4. Create a new access token

### 2. Database Migration

Run the migration to add push tokens to the user table:

```bash
npm run migration:run
```

## Usage

### 1. Register Device Tokens

Users need to register their device tokens to receive push notifications:

```typescript
// POST /api/v1/users/:id/push-tokens
{
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

### 2. Remove Device Tokens

```typescript
// DELETE /api/v1/users/:id/push-tokens
{
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

### 3. Get User's Push Tokens

```typescript
// GET /api/v1/users/:id/push-tokens
// Returns array of push tokens
```

### 4. Send Custom Notifications (Admin Only)

```typescript
// POST /api/v1/push-notifications/send
{
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Custom Title",
  "body": "Custom message body",
  "data": {
    "customKey": "customValue"
  }
}
```

### 5. Test Order Created Notification

```typescript
// POST /api/v1/push-notifications/test-order-created
{
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "orderNumber": "ORD-2024-001",
  "total": 99.99,
  "orderId": "uuid-here"
}
```

## Automatic Notifications

The system automatically sends push notifications for:

1. **Order Creation**: When a new order is created
2. **Order Status Updates**: When order status changes (confirmed, processing, shipped, delivered, cancelled, refunded)

## Service Methods

### PushNotificationService

- `sendToDevice(pushToken, notification)` - Send to single device
- `sendToMultipleDevices(pushTokens, notification)` - Send to multiple devices
- `sendOrderCreatedNotification(pushToken, orderNumber, total, orderId)` - Order creation notification
- `sendOrderStatusUpdateNotification(pushToken, orderNumber, status, orderId)` - Status update notification
- `sendWelcomeNotification(pushToken, userName)` - Welcome notification

## Client-Side Integration

### React Native with Expo

```typescript
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Register for push notifications
async function registerForPushNotificationsAsync() {
  let token;
  
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

// Register token with backend
async function registerTokenWithBackend(token: string, userId: number) {
  try {
    const response = await fetch(`/api/v1/users/${userId}/push-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourAuthToken}`,
      },
      body: JSON.stringify({ pushToken: token }),
    });
    
    if (response.ok) {
      console.log('Push token registered successfully');
    }
  } catch (error) {
    console.error('Failed to register push token:', error);
  }
}
```

## Error Handling

The push notification service includes comprehensive error handling:

- Invalid push tokens are filtered out
- Failed notifications are logged but don't break the main flow
- Service gracefully handles missing Expo access token

## Testing

Use the provided test endpoints to verify push notification functionality:

1. Register a device token
2. Use the test endpoints to send notifications
3. Check device for received notifications

## Notes

- Push notifications are sent asynchronously and won't block order creation
- Users can have multiple device tokens (multiple devices)
- Invalid tokens are automatically filtered out
- All notifications include custom data for handling in the client app
