import { redirect } from '@sveltejs/kit';

export async function load(event) {
  const { site_groups } = await event.parent();

  // Make sure site_groups is always an array
  if (!Array.isArray(site_groups) || site_groups.length === 0) {
    console.warn("No site groups found. Skipping redirect.");
    return { site_groups: [] }; // Just return an empty list instead of breaking
  }

  const group_id = event.url.searchParams.get('group');
  const group_exists = site_groups.find(g => String(g.id) === group_id);

  // If no valid group exists, don't redirect. Just return the data.
  return { site_groups };
}
