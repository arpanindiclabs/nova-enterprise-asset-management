import { NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('Google Maps API key is not defined in environment variables');
}

// Center coordinates for Oman and UAE
const OMAN_CENTER = "21.4735,55.9754";
const UAE_CENTER = "25.2048,55.2708";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');
  const type = searchParams.get('type');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '5000'; // Default 5km radius

  if (!input && type !== 'nearby') {
    return NextResponse.json({ error: 'Input is required' }, { status: 400 });
  }

  try {
    let url = '';
    let method: 'GET' | 'POST' = 'GET';
    let body: string | null = null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY as string,
      'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.id'
    };

    switch (type) {
      case 'autocomplete':
        url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input || '')}&key=${GOOGLE_MAPS_API_KEY}&components=country:om|country:ae&language=en&types=establishment&location=${OMAN_CENTER}&radius=500000&sessiontoken=${Date.now()}`;
        break;
      case 'details':
        url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${input}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry,formatted_address,name,place_id&language=en`;
        break;
      case 'geocode':
        url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${input}&key=${GOOGLE_MAPS_API_KEY}&language=en&result_type=street_address|premise|point_of_interest`;
        break;
      case 'nearby':
        if (!lat || !lng) {
          return NextResponse.json({ error: 'Latitude and longitude are required for nearby search' }, { status: 400 });
        }
        url = 'https://places.googleapis.com/v1/places:searchNearby';
        method = 'POST';
        body = JSON.stringify({
          includedTypes: ['establishment'],
          maxResultCount: 10,
          locationRestriction: {
            circle: {
              center: {
                latitude: parseFloat(lat),
                longitude: parseFloat(lng)
              },
              radius: parseFloat(radius)
            }
          }
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const response = await fetch(url, {
      method,
      headers,
      body
    });
    
    const data = await response.json();

    if (type === 'nearby') {
      // Transform the new API response to match the old format
      if (response.ok) {
        return NextResponse.json({
          status: 'OK',
          results: data.places?.map((place: any) => ({
            place_id: place.id,
            name: place.displayName?.text,
            vicinity: place.formattedAddress,
            geometry: {
              location: {
                lat: place.location?.latitude,
                lng: place.location?.longitude
              }
            }
          })) || []
        });
      }
    }

    if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
      return NextResponse.json(data);
    }

    console.error('Google Places API Error:', {
      status: data.status,
      error_message: data.error_message,
      url: url,
      request_type: type,
      input: input
    });

    if (data.status === 'REQUEST_DENIED') {
      return NextResponse.json({ 
        error: 'API key is not authorized. Please check your Google Cloud Console settings.',
        status: data.status 
      }, { status: 403 });
    }

    if (data.status === 'INVALID_REQUEST') {
      return NextResponse.json({ 
        error: 'Invalid request parameters. Please check your input.',
        status: data.status 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: data.error_message || 'An error occurred while fetching data',
      status: data.status 
    }, { status: 500 });

  } catch (error) {
    console.error('Error fetching from Google Places API:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch data from Google Places API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 