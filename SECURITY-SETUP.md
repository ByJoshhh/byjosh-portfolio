# Puesta en marcha de seguridad

## Supabase de pruebas

1. En el SQL Editor del proyecto de pruebas, ejecuta el archivo completo `supabase-schema.sql`. Las tablas públicas quedan en lectura pública donde hace falta; los cambios del CMS requieren una sesión autorizada.
2. En Supabase Auth, crea una cuenta con correo y contraseña para el administrador. No habilites el registro público para este panel.
3. Autoriza esa cuenta desde SQL Editor, sustituyendo el correo:

   ```sql
   INSERT INTO public.admin_users (user_id)
   SELECT id FROM auth.users WHERE email = 'admin@example.com'
   ON CONFLICT (user_id) DO NOTHING;
   ```

4. Copia `.env.example` a `.env.local` para desarrollo y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`. En producción configura esas variables en el entorno de build. Sin ellas, la web no se conectará a ninguna base de datos. La clave publishable/anon es visible por diseño; nunca pongas una clave `service_role` o `secret` en variables `VITE_*`.
5. Entra al panel desde `?admin` con el correo y la contraseña creados. Una cuenta de Auth sin fila en `public.admin_users` no obtiene permisos del CMS.

## Cambios de seguridad

- Las tablas de proyectos, categorías y precios permiten lectura pública, pero las escrituras requieren `public.is_admin()`.
- Las reseñas públicas solo pueden insertarse llamando a `public.submit_review`. La función valida los campos, verifica el token y lo consume junto con la inserción dentro de una transacción. La reseña queda `pending` hasta que un administrador la aprueba.
- La tabla de tokens no es legible ni modificable por visitantes. La consulta pública de un enlace devuelve solo si es válido y el servicio asociado.
- Las imágenes siguen siendo públicas para mostrar el portafolio; cargar, actualizar o borrar objetos requiere una cuenta autorizada.
- Los tokens generados antes de este cambio no tienen `secure_version = true` y dejan de validarse. Genera y comparte enlaces nuevos.
- Revisa manualmente las reseñas ya existentes antes de pasar el esquema a producción: la migración conserva las que ya estaban aprobadas porque no puede distinguir las legítimas de las creadas mientras las políticas estaban abiertas.

## Al pasar a producción

Primero aplica y comprueba el esquema en pruebas; después repite la configuración con el proyecto de producción y autoriza ahí la cuenta correcta. No copies datos de usuario ni claves de servicio desde el navegador. No he aplicado cambios remotos desde esta carpeta.
