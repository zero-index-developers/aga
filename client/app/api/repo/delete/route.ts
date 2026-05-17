import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoName } = body;

    if (!repoName) {
      return NextResponse.json(
        { success: false, error: 'Repository name is required' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // First, get the repository list to find the ID
    const listResponse = await fetch(`${backendUrl}/api/repositories`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!listResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch repositories from backend' },
        { status: listResponse.status }
      );
    }

    const listData = await listResponse.json();
    
    // Find the repository by name
    const repo = listData.data?.find((r: any) => 
      r.name === repoName || 
      r.full_name === repoName ||
      r.name.toLowerCase() === repoName.toLowerCase()
    );
    
    if (!repo) {
      return NextResponse.json(
        { success: false, error: `Repository "${repoName}" not found` },
        { status: 404 }
      );
    }

    // Delete the repository using its ID
    const deleteResponse = await fetch(`${backendUrl}/api/repositories/${repo.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errorData.message || 'Failed to delete repository' },
        { status: deleteResponse.status }
      );
    }

    const data = await deleteResponse.json();

    return NextResponse.json({
      success: true,
      message: data.message || `Repository "${repoName}" deleted successfully`,
    });
  } catch (error) {
    console.error('Delete repository error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Made with Bob
