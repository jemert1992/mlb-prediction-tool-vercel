import { NextRequest, NextResponse } from 'next/server';
import { getAllPredictionsForDate } from '@/lib/mlbPredictionApi';

export async function GET(request: NextRequest) {
  try {
    // Get date from query parameters
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');
    
    // Parse date or use today
    const date = dateParam ? new Date(dateParam) : new Date();
    
    // Get predictions
    const predictions = await getAllPredictionsForDate(date);
    
    // Return predictions as JSON
    return NextResponse.json(predictions);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predictions', message: (error as Error).message },
      { status: 500 }
    );
  }
}
