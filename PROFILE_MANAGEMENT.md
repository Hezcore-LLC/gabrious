# Profile & Preferences Management

## Overview

Users can now manage their profile information and study preferences through a dedicated profile page.

## Features

### 1. Personal Information Management
- Update first name and last name
- Change email address (with uniqueness validation)
- View account creation date and verification status

### 2. Study Preferences
- **Faith Context**: Choose between Christian, Jewish, Muslim, or General/Interfaith
  - Affects how study notes are generated and formatted
  - Influences AI prompts and terminology used
  
- **Preferred Depth Mode**: Select default complexity level
  - **Beginner**: Simple explanations for those new to study
  - **Intermediate**: Balanced detail for regular students
  - **Advanced**: In-depth analysis for experienced learners
  - **Scholar**: Academic-level content with extensive references

### 3. Security
- Change password with current password verification
- Password must be at least 8 characters long
- Secure password hashing using bcrypt

### 4. Account Management
- Soft delete account (deactivates rather than permanently deletes)
- Confirmation dialog to prevent accidental deletion

## API Endpoints

### Backend (FastAPI)

All endpoints require authentication via Bearer token.

#### `GET /api/profile/me`
Get current user's profile information.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "faith_context": "christian",
  "preferred_depth_mode": "intermediate",
  "is_verified": false,
  "created_at": "2025-01-01T00:00:00"
}
```

#### `PUT /api/profile/me`
Update profile information.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "newemail@example.com"
}
```

#### `PUT /api/profile/preferences`
Update study preferences.

**Request Body:**
```json
{
  "faith_context": "jewish",
  "preferred_depth_mode": "advanced"
}
```

#### `POST /api/profile/change-password`
Change user password.

**Request Body:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword456"
}
```

#### `DELETE /api/profile/me`
Deactivate user account (soft delete).

## Frontend Components

### Profile Page (`/profile`)
- Tabbed interface with 4 sections:
  1. **Profile**: Personal information
  2. **Preferences**: Study settings
  3. **Security**: Password management
  4. **Account**: Danger zone (account deletion)

### Header Integration
- User avatar dropdown menu in header (desktop)
- Profile & Settings link in mobile menu
- Quick access to profile from any page

## User Experience

### Success Messages
- Profile updated successfully
- Preferences saved
- Password changed successfully

### Error Handling
- Email already in use
- Current password incorrect
- Password too short
- Network errors with user-friendly messages

### Loading States
- Spinner while loading profile data
- Disabled buttons during save operations
- Smooth transitions between states

## Database Schema

The User model includes:
- `faith_context`: Enum (christian, jewish, muslim, general)
- `preferred_depth_mode`: String (beginner, intermediate, advanced, scholar)
- `is_active`: Boolean for soft delete
- `is_verified`: Boolean for email verification status

## Future Enhancements

1. **Email Verification**: Send verification emails when email is changed
2. **Profile Picture**: Upload and display user avatars
3. **Notification Preferences**: Control email and in-app notifications
4. **Two-Factor Authentication**: Add 2FA for enhanced security
5. **Export Data**: Allow users to download their data (GDPR compliance)
6. **Session Management**: View and revoke active sessions
7. **Language Preferences**: Support multiple interface languages
8. **Accessibility Settings**: Font size, contrast, screen reader options

## Usage

1. Navigate to `/profile` or click the user avatar in the header
2. Update any information in the respective tabs
3. Click "Save Changes" or "Save Preferences"
4. Changes are immediately reflected across the application

## Security Considerations

- All endpoints require authentication
- Passwords are hashed using bcrypt
- Email uniqueness is enforced at database level
- Current password verification required for password changes
- Soft delete preserves data integrity while deactivating accounts
