import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error: IMGBB_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided in request' },
        { status: 400 }
      );
    }

    const uploadFormData = new FormData();
    uploadFormData.append('image', imageFile);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `ImgBB upload failed: ${errText}` },
        { status: response.status }
      );
    }

    const json = await response.json();

    if (!json.success || !json.data) {
      return NextResponse.json(
        { error: 'Invalid response from image storage provider' },
        { status: 502 }
      );
    }

    const imageUrl = json.data.display_url || json.data.url;

    return NextResponse.json({
      success: true,
      url: imageUrl,
    });
  } catch (error: any) {
    console.error('Server upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during image upload' },
      { status: 500 }
    );
  }
}
