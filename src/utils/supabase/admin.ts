import { createBrowserClient } from '@supabase/ssr';

export const createAdminClient = () => {
  return createBrowserClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};
