-- =============================================
-- ADMIN CREDIT MANAGEMENT FUNCTIONS
-- Run this in Supabase SQL Editor
-- =============================================

-- IMPORTANT: Disable RLS on user_credits first to ensure functions work
ALTER TABLE user_credits DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions DISABLE ROW LEVEL SECURITY;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS admin_add_credits(UUID, INTEGER, TEXT);
DROP FUNCTION IF EXISTS admin_deduct_credits(UUID, INTEGER, TEXT);
DROP FUNCTION IF EXISTS admin_set_credits(UUID, INTEGER, TEXT);

-- Function to add credits (admin only)
CREATE OR REPLACE FUNCTION admin_add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT 'Admin credit grant'
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get or create current balance
  SELECT credits_balance INTO v_current_balance 
  FROM user_credits WHERE user_id = p_user_id;
  
  IF v_current_balance IS NULL THEN
    v_current_balance := 0;
    INSERT INTO user_credits (user_id, credits_balance, total_credits, used_credits, plan_type)
    VALUES (p_user_id, 0, 0, 0, 'free');
  END IF;
  
  v_new_balance := v_current_balance + p_amount;
  
  -- Update credits - update ALL relevant fields
  UPDATE user_credits 
  SET credits_balance = v_new_balance, 
      total_credits = GREATEST(total_credits, v_new_balance),
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Log transaction
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, p_amount, 'admin_grant', p_reason);
  
  RETURN json_build_object(
    'success', true, 
    'new_balance', v_new_balance,
    'added', p_amount
  );
END;
$$ LANGUAGE plpgsql;

-- Function to deduct credits (admin only)
CREATE OR REPLACE FUNCTION admin_deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT 'Admin credit deduction'
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT credits_balance INTO v_current_balance 
  FROM user_credits WHERE user_id = p_user_id;
  
  IF v_current_balance IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User has no credits record');
  END IF;
  
  v_new_balance := GREATEST(0, v_current_balance - p_amount);
  
  -- Update credits - update ALL relevant fields
  UPDATE user_credits 
  SET credits_balance = v_new_balance, 
      used_credits = used_credits + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Log transaction
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, p_amount, 'deduction', p_reason);
  
  RETURN json_build_object(
    'success', true, 
    'new_balance', v_new_balance,
    'deducted', p_amount
  );
END;
$$ LANGUAGE plpgsql;

-- Function to set credits to specific amount (admin only)
CREATE OR REPLACE FUNCTION admin_set_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT 'Admin credit adjustment'
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_diff INTEGER;
BEGIN
  -- Get current balance
  SELECT credits_balance INTO v_current_balance 
  FROM user_credits WHERE user_id = p_user_id;
  
  IF v_current_balance IS NULL THEN
    -- Create new record
    INSERT INTO user_credits (user_id, credits_balance, total_credits, used_credits, plan_type)
    VALUES (p_user_id, p_amount, p_amount, 0, 'free');
    v_diff := p_amount;
  ELSE
    v_diff := p_amount - v_current_balance;
    UPDATE user_credits 
    SET credits_balance = p_amount,
        total_credits = GREATEST(total_credits, p_amount),
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Log transaction
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, ABS(v_diff), 
    CASE WHEN v_diff >= 0 THEN 'admin_grant' ELSE 'deduction' END,
    p_reason || ' (set to ' || p_amount || ')');
  
  RETURN json_build_object(
    'success', true, 
    'new_balance', p_amount,
    'previous_balance', COALESCE(v_current_balance, 0)
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION admin_add_credits TO authenticated;
GRANT EXECUTE ON FUNCTION admin_add_credits TO anon;
GRANT EXECUTE ON FUNCTION admin_deduct_credits TO authenticated;
GRANT EXECUTE ON FUNCTION admin_deduct_credits TO anon;
GRANT EXECUTE ON FUNCTION admin_set_credits TO authenticated;
GRANT EXECUTE ON FUNCTION admin_set_credits TO anon;

-- Grant table permissions (important!)
GRANT ALL ON user_credits TO authenticated;
GRANT ALL ON user_credits TO anon;
GRANT ALL ON credit_transactions TO authenticated;
GRANT ALL ON credit_transactions TO anon;

-- Verify functions exist
SELECT 'Functions created:' as info;
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE 'admin_%credits';

-- Show current user_credits data
SELECT 'Current user_credits:' as info;
SELECT user_id, credits_balance, total_credits, used_credits, updated_at 
FROM user_credits LIMIT 5;

SELECT '✅ Admin credit functions created and RLS disabled!' as status;
