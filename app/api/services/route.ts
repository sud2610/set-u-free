import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// GET - Fetch services with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const providerId = searchParams.get('providerId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // In production, build Firestore query based on filters
    // let query = adminDb.collection('services').where('isActive', '==', true);
    // if (category) query = query.where('category', '==', category);
    // if (providerId) query = query.where('providerId', '==', providerId);

    // Fetch services from Firestore
    let servicesQuery = query(
      collection(db!, 'services'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    if (category) {
      servicesQuery = query(
        collection(db!, 'services'),
        where('isActive', '==', true),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
    }

    if (providerId) {
      servicesQuery = query(
        collection(db!, 'services'),
        where('isActive', '==', true),
        where('providerId', '==', providerId),
        orderBy('createdAt', 'desc')
      );
    }

    // Apply pagination limit
    servicesQuery = query(servicesQuery, firestoreLimit(page * limit));

    const servicesSnapshot = await getDocs(servicesQuery);
    let services = servicesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Apply search filter (in memory for now)
    if (search) {
      const searchLower = search.toLowerCase();
      services = services.filter(
        (s: any) =>
          s.title?.toLowerCase().includes(searchLower) ||
          s.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const totalServices = services.length;
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalServices);
    const paginatedServices = services.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        items: paginatedServices,
        total: totalServices,
        page,
        limit,
        hasMore: endIndex < totalServices,
      },
    });
  } catch (error) {
    console.error('Fetch services error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST - Create a new service (for providers)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      providerId,
      name,
      description,
      price,
      priceType = 'fixed',
      duration,
      category,
      subcategory,
      images,
    } = body;

    // Validate required fields
    if (!providerId || !name || !price || !duration || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required service information' },
        { status: 400 }
      );
    }

    // Validate price type
    if (!['fixed', 'hourly', 'starting_from'].includes(priceType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid price type' },
        { status: 400 }
      );
    }

    // Create service object
    const service = {
      id: `service_${Date.now()}`,
      providerId,
      name,
      description: description || '',
      price,
      priceType,
      duration,
      category,
      subcategory: subcategory || '',
      images: images || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In production, save to Firestore
    // const docRef = await adminDb.collection('services').add(service);

    return NextResponse.json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    );
  }
}






