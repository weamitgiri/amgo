# Email Templates Manager - Complete Documentation

## Overview
The Email Templates Manager is an enterprise-level system for managing and administering reusable email templates. It provides a centralized way to create, manage, and send emails with dynamic variable substitution and comprehensive usage tracking.

## Module Architecture

### Database Layer
- **Migration**: `database/migrations/2026_05_10_110001_create_email_templates_table.php`
  - Table: `email_templates`
  - Tracks template creation, updates, and usage statistics

### Data Model
- **Model**: `app/Models/EmailTemplate.php`
  - Soft deletes support
  - Automatic slug generation
  - Variable detection and parsing
  - Usage tracking

### Business Logic
- **Service**: `app/Services/EmailTemplateService.php`
  - Template retrieval and management
  - Email sending with variable substitution
  - Template duplication and import/export
  - Statistics and previews

### Controller Layer
- **Controller**: `app/Http/Controllers/Admin/EmailTemplateController.php`
  - CRUD operations
  - AJAX endpoints for real-time updates
  - DataTables integration

### Validation Layer
- **Form Request**: `app/Http/Requests/Admin/StoreEmailTemplateRequest.php`
  - Comprehensive validation rules
  - Custom error messages

### View Layer (4 Blade Templates)
- **Index**: Email templates list with DataTables
- **Create**: Form for creating new templates
- **Edit**: Form for editing existing templates
- **Show**: HTML preview of email template

### Seeder
- **EmailTemplateSeeder**: Creates 7 default email templates

## Database Schema

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | varchar | Unique template name |
| slug | varchar | URL slug (auto-generated) |
| subject | varchar | Email subject with variables |
| body | longtext | HTML email body |
| variables | json | Array of detected variables |
| description | text | Template description |
| status | tinyint | 1=active, 0=inactive |
| created_by | bigint | Creator user ID (FK) |
| updated_by | bigint | Updater user ID (FK) |
| usage_count | integer | Number of times sent |
| last_used_at | timestamp | Last send timestamp |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |
| deleted_at | timestamp | Soft delete timestamp |

### Indexes
- `slug` (unique)
- `status` (for quick filtering)
- `created_by` (for user attribution)

## Features

### Template Management
✅ Create email templates with HTML editor
✅ Edit existing templates
✅ Delete templates with soft delete support
✅ Activate/deactivate templates
✅ Auto-slug generation from template name

### Variable System
✅ Auto-detection of variables from subject and body
✅ Variables in format: {variable_name}
✅ Common variables: {name}, {email}, {url}, {token}, {code}, {verification_code}, {reset_url}, {verify_url}, {login_url}, {support_url}, {notification_title}, {notification_message}, {action_text}, {action_url}, {app_name}, {ticket_number}

### Advanced Features
✅ Template preview in multiple formats
✅ Usage statistics and tracking
✅ Template duplication
✅ Import/export functionality
✅ Rich text editor (CKEditor 4)

### Admin Interface
✅ DataTables AJAX listing with search and filter
✅ One-click activate/deactivate via toggle switch
✅ Status indicators
✅ Responsive design with AdminLTE 3

## Routes

All routes are prefixed with `/admin/email-templates/` and require admin authentication:

```php
Route::resource('templates', EmailTemplateController::class)->names('email-templates');
Route::post('templates/toggle-status', [EmailTemplateController::class, 'toggleStatus'])->name('email-templates.toggleStatus');
```

### Available Routes
- `admin.email-templates.index` - List all templates
- `admin.email-templates.create` - Show create form
- `admin.email-templates.store` - Store new template
- `admin.email-templates.show` - Show/preview template
- `admin.email-templates.edit` - Show edit form
- `admin.email-templates.update` - Update template
- `admin.email-templates.destroy` - Delete template
- `admin.email-templates.toggleStatus` - Toggle status via AJAX

## Default Email Templates

### 1. Welcome Email
- **Purpose**: Sent to new users upon account creation
- **Variables**: {name}, {verify_url}
- **Subject**: "Welcome to Our Platform - {name}!"

### 2. Email Verification
- **Purpose**: Verify user email address
- **Variables**: {name}, {verification_code}
- **Subject**: "Verify Your Email Address - {verification_code}"

### 3. Password Reset
- **Purpose**: Allow users to reset their password
- **Variables**: {name}, {reset_url}, {app_name}
- **Subject**: "Password Reset Request - {app_name}"

### 4. Account Activated
- **Purpose**: Notify when admin activates a user account
- **Variables**: {name}, {email}, {username}, {login_url}
- **Subject**: "Your Account Has Been Activated - Welcome!"

### 5. Password Changed
- **Purpose**: Confirm password change to user
- **Variables**: {name}, {support_url}
- **Subject**: "Your Password Has Been Changed Successfully"

### 6. Contact Form Reply
- **Purpose**: Auto-reply to contact form submissions
- **Variables**: {name}, {ticket_number}, {subject}
- **Subject**: "We Received Your Message - {ticket_number}"

### 7. General Notification
- **Purpose**: Flexible template for system notifications
- **Variables**: {name}, {notification_title}, {notification_message}, {notification_content}, {action_url}, {action_text}
- **Subject**: "{notification_title}"

## Usage

### Creating Email Template

1. Navigate to **Admin Dashboard > Email Templates**
2. Click **"Add New Template"**
3. Fill in the form:
   - **Template Name**: Unique identifier (auto-generates slug)
   - **Subject**: Email subject with variables in {brackets}
   - **Body**: HTML email content with rich text editor
   - **Description**: Brief description
   - **Status**: Active/Inactive
4. Variables are auto-detected from subject and body
5. Click **"Create Template"**

### Editing Template

1. Go to **Email Templates** list
2. Click **"Edit"** button
3. Modify template details
4. Variables display in info box
5. Click **"Update Template"**

### Using Templates in Code

```php
use App\Services\EmailTemplateService;

// Get service instance
$emailService = new EmailTemplateService();

// Send email using template
$result = $emailService->sendEmail('welcome-email', [
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'verify_url' => url('/verify?token=abc123')
], 'john@example.com', 'John Doe');

// Preview template
$preview = $emailService->previewTemplate($templateId, [
    'name' => 'Sample Name',
    'email' => 'sample@example.com'
]);

// Get all active templates
$templates = $emailService->getAllActiveTemplates();

// Duplicate template
$newTemplate = $emailService->duplicateTemplate($templateId, 'Welcome Email (Copy)');

// Export template
$exportData = $emailService->exportTemplate($templateId);

// Import template
$imported = $emailService->importTemplate($templateData);
```

## Variable System

### Variable Format
- Use `{variable_name}` format in subject and body
- Variables are case-sensitive
- Spaces in variable names are not supported

### Common Variables
```
{name}                    - User full name
{email}                   - User email address
{username}                - User username
{url}                     - Generic URL
{token}                   - Authentication token
{code}                    - Generic code (OTP, verification, etc.)
{verification_code}       - Email verification code
{reset_url}              - Password reset URL
{verify_url}             - Email verification URL
{login_url}              - Login page URL
{support_url}            - Support/contact page URL
{app_name}               - Application name
{ticket_number}          - Support ticket number
{subject}                - Subject line (for replies)
{notification_title}     - Title of notification
{notification_message}   - Message content
{notification_content}   - Extended content
{action_text}            - CTA button text
{action_url}             - CTA button URL
```

## Template Preview

Click the **"Preview"** button in edit view to see:
- Email subject
- Email body as it will appear
- Detected variables
- Template metadata (creation date, usage count, etc.)
- Status indicator

## Usage Statistics

Each template tracks:
- **Usage Count**: Total number of times sent
- **Last Used At**: Most recent send timestamp
- **Created At**: Template creation date
- **Updated At**: Last modification date

## File Structure

```
app/
├── Models/
│   └── EmailTemplate.php
├── Http/
│   ├── Controllers/Admin/
│   │   └── EmailTemplateController.php
│   └── Requests/Admin/
│       └── StoreEmailTemplateRequest.php
└── Services/
    └── EmailTemplateService.php

resources/views/admin/email-templates/
├── index.blade.php
├── create.blade.php
├── edit.blade.php
└── show.blade.php

database/
├── migrations/
│   └── 2026_05_10_110001_create_email_templates_table.php
└── seeders/
    └── EmailTemplateSeeder.php
```

## Integration Points

### With Existing Admin System
✅ Uses admin authentication (auth:admin middleware)
✅ Follows admin naming conventions
✅ Inherits dashboard layout
✅ Uses AdminLTE 3 UI
✅ Integrates with alert_message component

### With Laravel Features
✅ Soft deletes for data recovery
✅ Timestamps (created_at, updated_at)
✅ User relationships for attribution
✅ Form request validation
✅ Resource routes

## Setup Instructions

### 1. Run Migration
```bash
php artisan migrate
```

### 2. Seed Default Templates
```bash
php artisan db:seed --class=EmailTemplateSeeder
# or seed all
php artisan db:seed
```

### 3. Access Email Templates Manager
Navigate to: `http://localhost/p/admin/email-templates`

## Advanced Usage

### Custom Template Service Implementation
```php
// Example: Send welcome email to new user
$templateService = app(EmailTemplateService::class);

try {
    $result = $templateService->sendEmail('welcome-email', [
        'name' => auth()->user()->name,
        'email' => auth()->user()->email,
        'verify_url' => route('email.verify', ['token' => auth()->user()->verification_token])
    ], auth()->user()->email);
    
    // Log successful send
    Log::info('Welcome email sent', ['user_id' => auth()->id()]);
} catch (Exception $e) {
    Log::error('Failed to send welcome email', ['error' => $e->getMessage()]);
}
```

### Template Duplication
```php
$service = new EmailTemplateService();
$newTemplate = $service->duplicateTemplate($originalId, 'New Template Name');
```

### Export/Import Templates
```php
$service = new EmailTemplateService();

// Export
$data = $service->exportTemplate($templateId);
file_put_contents('template_export.json', json_encode($data, JSON_PRETTY_PRINT));

// Import
$importedData = json_decode(file_get_contents('template_export.json'), true);
$newTemplate = $service->importTemplate($importedData);
```

## Performance Considerations

- Use caching for frequently accessed templates
- Index templates by status for quick filtering
- Lazy load template body in listings
- Archive old/unused templates periodically

## Security

✅ All operations require admin authentication
✅ User attribution tracking (created_by, updated_by)
✅ Soft deletes prevent accidental data loss
✅ XSS protection via Blade escaping
✅ CSRF protection on form submissions
✅ Validation on all inputs

## Troubleshooting

### Variables Not Detected
- Ensure variables follow format: `{variable_name}`
- No spaces around variable name
- Only alphanumeric characters and underscores in variable names

### Template Not Sending
- Verify template is active (status = 1)
- Check all required variables are provided
- Verify mail service is configured

### Permissions Issues
- Ensure user has admin role
- Check MenuPermission table entries

## Future Enhancements

- [ ] Email template versioning
- [ ] Template testing (send to test email)
- [ ] A/B testing for email variants
- [ ] Template scheduling
- [ ] Advanced variable types (conditionals, loops)
- [ ] Template analytics dashboard
- [ ] Multi-language template support
- [ ] Dynamic template blocks/sections
- [ ] Template preview with real data
- [ ] Email log integration

## Support

For issues or feature requests related to the Email Templates Manager, contact the development team.

## Compatibility

- Laravel 11.31+
- PHP 8.1+
- MySQL 5.7+
- AdminLTE 3
- CKEditor 4
- Yajra DataTables 11.0

---

**Module Status**: Production Ready ✅
**Last Updated**: May 10, 2026
**Version**: 1.0.0
