/**
 * Facebook Graph API helpers for publishing to Facebook Pages.
 */

export interface FacebookPostResult {
  id: string;
  postId?: string;
}

export interface FacebookPageInfo {
  id: string;
  name: string;
  access_token?: string;
}

/**
 * Publish a message to a Facebook Page feed.
 * Requires a Page Access Token with `pages_manage_posts` permission.
 */
export async function publishToFacebookPage(
  pageId: string,
  accessToken: string,
  message: string
): Promise<FacebookPostResult> {
  const url = `https://graph.facebook.com/v18.0/${pageId}/feed`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      access_token: accessToken,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error?.message || `Facebook API error: ${response.status}`;
    throw new Error(errorMsg);
  }

  return { id: data.id, postId: data.id };
}

/**
 * Get basic page info to verify the access token works.
 */
export async function getFacebookPageInfo(
  pageId: string,
  accessToken: string
): Promise<FacebookPageInfo> {
  const url = `https://graph.facebook.com/v18.0/${pageId}?fields=id,name&access_token=${encodeURIComponent(accessToken)}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error?.message || `Facebook API error: ${response.status}`;
    throw new Error(errorMsg);
  }

  return { id: data.id, name: data.name };
}
