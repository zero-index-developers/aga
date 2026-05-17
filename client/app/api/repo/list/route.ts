import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${backendUrl}/api/repositories`, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // Don't cache repository list
    });

    if (!response.ok) {
      console.error('Backend returned error:', response.status);
      
      // Handle authentication errors
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication required. Please log in to view repositories.' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch repositories from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform backend response to match frontend expectations
    const repositories = data.data?.map((repo: any) => ({
      name: repo.name,
      url: repo.url,
      full_name: repo.full_name,
      owner: repo.owner,
      description: repo.description,
      language: repo.language,
      status: repo.status,
      analytics: {
        nodes: repo.stats?.nodes_count || 0,
        edges: repo.stats?.edges_count || 0,
        health: 85, // Default health score
      },
      last_scanned_at: repo.last_scanned_at,
      created_at: repo.created_at,
    })) || [];

    return NextResponse.json(repositories);
  } catch (error) {
    console.error('Failed to fetch repositories:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend' },
      { status: 500 }
    );
  }
}

// Made with Bob
