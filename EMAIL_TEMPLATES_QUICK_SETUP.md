# Email Templates Manager - Quick Setup Guide

## Installation Steps

### Step 1: Run Database Migration
```bash
php artisan migrate
```
This creates the `email_templates` table with all necessary columns and indexes.

### Step 2: Seed Default Templates
```bash
php artisan db:seed --class=EmailTemplateSeeder
```
Or seed all at once:
```bash
php artisan db:seed
```

### Step 3: Access Email Templates Manager
Navigate to admin panel:
```
http://localhost/p/admin/email-templates
```

---

## File Structure

### Core Application Files
```
app/
├── Models/EmailTemplate.php                 (Model with variable detection)
├── Http/
│   ├── Controllers/Admin/
│   │   └── EmailTemplateController.php       (CRUD + AJAX endpoints)
│   └── Requests/Admin/
│       └── StoreEmailTemplateRequest.php     (Validation rules)
└── Services/EmailTemplateService.php         (Business logic)
```

### Database Files
```
database/
├── migrations/
│   └── 2026_05_10_110001_create_email_templates_table.php
└── seeders/
    └── EmailTemplateSeeder.php
```

### View Files
```
resources/views/admin/email-templates/
├── index.blade.php        (Template listing with DataTables)
├── create.blade.php       (Create form with CKEditor)
├── edit.blade.php         (Edit form)
└── show.blade.php         (HTML preview)
```

### Configuration
```
routes/admin.php           (Email templates routes added)
database/seeders/DatabaseSeeder.php (EmailTemplateSeeder added)
```

---

## Routes Overview

### Accessible Routes
| Route | Method | Name | Purpose |
|-------|--------|------|---------|
| `/admin/email-templates` | GET | `admin.email-templates.index` | List all templates |
| `/admin/email-templates/create` | GET | `admin.email-templates.create` | Show create form |
| `/admin/email-templates` | POST | `admin.email-templates.store` | Save new template |
| `/admin/email-templates/{id}` | GET | `admin.email-templates.show` | Preview template |
| `/admin/email-templates/{id}/edit` | GET | `admin.email-templates.edit` | Show edit form |
| `/admin/email-templates/{id}` | PUT | `admin.email-templates.update` | Update template |
| `/admin/email-templates/{id}` | DELETE | `admin.email-templates.destroy` | Delete template |
| `/admin/email-templates/toggle-status` | POST | `admin.email-templates.toggleStatus` | Toggle active/inactive |

---

## Default Templates

The seeder creates 7 production-ready email templates:

1. **Welcome Email** - New user onboarding
2. **Email Verification** - Email verification
3. **Password Reset** - Password recovery
4. **Account Activated** - Account activation
5. **Password Changed** - Change confirmation
6. **Contact Form Reply** - Auto-reply
7. **General Notification** - Flexible notifications

All are set to **Active** by default.

---

## Common Usage Examples

### Using Template Service in Code
```php
use App\Services\EmailTemplateService;

$service = app(EmailTemplateService::class);

// Send email with variables
$result = $service->sendEmail('welcome-email', [
    'name' => 'John Doe',
    'verify_url' => 'https://example.com/verify?token=abc123'
], 'john@example.com', 'John Doe');

// Get all active templates
$templates = $service->getAllActiveTemplates();

// Preview template
$preview = $service->previewTemplate($templateId, [
    'name' => 'Sample User',
    'email' => 'sample@example.com'
]);
```

### Using in Mail Mailable Class
```php
use App\Services\EmailTemplateService;

class WelcomeEmail extends Mailable
{
    public function build()
    {
        $service = new EmailTemplateService();
        $template = $service->getTemplateBySlug('welcome-email');
        
        $parsed = $template->parseTemplate([
            'name' => $this->user->name,
            'verify_url' => $this->verifyUrl
        ]);
        
        return $this->view('emails.generic')
                    ->subject($parsed['subject'])
                    ->with(['body' => $parsed['body']]);
    }
}
```

---

## Variable System

### Variable Format
Use `{variable_name}` in subject and body. Variables are:
- **Case-sensitive**
- **Spaces not allowed**
- **Only alphanumeric + underscore**

### Common Variables
```
{name}                 - User name
{email}                - User email
{url}                  - Generic URL
{token}                - Auth token
{code}                 - Verification code
{verify_url}           - Email verification URL
{reset_url}            - Password reset URL
{app_name}             - Application name
{ticket_number}        - Support ticket
{notification_title}   - Notification title
{action_url}           - CTA button URL
```

---

## Admin Panel Features

### Dashboard View
- **Search**: By template name, slug, or subject
- **Filter**: By active/inactive status
- **Sort**: By any column
- **Toggle**: One-click activate/deactivate
- **Actions**: Edit, View (preview), Delete

### Create Template
1. Select template name (or enter custom)
2. Enter email subject (with {variables})
3. Create HTML body (CKEditor)
4. Add description (optional)
5. Set status (Active/Inactive)
6. Variables auto-detected and displayed

### Edit Template
- Modify any field
- Variables shown in info box
- View usage statistics
- See creator and timestamps

### Preview Template
- HTML preview (how email will look)
- Subject display
- Variables list
- Status and metadata

---

## Template Content Best Practices

### Subject Line
```
✅ GOOD: "Welcome to {app_name}, {name}!"
❌ BAD: "Welcome to $app_name, $name!"
```

### HTML Structure
```html
<h2>Hello {name},</h2>
<p>Your verification code is: <strong>{code}</strong></p>
<p><a href="{verify_url}" style="...">Verify Email</a></p>
```

### Variable Hints
```
For user data: {name}, {email}, {username}
For URLs: {verify_url}, {reset_url}, {login_url}
For codes: {code}, {verification_code}, {token}
For notifications: {notification_title}, {action_text}
```

---

## Troubleshooting

### Templates Not Showing
- Ensure migration has run: `php artisan migrate`
- Verify seeder was run: `php artisan db:seed`
- Check user has admin role

### Variables Not Detected
- Use `{variable}` format exactly
- No spaces: `{my_var}` not `{my var}`
- Only alphanumeric + underscore

### Email Not Sending
- Template must be Active (status = 1)
- All variables must be provided
- Mail service must be configured

### Permission Denied
- User must be admin (usertype: 0, 1, or 2)
- Check admin authentication

---

## Performance Tips

1. **Caching**: Cache active templates
2. **Lazy Loading**: Don't load body in listings
3. **Archiving**: Archive unused templates
4. **Indexing**: Already indexed on slug and status

---

## Database Queries

### Find Template by Slug
```php
EmailTemplate::where('slug', 'welcome-email')->active()->first();
```

### Get All Active Templates
```php
EmailTemplate::where('status', 1)->orderBy('name')->get();
```

### Get Most Used Templates
```php
EmailTemplate::orderBy('usage_count', 'desc')->limit(10)->get();
```

### Find Unused Templates
```php
EmailTemplate::where('usage_count', 0)->get();
```

---

## Security Notes

✅ All operations require admin authentication
✅ IDs are encrypted in forms
✅ CSRF tokens on all forms
✅ User attribution tracked
✅ Soft deletes for safety
✅ Input validation enforced

---

## Module Statistics

### Files Created
- 1 Migration file
- 1 Model file
- 1 Controller file
- 1 Request validation file
- 1 Service class file
- 1 Seeder file
- 4 Blade templates
- 2 Documentation files

### Database
- 1 new table: `email_templates`
- 13 columns
- 3 indexes
- 7 default templates

### Routes
- 8 new routes
- All prefixed with `/admin/email-templates`
- AJAX endpoint for status toggle

---

## Next Steps

1. ✅ Run migrations: `php artisan migrate`
2. ✅ Seed templates: `php artisan db:seed`
3. ✅ Access admin panel: `http://localhost/p/admin/email-templates`
4. ✅ Test creating/editing templates
5. ✅ Use EmailTemplateService in code
6. ✅ Monitor usage statistics

---

## Support & Documentation

- **Full Documentation**: `EMAIL_TEMPLATES_DOCUMENTATION.md`
- **Implementation Details**: `EMAIL_TEMPLATES_IMPLEMENTATION.md`
- **This Guide**: Quick reference for setup and usage

---

## Module Status: ✅ READY FOR PRODUCTION

All components created, validated, and ready to deploy.

**Created**: May 10, 2026
**Version**: 1.0.0
**Status**: Production Ready
