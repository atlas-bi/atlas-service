import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { logout } from '~/session.server';

export const action = async ({ request }: ActionArgs) => logout(request);

export const loader = async ({ request }: LoaderArgs) => logout(request);
