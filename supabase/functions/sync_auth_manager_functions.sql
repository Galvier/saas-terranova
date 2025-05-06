
-- Função para sincronizar dados do auth.user para a tabela managers
CREATE OR REPLACE FUNCTION public.sync_auth_user_to_manager()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  manager_exists BOOLEAN;
BEGIN
  -- Verificar se já existe um gestor com este email
  SELECT EXISTS (
    SELECT 1 FROM public.managers WHERE email = NEW.email
  ) INTO manager_exists;
  
  -- Se existir, atualizar o user_id no gestor
  IF manager_exists THEN
    UPDATE public.managers
    SET user_id = NEW.id,
        updated_at = NOW()
    WHERE email = NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para executar a função sync_auth_user_to_manager quando um usuário for criado no auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_auth_user_to_manager();

-- Função para sincronizar dados do managers para auth.users
CREATE OR REPLACE FUNCTION public.sync_manager_to_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  user_exists BOOLEAN;
BEGIN
  -- Verificar se já existe um usuário com este email
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = NEW.email
  ) INTO user_exists;
  
  IF user_exists THEN
    -- Se existir, obter o ID do usuário
    SELECT id INTO user_id FROM auth.users WHERE email = NEW.email LIMIT 1;
    
    -- Atualizar o user_id do gestor
    NEW.user_id := user_id;
    
    -- Atualizar metadados do usuário se necessário
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object(
      'role', NEW.role,
      'department_id', NEW.department_id,
      'display_name', NEW.name
    )
    WHERE id = user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para executar a função sync_manager_to_auth_user quando um gerente for criado ou atualizado
DROP TRIGGER IF EXISTS on_manager_updated ON public.managers;
CREATE TRIGGER on_manager_updated
  BEFORE INSERT OR UPDATE ON public.managers
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_manager_to_auth_user();
