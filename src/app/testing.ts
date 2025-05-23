import { createClient } from "@/utils/supabase/client";

const supabase = createClient()

const testing = () => {
    const user = (await supabase.auth.getUser()).data.user;
    console.log(user); // null = unauthenticated
}
