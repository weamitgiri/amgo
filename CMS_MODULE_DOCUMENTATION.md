# CMS Module - Complete Documentation

## Overview
This is an enterprise-level Content Management System (CMS) module integrated into the admin panel. It provides a complete solution for managing dynamic content pages with SEO optimization, rich text editing, and media management.

## Module Structure

### Database
- **Migration**: `database/migrations/2026_05_10_100001_create_cms_pages_table.php`
  - Tables: `cms_pages`
  - Columns: id, page_name, slug, title, content, meta_title, meta_description, meta_keywords, featured_image, status, published_at, created_by, updated_by, created_at, updated_at, deleted_at (soft deletes)

### Models
- **CmsPage** (`app/Models/CmsPage.php`)
  - Auto-generates slug from page_name
  - Relationships: creator, updater
  - Scopes: published(), draft()
  - Methods: publish(), draft(), getStatusLabelAttribute()

### Controllers
- **CmsPageController** (`app/Http/Controllers/Admin/CmsPageController.php`)
  - RESTful resource controller
  - Methods: index, create, store, edit, update, destroy
  - AJAX endpoints: toggleStatus, preview

### Form Requests
- **StoreCmsPageRequest** (`app/Http/Requests/Admin/StoreCmsPageRequest.php`)
  - Validates all CMS page fields
  - Rules for unique page_name and slug
  - File upload validation

### Services
- **CmsPageService** (`app/Services/CmsPageService.php`)
  - Slug generation and uniqueness checking
  - Image upload/deletion handling
  - Frontend data preparation

### Views
- **Index** (`resources/views/admin/cms/index.blade.php`)
  - DataTables AJAX listing
  - Status toggle via AJAX
  - Search and filter functionality
  
- **Create** (`resources/views/admin/cms/create.blade.php`)
  - Form with CKEditor 4 integration
  - Image upload with preview
  - SEO fields (meta_title, meta_description, keywords)
  - Status selector (Draft/Published)
  
- **Edit** (`resources/views/admin/cms/edit.blade.php`)
  - Same as create with pre-filled data
  - Image replacement capability
  - Metadata display (creator, timestamps)
  
- **Preview** (`resources/views/admin/cms/preview.blade.php`)
  - Frontend-like page view
  - SEO information display

### Seeders
- **CmsPageSeeder** (`database/seeders/CmsPageSeeder.php`)
  - Creates 5 default CMS pages:
    1. Homepage Content
    2. Footer Content
    3. Terms & Conditions
    4. Privacy Policy
    5. Refund Policy

## Routes
All CMS routes are prefixed with `/admin/cms/` and require admin authentication:

```php
Route::resource('pages', CmsPageController::class);
Route::post('pages/toggle-status', [CmsPageController::class, 'toggleStatus'])->name('pages.toggleStatus');
Route::get('pages/{id}/preview', [CmsPageController::class, 'preview'])->name('pages.preview');
Route::post('upload-media', [CmsPageController::class, 'uploadMedia'])->name('upload-media');
```

### Route Names
- `admin.cms.index` - List all CMS pages
- `admin.cms.create` - Show create form
- `admin.cms.store` - Store new page
- `admin.cms.show` - Show single page
- `admin.cms.edit` - Show edit form
- `admin.cms.update` - Update page
- `admin.cms.destroy` - Delete page
- `admin.cms.toggleStatus` - Toggle publish status via AJAX
- `admin.cms.preview` - Preview page
- `admin.cms.upload` - CKEditor media upload

## Features

### Content Management
- ✅ Create, Read, Update, Delete (CRUD) operations
- ✅ Draft and Publish workflow
- ✅ Auto-slug generation from page name
- ✅ Rich text editor (CKEditor 4)
- ✅ Featured image upload
- ✅ Soft deletes for data recovery

### SEO Optimization
- ✅ Meta title field
- ✅ Meta description field
- ✅ Keywords field
- ✅ Slug customization

### Admin UI
- ✅ DataTables AJAX listing
- ✅ Status toggle switch
- ✅ Search and filter
- ✅ Responsive design
- ✅ Page preview before publishing

### Image Management
- ✅ Image upload during creation/editing
- ✅ Automatic image replacement
- ✅ Image preview in edit view
- ✅ Secure file storage (storage/app/public/uploads/cms/)

## Usage

### Creating a CMS Page

1. Navigate to **Admin Dashboard > CMS > Pages** (`/admin/cms/pages`)
2. Click **"Add New Page"**
3. Fill in the form:
   - Page Name (auto-generates slug)
   - Page Title
   - Content (using rich text editor)
   - Featured Image (optional)
   - SEO fields (optional)
   - Status (Draft/Published)
4. Click **"Create Page"**

### Editing a CMS Page

1. Go to **CMS Pages** list
2. Click the **Edit** button on any page
3. Modify fields as needed
4. Click **"Update Page"**

### Publishing a Page

- **Option 1**: Set status to "Published" when creating/editing
- **Option 2**: Use the toggle switch in the list view to instantly publish/unpublish

### Previewing a Page

1. Click the **"Preview"** button on the edit page
2. View how the page will appear to users

### Deleting a Page

1. In the list view, click the **"Delete"** button
2. Confirm the action
3. Page is soft-deleted (can be recovered if needed)

## Integration with Frontend

To display CMS pages on the frontend, create a public controller:

```php
// app/Http/Controllers/PageController.php
namespace App\Http\Controllers;

use App\Models\CmsPage;

class PageController extends Controller
{
    public function show($slug)
    {
        $page = CmsPage::where('slug', $slug)->published()->firstOrFail();
        return view('pages.show', compact('page'));
    }
}
```

Add route:
```php
Route::get('pages/{slug}', [PageController::class, 'show'])->name('pages.show');
```

## Database Migrations

To run the CMS migration:

```bash
php artisan migrate
```

To seed default CMS pages:

```bash
php artisan db:seed --class=CmsPageSeeder
# or seed all
php artisan db:seed
```

## File Uploads

Images are stored in: `storage/app/public/uploads/cms/`

Make sure the storage is linked:
```bash
php artisan storage:link
```

## Predefined CMS Pages

The seeder includes 5 predefined pages:

1. **Homepage Content** (slug: `homepage`)
   - Hero section, features, and overview content

2. **Footer Content** (slug: `footer`)
   - Footer information, contact details, social links

3. **Terms & Conditions** (slug: `terms-conditions`)
   - Legal terms of service

4. **Privacy Policy** (slug: `privacy-policy`)
   - Data privacy and protection policy

5. **Refund Policy** (slug: `refund-policy`)
   - Refund and return policy

## Future Enhancements

- [ ] Multi-language support
- [ ] Page versioning and revision history
- [ ] Category/tag organization
- [ ] Advanced caching strategies
- [ ] Media gallery integration
- [ ] Scheduled publishing
- [ ] Email notification on page creation
- [ ] API endpoint for frontend CMS content

## Troubleshooting

### Images not uploading
- Ensure storage is linked: `php artisan storage:link`
- Check directory permissions: `chmod -R 755 storage/`

### CKEditor not loading
- Verify CDN URL is accessible
- Check browser console for errors

### Slug conflicts
- Slugs are automatically made unique with incremental suffixes
- Example: `page-name`, `page-name-1`, `page-name-2`

## Performance Considerations

- Use page caching for published pages
- Implement Redis caching for frequently accessed pages
- Lazy load featured images
- Minify content before storage

## Security

- All CMS operations require admin authentication
- Image uploads are validated for type and size
- Content is stored with user attribution
- Soft deletes prevent accidental data loss
- XSS protection via Blade escaping by default

## Dependencies

- Laravel 11.31+
- CKEditor 4.21.0 (CDN)
- Yajra DataTables 11.0
- AdminLTE 3 (Admin template)

## Support

For issues or feature requests related to the CMS module, refer to the main project documentation or contact the development team.
