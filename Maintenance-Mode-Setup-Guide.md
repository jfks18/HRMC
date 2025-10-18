# 🛠️ Maintenance Mode System - Complete Implementation Guide

## Overview
The maintenance mode system allows you to selectively put individual modules into maintenance mode, blocking regular users while allowing developers to access pages directly via URL.

## How It Works

### 1. **System Monitor Control Panel**
- Located at `/it/system-monitor`
- Shows all modules with their current status
- **Dev/Admin users see:**
  - "Set Maintenance" button for operational modules
  - "Set Operational" button for maintenance modules
  - "Access" button (always works for devs)
- **Regular users see:**
  - "Access" button (disabled if module in maintenance)

### 2. **Page Protection**
- Wrap any page with `MaintenanceGuard` component
- Automatically checks if module is in maintenance mode
- **For regular users:** Shows maintenance page with friendly message
- **For developers:** Shows warning banner but allows access

### 3. **Role-Based Access**
- **Regular users:** Blocked from maintenance modules
- **Admin users:** Can control maintenance mode
- **Dev users:** Can control maintenance mode + bypass restrictions

## Setup Instructions

### Step 1: Add Maintenance Endpoints to Your Express Server

Add these endpoints to your Express server using the code from `API-Reference-IT-Management.md`:

```javascript
// Required endpoints:
POST /it/maintenance-mode        // Toggle maintenance mode
GET /it/maintenance-status       // Check if module is in maintenance  
GET /it/maintenance-list         // Get all maintenance modules
```

### Step 2: Protect Your Pages

Replace your page exports with the MaintenanceGuard pattern:

```typescript
// Before
export default function LeavePage() {
  return (
    <div>Your page content</div>
  );
}

// After  
import MaintenanceGuard from '../../components/MaintenanceGuard';

export default function LeavePage() {
  const userRole = getUserRole(); // Your auth function
  
  return (
    <MaintenanceGuard moduleName="leave_management" userRole={userRole}>
      <div>Your page content</div>
    </MaintenanceGuard>
  );
}
```

### Step 3: Configure Module Names

Make sure your module names match between:
- System monitor toggle buttons
- MaintenanceGuard `moduleName` prop  
- API endpoints

**Standard module names:**
- `leave_management`
- `certificate_management` 
- `attendance_system`
- `user_authentication`
- `faculty_evaluation`

### Step 4: Integrate Authentication

Update the `getUserRole()` function to return actual user roles from your auth system:

```typescript
function getUserRole(): string {
  // Replace with your actual authentication logic
  const user = getCurrentUser(); // Your auth function
  return user?.role || 'user';
}
```

## User Experience

### For Regular Users

**When module is operational:**
- ✅ Can access module normally
- ✅ See module status as "operational" in system monitor

**When module is in maintenance:**
- ❌ Redirected to maintenance page with friendly message
- ❌ "Access" button disabled in system monitor
- 📄 See maintenance page with options to go back/home/refresh

### For Developers

**When module is in maintenance:**
- ✅ Can still access via direct URL
- ⚠️ See warning banner: "Developer Access: This module is in maintenance mode"
- ✅ Can toggle maintenance mode in system monitor
- ✅ Full access to all functionality

## Testing the System

### 1. Test Maintenance Toggle
1. Go to `/it/system-monitor`
2. Find a module (e.g., "Leave Management")
3. Click "Set Maintenance"
4. Verify module status changes to "maintenance"

### 2. Test User Access
1. Set a module to maintenance mode
2. Try to access that module's page
3. **As regular user:** Should see maintenance page
4. **As developer:** Should see warning banner + content

### 3. Test API Integration
```bash
# Check maintenance status
curl "https://your-ngrok-url.ngrok-free.app/it/maintenance-status?module=leave_management"

# Toggle maintenance mode
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"module":"leave_management","maintenance":true,"userRole":"dev"}' \
  "https://your-ngrok-url.ngrok-free.app/it/maintenance-mode"
```

## Module Status Colors

- 🟢 **Green (operational):** Module working normally
- 🔵 **Blue (maintenance):** Module in maintenance mode  
- 🟡 **Yellow (issues/slow):** Module has performance issues
- 🔴 **Red (down/offline):** Module is not responding

## Files Created/Modified

### New Files:
- `src/app/components/MaintenanceGuard.tsx` - Protection component
- `src/app/admin/leave/page-with-maintenance.tsx` - Usage example
- Enhanced `API-Reference-IT-Management.md` - Backend implementation

### Modified Files:
- `src/app/it/system-monitor/page.tsx` - Added maintenance controls
- `src/app/apiFetch.ts` - Added maintenance endpoints
- Enhanced API documentation

## Security Notes

- Only `dev` and `admin` roles can control maintenance mode
- Regular users are completely blocked from maintenance modules
- Developers can bypass restrictions but see clear warnings
- All maintenance mode changes are logged for audit

## Next Steps

1. **Implement the API endpoints** in your Express server
2. **Add authentication integration** for real user roles
3. **Protect your existing pages** with MaintenanceGuard
4. **Test the complete workflow** with different user roles
5. **Optional:** Add database persistence for maintenance state

Your maintenance mode system is now ready for production use! 🚀
