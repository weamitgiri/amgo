<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\SubAdminController;
use App\Http\Controllers\Admin\HomeController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\CmsPageController;
use App\Http\Controllers\Admin\EmailTemplateController;
use App\Http\Controllers\Admin\PackageManagementController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\BlogCategoryController;
use App\Http\Controllers\Admin\BlogTagController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\FaqCategoryController;

use App\Http\Middleware\NoCacheMiddleware;

/**
 * Routes for admin functionalities.
 */

// Publicly accessible routes for guests
Route::group(
    ["middleware" => ["guest:admin", "throttle:100,0.2"], "as" => "admin."],
    function () {
        // Login routes
        Route::middleware('no_cache')->get("/login", [HomeController::class, "showLoginForm"])->name("showLoginForm");
        Route::post("/login", [HomeController::class, "login"])->name("login");
        Route::get('/reload-captcha', [HomeController::class, 'reloadCaptcha'])->name('reloadCaptcha');
    }
);

// Protected routes for authenticated admin users
Route::group(
    ["middleware" => ["auth:admin", "throttle:100,0.2"], "as" => "admin."],
    function () {
        Route::get('showImage/{a}/{b?}/{c?}/{d?}/{e?}', [HomeController::class, 'showImage']);
        Route::get("/", [HomeController::class, "dashboard"])->name("dashboard.home");
        Route::get("/dashboard", [HomeController::class, "dashboard"])->name("dashboard.index");
        Route::get("logout", [HomeController::class, "logout"])->name("logout");

        Route::get("profile", [HomeController::class, "profile"])->name("home.profile");
        Route::post("profile/update", [HomeController::class, "profileUpdate"])->name("home.profileUpdate");
        Route::post("password/update", [HomeController::class, "updatePassword"])->name("home.updatePassword");

        Route::post("dashboard-data", [HomeController::class, "getDashboardData"])->name("home.dashboard-data");

        Route::prefix('users-permissions')->group(function () {
            Route::resource('role', RoleController::class);
            Route::post('role/status-change', [RoleController::class, 'statusChange'])->name('role.statusChange');
            Route::get('role/getRolePermission/{id}', [RoleController::class, 'getRolePermission'])->name('getRolePermission');
            Route::post('role/rolePermissionSave', [RoleController::class, 'rolePermissionSave'])->name('rolePermissionSave');

            Route::resource('users', UsersController::class);
            Route::post('users/status-change', [UsersController::class, 'statusChange'])->name('users.statusChange');

            Route::resource('sub-admin', SubAdminController::class);
            Route::post('sub-admin/status-change', [SubAdminController::class, 'statusChange'])->name('sub-admin.statusChange');

            Route::resource('admin', AdminController::class);
            Route::post('admin/status-change', [AdminController::class, 'statusChange'])->name('admin.statusChange');
        });

        Route::get("settings", [SettingController::class, "index"])->name("setting");
        Route::post("settings/updateSettings", [SettingController::class, "siteSettingUpdate"])->name("settings.updateSettings");
        Route::post("settings/linkupdateSettings", [SettingController::class, "linkupdateSettings"])->name("settings.linkupdateSettings");
        Route::post("settings/branding", [SettingController::class, "brandingUpdate"])->name("settings.brandingUpdate");
        Route::post("settings/email", [SettingController::class, "emailUpdate"])->name("settings.emailUpdate");
        Route::post("settings/otp", [SettingController::class, "otpUpdate"])->name("settings.otpUpdate");
        Route::post("settings/payment", [SettingController::class, "paymentUpdate"])->name("settings.paymentUpdate");

        // CMS Pages Management
        Route::prefix('cms')->group(function () {
            Route::resource('pages', CmsPageController::class)->names('cms');
            Route::post('pages/toggle-status', [CmsPageController::class, 'toggleStatus'])->name('cms.toggleStatus');
            Route::get('pages/{id}/preview', [CmsPageController::class, 'preview'])->name('cms.preview');
            Route::post('upload-media', [CmsPageController::class, 'uploadMedia'])->name('cms.upload');
        });

        // Email Templates Management
        Route::prefix('email-templates')->group(function () {
            Route::resource('templates', EmailTemplateController::class)->names('email-templates');
            Route::post('templates/toggle-status', [EmailTemplateController::class, 'toggleStatus'])->name('email-templates.toggleStatus');
        });

        // Blog Management
        Route::resource('blogs', BlogController::class)->names('blogs');
        Route::post('blogs/toggle-featured', [BlogController::class, 'toggleFeatured'])->name('blogs.toggleFeatured');
        Route::post('blogs/{blog}/publish', [BlogController::class, 'publish'])->name('blogs.publish');
        Route::post('blogs/{blog}/archive', [BlogController::class, 'archive'])->name('blogs.archive');
        Route::post('blogs/{blog}/clone', [BlogController::class, 'clone'])->name('blogs.clone');

        // Blog Categories Management
        Route::resource('blog-categories', BlogCategoryController::class)->names('blog-categories');
        Route::post('blog-categories/toggle-status', [BlogCategoryController::class, 'toggleStatus'])->name('blog-categories.toggleStatus');

        // Blog Tags Management
        Route::resource('blog-tags', BlogTagController::class)->names('blog-tags');
        Route::post('blog-tags/toggle-status', [BlogTagController::class, 'toggleStatus'])->name('blog-tags.toggleStatus');

        // FAQ Management
        Route::resource('faqs', FaqController::class)->names('faqs');
        Route::post('faqs/toggle-featured', [FaqController::class, 'toggleFeatured'])->name('faqs.toggleFeatured');
        Route::post('faqs/toggle-status', [FaqController::class, 'toggleStatus'])->name('faqs.toggleStatus');

        // FAQ Categories Management
        Route::resource('faq-categories', FaqCategoryController::class)->names('faq-categories');
        Route::post('faq-categories/toggle-status', [FaqCategoryController::class, 'toggleStatus'])->name('faq-categories.toggleStatus');

        Route::prefix('package-management')->group(function () {
            Route::resource('packages', PackageManagementController::class)->names('packages');
            Route::post('packages/bulk-action', [PackageManagementController::class, 'bulkAction'])->name('packages.bulkAction');
            Route::post('packages/reorder-features', [PackageManagementController::class, 'reorderFeatures'])->name('packages.reorderFeatures');
        });

        // Node API Logs viewer (apis/logs/*.log)
        Route::get('api-logs', [\App\Http\Controllers\Admin\ApiLogController::class, 'index'])->name('api-logs.index');
        Route::post('api-logs/clear', [\App\Http\Controllers\Admin\ApiLogController::class, 'clear'])->name('api-logs.clear');

// Activity & Game Management
        Route::prefix('activities')->group(function () {
            Route::resource('/', \App\Http\Controllers\Admin\ActivityController::class)->names('activities')->parameters(['' => 'activity']);
            Route::post('/toggle-status', [\App\Http\Controllers\Admin\ActivityController::class, 'toggleStatus'])->name('activities.toggleStatus');
            Route::get('/{activity}/games-json', [\App\Http\Controllers\Admin\ActivityController::class, 'getGames'])->name('activities.getGames');
            
            Route::prefix('{activity}/games')->group(function () {
                Route::get('/get-role-form', [\App\Http\Controllers\Admin\ActivityGameController::class, 'getRoleForm'])->name('activity-games.get-role-form');
                Route::post('/{game}/clone', [\App\Http\Controllers\Admin\ActivityGameController::class, 'clone'])->name('activity-games.clone');
                Route::resource('/', \App\Http\Controllers\Admin\ActivityGameController::class)->names('activity-games')->parameters(['' => 'game']);
                Route::post('/toggle-status', [\App\Http\Controllers\Admin\ActivityGameController::class, 'toggleStatus'])->name('activity-games.toggleStatus');
            });
        });

        // Organizer Management
        Route::prefix('organizers')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\OrganizerController::class, 'index'])->name('organizers.index');
            Route::get('/create', [\App\Http\Controllers\Admin\OrganizerController::class, 'create'])->name('organizers.create');
            Route::post('/', [\App\Http\Controllers\Admin\OrganizerController::class, 'store'])->name('organizers.store');
            Route::get('/{organizer}', [\App\Http\Controllers\Admin\OrganizerController::class, 'show'])->name('organizers.show');
            Route::get('/{organizer}/edit', [\App\Http\Controllers\Admin\OrganizerController::class, 'edit'])->name('organizers.edit');
            Route::put('/{organizer}', [\App\Http\Controllers\Admin\OrganizerController::class, 'update'])->name('organizers.update');
            Route::delete('/{organizer}', [\App\Http\Controllers\Admin\OrganizerController::class, 'destroy'])->name('organizers.destroy');
            Route::post('/toggle-status', [\App\Http\Controllers\Admin\OrganizerController::class, 'toggleStatus'])->name('organizers.toggleStatus');
            Route::get('/get-packages/{gameId}', [\App\Http\Controllers\Admin\OrganizerController::class, 'getPackages'])->name('organizers.getPackages');
        });

        Route::post("settings/SeoupdateSettings", [SettingController::class, "SeoupdateSettings"])->name("settings.SeoupdateSettings");
    }
);
