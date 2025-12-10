-- Add RLS policy for business owners to view and manage their claimed contractors
-- This allows users to see contractors where claimed_by = their user ID

-- Policy for owners to view their claimed contractors
CREATE POLICY "Owners can view their claimed contractors"
ON contractors
FOR SELECT
TO public
USING (claimed_by = auth.uid() AND is_claimed = true);

-- Policy for owners to update their claimed contractors
CREATE POLICY "Owners can update their claimed contractors"
ON contractors
FOR UPDATE
TO public
USING (claimed_by = auth.uid() AND is_claimed = true)
WITH CHECK (claimed_by = auth.uid() AND is_claimed = true);

