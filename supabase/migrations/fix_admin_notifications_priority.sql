-- Fix admin_notifications table - add missing priority column
-- This fixes the error: "Could not find the 'priority' column of 'admin_notifications' in the schema cache"

-- Add priority column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_notifications' 
    AND column_name = 'priority'
  ) THEN
    ALTER TABLE public.admin_notifications 
    ADD COLUMN priority TEXT DEFAULT 'normal' 
    CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
    
    RAISE NOTICE 'Added priority column to admin_notifications table';
  ELSE
    RAISE NOTICE 'priority column already exists in admin_notifications table';
  END IF;
END $$;

-- Create index on priority column for performance
CREATE INDEX IF NOT EXISTS idx_admin_notifications_priority 
ON public.admin_notifications(priority);
