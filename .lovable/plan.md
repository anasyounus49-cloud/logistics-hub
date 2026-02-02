
# Plan: Fix Axios Configuration and Type Mismatches

## Problem Summary

There are two issues to resolve:

1. **Axios Content-Type Logic**: The current axios interceptor handles 3 cases correctly, but we need to ensure clarity:
   - Login: `application/x-www-form-urlencoded` (URLSearchParams)
   - Vehicle registration: `multipart/form-data` (FormData with image)
   - Everything else: `application/json`

2. **Type Mismatch Error**: The `VehicleFormDialog` expects `onSubmit` to return `Promise<boolean>`, but `createVehicle` returns `Promise<VehicleOut>`. This causes a TypeScript compilation error.

---

## Solution

### Step 1: Verify Axios Configuration (Already Correct)

The current axios interceptor in `src/api/config/axiosConfig.ts` is already correctly configured:
- Detects `URLSearchParams` and sets `application/x-www-form-urlencoded`
- Detects `FormData` and removes Content-Type (lets browser set boundary)
- Defaults to `application/json` for everything else

No changes needed here.

### Step 2: Fix VehicleFormDialog Type Mismatch

**File**: `src/components/vehicles/VehicleFormDialog.tsx`

Update the component interface to accept the correct return type:

```typescript
// Before
interface VehicleFormDialogProps {
  onSubmit: (data: VehicleCreate) => Promise<boolean>;
}

// After
interface VehicleFormDialogProps {
  onSubmit: (data: VehicleCreate | FormData) => Promise<VehicleOut | boolean>;
}
```

Also update the submit handler to handle both return types:

```typescript
const handleFormSubmit = async (data: VehicleCreate) => {
  setLoading(true);
  try {
    const result = await onSubmit(data);
    // Success if we get here (either VehicleOut object or true)
    const success = result === true || (typeof result === 'object' && result !== null);
    if (success) {
      reset();
      setOpen(false);
    }
  } catch (error) {
    // Error is already handled by useVehicles hook with toast
  } finally {
    setLoading(false);
  }
};
```

### Step 3: Update VehicleManagementPage (No Changes Needed)

The `createVehicle` function from `useVehicles` hook now properly returns `Promise<VehicleOut>` and throws on error, which is the correct pattern. The `VehicleFormDialog` will be updated to handle this.

---

## Technical Details

### Content-Type Flow Diagram

```text
+------------------+     +------------------+     +-------------------+
|  Login Request   | --> | URLSearchParams  | --> | form-urlencoded   |
+------------------+     +------------------+     +-------------------+

+------------------+     +------------------+     +-------------------+
| Vehicle Register | --> | FormData         | --> | multipart/form    |
| (with image)     |     |                  |     | (browser sets)    |
+------------------+     +------------------+     +-------------------+

+------------------+     +------------------+     +-------------------+
| All Other APIs   | --> | JSON Object      | --> | application/json  |
+------------------+     +------------------+     +-------------------+
```

### Files to Modify

| File | Change |
|------|--------|
| `src/components/vehicles/VehicleFormDialog.tsx` | Update interface and submit handler to accept `VehicleOut` return type |

---

## Summary

This is a minimal fix that:
1. Confirms the axios interceptor is already correctly handling the 3 content types
2. Fixes the TypeScript type mismatch by updating `VehicleFormDialog` to accept the correct return type from `createVehicle`
