import { PUBLIC_SUPABASE_PUBLIC_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
import _ from 'lodash-es';
import { redirect } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Load} */
export async function load(event) {
	event.depends('app:data');

	// Create Supabase client
	const supabase = createSupabaseLoadClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_PUBLIC_KEY,
		event: { fetch },
		serverSession: event?.data?.session
	});

	// Fetch session data
	const { data: { session } } = await supabase.auth.getSession();

	// If no session, return an empty response
	if (!session || !session.user) {
		return {
			supabase,
			session: null,
			user: null,
			sites: [],
			starters: []
		};
	}

	// Fetch user profile safely
	const { data: profile } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', session.user?.id)
		.maybeSingle() || {};

	// Fetch sites & starters
	const [{ data: sites }, { data: starters }] = await Promise.all([
		supabase.from('sites').select('*').order('created_at', { ascending: true }).match({ is_starter: false }),
		supabase.from('sites').select('*').order('created_at', { ascending: true }).match({ is_starter: true })
	]);

	// Redirect collaborators who are not full users **only if they're not already on the correct site**
	if (
		!profile?.is_full_user &&
		event.url.pathname.startsWith('/dashboard') &&
		sites?.[0]?.id &&
		event.url.pathname !== `/${sites[0].id}`
	) {
		throw redirect(307, `/${sites[0].id}`);
	}

	return {
		supabase,
		session,
		user: {
			...profile,
			...session.user,
			collaborator: false
		},
		sites: sites || [],
		starters: starters || []
	};
}
