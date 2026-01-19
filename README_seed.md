# Database Seeding Instructions

## Admin User Seeding

To seed an admin user into the database:

1. **Using the SQL script:**
   ```bash
   psql "postgresql://neondb_owner:rR@ep-lingering-river-a4hkkqsf-pooler.us-east-1.aws.neon.tech/nel_binding=require" -f seed_admin.sql
   ```

2. **Default credentials:**
   - Email: `admin@punchinout.com`
   - Password: `admin123`

3. **Security Note:**
   - Change the default password after first login
   - Update the email to your actual admin email
   - The password hash is generated using bcrypt

4. **To generate a new password hash:**
   ```javascript
   const bcrypt = require('bcrypt');
   const password = 'your-new-password';
   const hash = bcrypt.hashSync(password, 12);
   console.log(hash);
   ```

## Admin Roles
- `SUPER_ADMIN`: Full system access
- `ADMIN`: Limited administrative access
