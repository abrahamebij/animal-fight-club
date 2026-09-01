/**
 * Client service for uploading custom combatant avatars via server API route
 */

export async function uploadImageToImgBB(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const json = await response.json();

  if (!response.ok || !json.success || !json.url) {
    throw new Error(json?.error || 'Failed to upload avatar image');
  }

  return json.url;
}
