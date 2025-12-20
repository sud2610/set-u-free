import { NextRequest, NextResponse } from 'next/server';

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

    // Mock services for development
    const mockServices = [
      {
        id: 's1',
        name: 'Basic Plumbing Repair',
        description: 'Fix leaks, clogged drains, and minor plumbing issues',
        price: 500,
        priceType: 'starting_from',
        duration: 60,
        category: 'home-services',
        subcategory: 'Plumbing',
        isActive: true,
        provider: {
          id: 'p1',
          businessName: 'QuickFix Home Solutions',
          rating: 4.8,
          location: { city: 'Mumbai' },
        },
      },
      {
        id: 's2',
        name: 'Hair Styling',
        description: 'Professional haircut and styling services',
        price: 800,
        priceType: 'fixed',
        duration: 45,
        category: 'beauty-wellness',
        subcategory: 'Hair Salon',
        isActive: true,
        provider: {
          id: 'p2',
          businessName: 'Glamour Studio',
          rating: 4.9,
          location: { city: 'Delhi' },
        },
      },
      {
        id: 's3',
        name: 'Personal Training Session',
        description: 'One-on-one fitness training with certified trainer',
        price: 1500,
        priceType: 'hourly',
        duration: 60,
        category: 'health-fitness',
        subcategory: 'Personal Training',
        isActive: true,
        provider: {
          id: 'p3',
          businessName: 'FitLife Pro',
          rating: 4.7,
          location: { city: 'Bangalore' },
        },
      },
      {
        id: 's4',
        name: 'Math Tutoring',
        description: 'Academic tutoring for grades 6-12',
        price: 600,
        priceType: 'hourly',
        duration: 60,
        category: 'education-tutoring',
        subcategory: 'Academic Tutoring',
        isActive: true,
        provider: {
          id: 'p4',
          businessName: 'Bright Minds Academy',
          rating: 4.8,
          location: { city: 'Pune' },
        },
      },
      {
        id: 's5',
        name: 'Wedding Photography',
        description: 'Full day wedding photography coverage',
        price: 50000,
        priceType: 'starting_from',
        duration: 480,
        category: 'events-entertainment',
        subcategory: 'Photography',
        isActive: true,
        provider: {
          id: 'p5',
          businessName: 'Capture Moments',
          rating: 4.9,
          location: { city: 'Mumbai' },
        },
      },
    ];

    // Apply filters
    let filteredServices = mockServices;

    if (category) {
      filteredServices = filteredServices.filter((s) => s.category === category);
    }

    if (providerId) {
      filteredServices = filteredServices.filter((s) => s.provider.id === providerId);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredServices = filteredServices.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.description.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedServices = filteredServices.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: {
        items: paginatedServices,
        total: filteredServices.length,
        page,
        limit,
        hasMore: startIndex + limit < filteredServices.length,
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






