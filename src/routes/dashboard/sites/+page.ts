import { redirect } from '@sveltejs/kit'

export async function load(event) {
  const { site_groups } = await event.parent();

  // Ensure site_groups is defined and has at least one element
  if (!site_groups || site_groups.length === 0) {
    return { site_groups: [] }; // Return empty groups instead of crashing
  }

  const group_id = event.url.searchParams.get('group');
  const group_exists = site_groups.find(g => String(g.id) === group_id);

  // Redirect only if site_groups exists and group_id is invalid
  if (!group_exists) {
    throw redirect(307, `/dashboard/sites?group=${site_groups[0].id}`);
  }

  return { site_groups };
}
