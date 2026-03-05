-- =============================================
-- ALLOW PUBLIC CONTACT FORM SUBMISSIONS
-- Adds policy to allow anyone to create support tickets via contact form
-- =============================================

-- Drop existing insert policy if it's too restrictive
DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;

-- Allow anyone (including unauthenticated users) to create support tickets
-- This enables the contact form to work for all visitors
CREATE POLICY "Anyone can create tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (true);

-- Users can still view their own tickets if logged in
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT USING (
    user_id = auth.uid() 
    OR user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
