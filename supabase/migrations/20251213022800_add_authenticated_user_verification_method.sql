-- Add 'authenticated_user' as a valid verification method for business claims
-- This is used when a logged-in user submits a claim (bypasses email verification)

ALTER TABLE business_claims 
DROP CONSTRAINT business_claims_verification_method_check;

ALTER TABLE business_claims 
ADD CONSTRAINT business_claims_verification_method_check 
CHECK (verification_method = ANY (ARRAY['email_match'::text, 'admin_approval'::text, 'authenticated_user'::text]));

