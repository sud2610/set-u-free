import { NextRequest, NextResponse } from 'next/server';
import { getProvider, updateProvider } from '@/lib/firestore';
import type { Provider, TimeSlot } from '@/types';

// ==================== TYPES ====================

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

interface AddSlotRequestBody {
  providerId: string;
  slots: {
    date: string;      // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
  }[];
}

interface DeleteSlotRequestBody {
  providerId: string;
  slotIndex?: number;
  date?: string;
  startTime?: string;
}

// ==================== SECURITY HEADERS ====================

function getSecurityHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };
}

// ==================== AUTHENTICATION ====================

async function verifyAuth(request: NextRequest): Promise<{ valid: boolean; userId?: string; error?: string }> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return { valid: false, error: 'Authorization header is required' };
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return { valid: false, error: 'Token is required' };
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' };
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token has expired' };
    }

    return { valid: true, userId: payload.user_id || payload.sub };
  } catch {
    return { valid: false, error: 'Token verification failed' };
  }
}

// ==================== VALIDATION ====================

function validateTimeFormat(time: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

function validateDateFormat(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(new Date(date).getTime());
}

function validateSlots(slots: AddSlotRequestBody['slots']): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(slots) || slots.length === 0) {
    return { valid: false, errors: ['At least one slot is required'] };
  }

  if (slots.length > 50) {
    return { valid: false, errors: ['Maximum 50 slots per request'] };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  slots.forEach((slot, index) => {
    if (!validateDateFormat(slot.date)) {
      errors.push(`Slot ${index + 1}: Invalid date format (use YYYY-MM-DD)`);
    } else {
      const slotDate = new Date(slot.date);
      if (slotDate < today) {
        errors.push(`Slot ${index + 1}: Date cannot be in the past`);
      }
    }

    if (!validateTimeFormat(slot.startTime)) {
      errors.push(`Slot ${index + 1}: Invalid start time format (use HH:mm)`);
    }

    if (!validateTimeFormat(slot.endTime)) {
      errors.push(`Slot ${index + 1}: Invalid end time format (use HH:mm)`);
    }

    if (validateTimeFormat(slot.startTime) && validateTimeFormat(slot.endTime)) {
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        errors.push(`Slot ${index + 1}: End time must be after start time`);
      }

      if (endMinutes - startMinutes < 15) {
        errors.push(`Slot ${index + 1}: Minimum slot duration is 15 minutes`);
      }

      if (endMinutes - startMinutes > 180) {
        errors.push(`Slot ${index + 1}: Maximum slot duration is 3 hours`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ==================== MOCK DATA ====================

const mockSlots: TimeSlot[] = [
  { date: '2024-01-25', startTime: '09:00', endTime: '09:30', available: true },
  { date: '2024-01-25', startTime: '10:00', endTime: '10:30', available: true },
  { date: '2024-01-25', startTime: '11:00', endTime: '11:30', available: false },
  { date: '2024-01-25', startTime: '14:00', endTime: '14:30', available: true },
  { date: '2024-01-25', startTime: '15:00', endTime: '15:30', available: true },
  { date: '2024-01-26', startTime: '09:00', endTime: '09:30', available: true },
  { date: '2024-01-26', startTime: '10:00', endTime: '10:30', available: true },
  { date: '2024-01-26', startTime: '11:00', endTime: '11:30', available: true },
];

// ==================== GET HANDLER ====================

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const date = searchParams.get('date');
    const availableOnly = searchParams.get('available') === 'true';

    if (!providerId) {
      return NextResponse.json(
        { success: false, message: 'Provider ID is required' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Fetch provider
    let provider: Provider | null = null;
    try {
      provider = await getProvider(providerId);
    } catch (error) {
      console.error('Error fetching provider:', error);
    }

    // Get slots
    let slots: TimeSlot[] = provider?.consultationSlots || mockSlots;

    // Filter by date
    if (date && validateDateFormat(date)) {
      slots = slots.filter((s) => s.date === date);
    }

    // Filter available only
    if (availableOnly) {
      slots = slots.filter((s) => s.available);
    }

    // Sort by date and time
    slots.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

    // Group by date
    const groupedSlots: Record<string, TimeSlot[]> = {};
    slots.forEach((slot) => {
      if (!groupedSlots[slot.date]) {
        groupedSlots[slot.date] = [];
      }
      groupedSlots[slot.date].push(slot);
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Slots fetched successfully',
        data: {
          providerId,
          slots,
          groupedByDate: groupedSlots,
          totalSlots: slots.length,
          availableSlots: slots.filter((s) => s.available).length,
        },
      },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Get slots error:', error);
    
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// ==================== POST HANDLER ====================

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Unauthorized' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Parse request body
    let body: AddSlotRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Validate provider ID
    if (!body.providerId) {
      return NextResponse.json(
        { success: false, message: 'Provider ID is required' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Verify provider ownership
    if (auth.userId !== body.providerId) {
      return NextResponse.json(
        { success: false, message: 'You can only add slots to your own profile' },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    // Validate slots
    const validation = validateSlots(body.slots);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: { slots: validation.errors.join('; ') },
        },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Fetch current provider data
    let provider: Provider | null = null;
    try {
      provider = await getProvider(body.providerId);
    } catch (error) {
      console.error('Error fetching provider:', error);
    }

    const existingSlots = provider?.consultationSlots || [];

    // Check for duplicate slots
    const newSlots: TimeSlot[] = [];
    const duplicates: string[] = [];

    body.slots.forEach((slot) => {
      const isDuplicate = existingSlots.some(
        (existing) =>
          existing.date === slot.date &&
          existing.startTime === slot.startTime
      );

      if (isDuplicate) {
        duplicates.push(`${slot.date} ${slot.startTime}`);
      } else {
        newSlots.push({
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          available: true,
        });
      }
    });

    if (newSlots.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'All provided slots already exist',
          errors: { duplicates: duplicates.join(', ') },
        },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Merge and update slots
    const updatedSlots = [...existingSlots, ...newSlots];

    try {
      await updateProvider(body.providerId, {
        consultationSlots: updatedSlots,
      });
    } catch (error) {
      console.error('Error updating provider:', error);
      // Continue for development
    }

    return NextResponse.json(
      {
        success: true,
        message: `${newSlots.length} slot${newSlots.length !== 1 ? 's' : ''} added successfully`,
        data: {
          addedSlots: newSlots,
          addedCount: newSlots.length,
          duplicatesSkipped: duplicates.length,
          totalSlots: updatedSlots.length,
        },
      },
      { status: 201, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Add slots error:', error);
    
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// ==================== DELETE HANDLER ====================

export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Unauthorized' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Parse request body
    let body: DeleteSlotRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Validate provider ID
    if (!body.providerId) {
      return NextResponse.json(
        { success: false, message: 'Provider ID is required' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Verify provider ownership
    if (auth.userId !== body.providerId) {
      return NextResponse.json(
        { success: false, message: 'You can only delete your own slots' },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    // Need either slotIndex or date+startTime
    if (body.slotIndex === undefined && (!body.date || !body.startTime)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Either slotIndex or date+startTime is required' 
        },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Fetch current provider data
    let provider: Provider | null = null;
    try {
      provider = await getProvider(body.providerId);
    } catch (error) {
      console.error('Error fetching provider:', error);
    }

    const existingSlots = provider?.consultationSlots || mockSlots;

    // Find and remove slot
    let updatedSlots: TimeSlot[];
    let removedSlot: TimeSlot | null = null;

    if (body.slotIndex !== undefined) {
      // Remove by index
      if (body.slotIndex < 0 || body.slotIndex >= existingSlots.length) {
        return NextResponse.json(
          { success: false, message: 'Invalid slot index' },
          { status: 400, headers: getSecurityHeaders() }
        );
      }
      removedSlot = existingSlots[body.slotIndex];
      updatedSlots = existingSlots.filter((_, index) => index !== body.slotIndex);
    } else {
      // Remove by date + startTime
      const slotIndex = existingSlots.findIndex(
        (s) => s.date === body.date && s.startTime === body.startTime
      );

      if (slotIndex === -1) {
        return NextResponse.json(
          { success: false, message: 'Slot not found' },
          { status: 404, headers: getSecurityHeaders() }
        );
      }

      removedSlot = existingSlots[slotIndex];
      updatedSlots = existingSlots.filter((_, index) => index !== slotIndex);
    }

    // Check if slot has bookings (in real app, check bookings collection)
    if (removedSlot && !removedSlot.available) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot delete a slot that has an active booking' 
        },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Update provider
    try {
      await updateProvider(body.providerId, {
        consultationSlots: updatedSlots,
      });
    } catch (error) {
      console.error('Error updating provider:', error);
      // Continue for development
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Slot deleted successfully',
        data: {
          deletedSlot: removedSlot,
          remainingSlots: updatedSlots.length,
        },
      },
      { status: 200, headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    console.error('Delete slot error:', error);
    
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// ==================== OPTIONS HANDLER ====================

export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        ...getSecurityHeaders(),
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}






