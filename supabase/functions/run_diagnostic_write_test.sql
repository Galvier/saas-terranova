
-- Function to run diagnostic write test
create or replace function run_diagnostic_write_test(test_id_param text)
returns jsonb as $$
DECLARE
  new_id uuid;
BEGIN
  -- First ensure table exists
  PERFORM create_diagnostic_table_if_not_exists();
  
  -- Insert a test record
  INSERT INTO diagnostic_tests (test_id, created_at)
  VALUES (test_id_param, now())
  RETURNING id INTO new_id;
  
  -- Return success with the ID
  RETURN jsonb_build_object('id', new_id);
  
  -- Note: We don't delete the record for testing purposes
  -- In a real environment, you might want to delete it after testing
END;
$$ language plpgsql security definer;
