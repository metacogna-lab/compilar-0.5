-- Create RPC function for atomic assessment answer updates
-- This prevents race conditions when submitting concurrent answers

CREATE OR REPLACE FUNCTION update_assessment_response(
  assessment_id UUID,
  question_id TEXT,
  answer_data JSONB
)
RETURNS VOID AS $$
BEGIN
  UPDATE assessment_sessions
  SET
    responses = COALESCE(responses, '{}'::jsonb) || jsonb_build_object(question_id, answer_data),
    updated_at = NOW()
  WHERE id = assessment_id;

  -- Raise exception if assessment not found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assessment session % not found', assessment_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_assessment_response(UUID, TEXT, JSONB) TO authenticated;

-- Add comment
COMMENT ON FUNCTION update_assessment_response IS
  'Atomically updates assessment responses JSONB field to prevent race conditions during concurrent answer submissions';
