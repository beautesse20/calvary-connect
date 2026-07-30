'use server';

import { createClient } from '@/lib/supabase/server';

export async function sendContactMessage(formData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from('messages').insert({
    business_id: null,
    sender_name: formData.name,
    sender_email: formData.email,
    content: `[${formData.subject}] ${formData.message}`,
  });
  if (error) return { error: error.message };
  return { success: true };
}
