-- Local development seed data ONLY. Never run against production.
-- Creates two staff accounts: admin@safevoice.local / worker@safevoice.local
-- Password for both: password123

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'admin@safevoice.local',
    crypt('password123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'worker@safevoice.local',
    crypt('password123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES
  (
    gen_random_uuid(), '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '{"sub":"00000000-0000-0000-0000-000000000001","email":"admin@safevoice.local","email_verified":true}',
    'email', now(), now(), now()
  ),
  (
    gen_random_uuid(), '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    '{"sub":"00000000-0000-0000-0000-000000000002","email":"worker@safevoice.local","email_verified":true}',
    'email', now(), now(), now()
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.users (id, email, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@safevoice.local', 'Local Admin', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'worker@safevoice.local', 'Local Caseworker', 'caseworker')
ON CONFLICT (id) DO NOTHING;
