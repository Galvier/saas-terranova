
-- Function to create a manager
create or replace function create_manager(
  manager_name text,
  manager_email text,
  manager_department_id uuid,
  manager_is_active boolean,
  manager_password text default null,
  manager_role text default 'manager'
)
returns jsonb as $$
DECLARE
  new_manager_id uuid;
  user_id uuid;
  user_exists boolean;
BEGIN
  -- Verificar se já existe um usuário com este email
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = manager_email
  ) INTO user_exists;
  
  -- Se existir, obter o ID do usuário
  IF user_exists THEN
    SELECT id INTO user_id FROM auth.users WHERE email = manager_email;
  END IF;
  
  -- Primeiro: Inserir o manager na tabela
  INSERT INTO managers (
    name, 
    email,
    department_id,
    is_active,
    role,
    user_id
  )
  VALUES (
    manager_name, 
    manager_email,
    manager_department_id,
    manager_is_active,
    manager_role,
    user_id
  )
  RETURNING id INTO new_manager_id;
  
  -- Log da criação do manager
  INSERT INTO logs (level, message, details) 
  VALUES (
    'info', 
    'Manager created successfully', 
    jsonb_build_object(
      'manager_id', new_manager_id,
      'email', manager_email,
      'role', manager_role,
      'had_existing_auth_user', user_exists,
      'timestamp', now()
    )
  );
  
  -- Retornar informações sobre a criação
  RETURN jsonb_build_object(
    'id', new_manager_id,
    'user_created', NOT user_exists AND manager_password IS NOT NULL,
    'message', 'Manager created successfully'
  );
END;
$$ language plpgsql security definer;
