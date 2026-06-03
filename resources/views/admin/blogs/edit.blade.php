@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1 class="m-0">Edit Blog</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.blogs.index') }}">Blogs</a></li>
                        <li class="breadcrumb-item active">Edit</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <div class="content">
        <div class="container-fluid">
            @include('admin.alert_message')

            <form action="{{ route('admin.blogs.update', $blog->id) }}" method="POST" enctype="multipart/form-data">
                @csrf
                @method('PUT')

                <!-- Basic Information -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Basic Information</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="form-group">
                                    <label for="title">Blog Title *</label>
                                    <input type="text" class="form-control @error('title') is-invalid @enderror"
                                           id="title" name="title" value="{{ old('title', $blog->title) }}" required>
                                    @error('title')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <label for="slug">Slug *</label>
                                    <input type="text" class="form-control @error('slug') is-invalid @enderror"
                                           id="slug" name="slug" value="{{ old('slug', $blog->slug) }}" required>
                                    @error('slug')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="short_description">Short Description *</label>
                            <textarea class="form-control @error('short_description') is-invalid @enderror"
                                      id="short_description" name="short_description" rows="3" required>{{ old('short_description', $blog->short_description) }}</textarea>
                            @error('short_description')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="category_id">Category *</label>
                                    <select class="form-control @error('category_id') is-invalid @enderror"
                                            id="category_id" name="category_id" required>
                                        <option value="">Select Category</option>
                                        @foreach($categories as $category)
                                            <option value="{{ $category->id }}" {{ old('category_id', $blog->category_id) == $category->id ? 'selected' : '' }}>
                                                {{ $category->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('category_id')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="author_id">Author *</label>
                                    <select class="form-control @error('author_id') is-invalid @enderror"
                                            id="author_id" name="author_id" required>
                                        <option value="">Select Author</option>
                                        @foreach($authors as $author)
                                            <option value="{{ $author->id }}" {{ old('author_id', $blog->author_id) == $author->id ? 'selected' : '' }}>
                                                {{ $author->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('author_id')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="featured_image">Featured Image *</label>
                                    <input type="file" class="form-control @error('featured_image') is-invalid @enderror"
                                           id="featured_image" name="featured_image" accept="image/*">
                                    @error('featured_image')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                    <small class="form-text text-muted">Leave empty to keep current image. Max 5MB, JPEG/PNG/WebP</small>
                                    @if($blog->featured_image)
                                        <div class="mt-2">
                                            <img src="{{ asset('storage/' . $blog->featured_image) }}" alt="Current Featured Image" class="img-thumbnail" style="max-width: 200px;">
                                        </div>
                                    @endif
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="banner_image">Banner Image</label>
                                    <input type="file" class="form-control @error('banner_image') is-invalid @enderror"
                                           id="banner_image" name="banner_image" accept="image/*">
                                    @error('banner_image')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                    <small class="form-text text-muted">Leave empty to keep current image. Max 5MB, JPEG/PNG/WebP</small>
                                    @if($blog->banner_image)
                                        <div class="mt-2">
                                            <img src="{{ asset('storage/' . $blog->banner_image) }}" alt="Current Banner Image" class="img-thumbnail" style="max-width: 200px;">
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="tags">Tags</label>
                                    <select class="form-control select2 @error('tags') is-invalid @enderror"
                                            id="tags" name="tags[]" multiple>
                                        @foreach($tags as $tag)
                                            <option value="{{ $tag->id }}" {{ in_array($tag->id, old('tags', $blog->tags->pluck('id')->toArray())) ? 'selected' : '' }}>
                                                {{ $tag->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('tags')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="reading_time">Reading Time (minutes)</label>
                                    <input type="number" class="form-control @error('reading_time') is-invalid @enderror"
                                           id="reading_time" name="reading_time" value="{{ old('reading_time', $blog->reading_time) }}" min="1">
                                    @error('reading_time')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="is_featured" name="is_featured" value="1" {{ old('is_featured', $blog->is_featured) ? 'checked' : '' }}>
                            <label class="form-check-label" for="is_featured">Featured Blog</label>
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Blog Content</h3>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label for="content">Full Content *</label>
                            <textarea class="form-control @error('content') is-invalid @enderror"
                                      id="content" name="content" rows="10" required>{{ old('content', $blog->content) }}</textarea>
                            @error('content')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- SEO Settings -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">SEO Settings</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="seo_title">SEO Title</label>
                                    <input type="text" class="form-control @error('seo_title') is-invalid @enderror"
                                           id="seo_title" name="seo_title" value="{{ old('seo_title', $blog->seo_title) }}" maxlength="60">
                                    <small class="form-text text-muted">60 characters max</small>
                                    @error('seo_title')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="og_image">OG Image</label>
                                    <input type="file" class="form-control @error('og_image') is-invalid @enderror"
                                           id="og_image" name="og_image" accept="image/*">
                                    @error('og_image')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                    <small class="form-text text-muted">Leave empty to keep current image. Max 5MB, JPEG/PNG/WebP</small>
                                    @if($blog->og_image)
                                        <div class="mt-2">
                                            <img src="{{ asset('storage/' . $blog->og_image) }}" alt="Current OG Image" class="img-thumbnail" style="max-width: 200px;">
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="seo_description">SEO Description</label>
                            <textarea class="form-control @error('seo_description') is-invalid @enderror"
                                      id="seo_description" name="seo_description" rows="3" maxlength="160">{{ old('seo_description', $blog->seo_description) }}</textarea>
                            <small class="form-text text-muted">160 characters max</small>
                            @error('seo_description')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label for="seo_keywords">SEO Keywords</label>
                            <input type="text" class="form-control @error('seo_keywords') is-invalid @enderror"
                                   id="seo_keywords" name="seo_keywords" value="{{ old('seo_keywords', $blog->seo_keywords) }}" maxlength="255">
                            <small class="form-text text-muted">Comma separated keywords</small>
                            @error('seo_keywords')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label for="canonical_url">Canonical URL</label>
                            <input type="url" class="form-control @error('canonical_url') is-invalid @enderror"
                                   id="canonical_url" name="canonical_url" value="{{ old('canonical_url', $blog->canonical_url) }}">
                            @error('canonical_url')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- Publish Settings -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Publish Settings</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="status">Status *</label>
                                    <select class="form-control @error('status') is-invalid @enderror"
                                            id="status" name="status" required>
                                        <option value="draft" {{ old('status', $blog->status) == 'draft' ? 'selected' : '' }}>Draft</option>
                                        <option value="published" {{ old('status', $blog->status) == 'published' ? 'selected' : '' }}>Published</option>
                                        <option value="scheduled" {{ old('status', $blog->status) == 'scheduled' ? 'selected' : '' }}>Scheduled</option>
                                        <option value="archived" {{ old('status', $blog->status) == 'archived' ? 'selected' : '' }}>Archived</option>
                                    </select>
                                    @error('status')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="published_at">Publish Date</label>
                                    <input type="datetime-local" class="form-control @error('published_at') is-invalid @enderror"
                                           id="published_at" name="published_at" value="{{ old('published_at', $blog->published_at ? $blog->published_at->format('Y-m-d\TH:i') : '') }}">
                                    @error('published_at')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="scheduled_at">Schedule Date (if scheduled)</label>
                                    <input type="datetime-local" class="form-control @error('scheduled_at') is-invalid @enderror"
                                           id="scheduled_at" name="scheduled_at" value="{{ old('scheduled_at', $blog->scheduled_at ? $blog->scheduled_at->format('Y-m-d\TH:i') : '') }}">
                                    @error('scheduled_at')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="allow_comments" name="allow_comments" value="1" {{ old('allow_comments', $blog->allow_comments) ? 'checked' : '' }}>
                                    <label class="form-check-label" for="allow_comments">Allow Comments</label>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="show_author" name="show_author" value="1" {{ old('show_author', $blog->show_author) ? 'checked' : '' }}>
                                    <label class="form-check-label" for="show_author">Show Author</label>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="show_related_blogs" name="show_related_blogs" value="1" {{ old('show_related_blogs', $blog->show_related_blogs) ? 'checked' : '' }}>
                                    <label class="form-check-label" for="show_related_blogs">Show Related Blogs</label>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="show_on_homepage" name="show_on_homepage" value="1" {{ old('show_on_homepage', $blog->show_on_homepage) ? 'checked' : '' }}>
                                    <label class="form-check-label" for="show_on_homepage">Show on Homepage</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Advanced Settings -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Advanced Settings</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="is_pinned" name="is_pinned" value="1" {{ old('is_pinned', $blog->is_pinned) ? 'checked' : '' }}>
                                    <label class="form-check-label" for="is_pinned">Pinned Blog</label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="is_trending" name="is_trending" value="1" {{ old('is_trending', $blog->is_trending) ? 'checked' : '' }}>
                                    <label class="form-check-label" for="is_trending">Trending Blog</label>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="external_source_url">External Source URL</label>
                            <input type="url" class="form-control @error('external_source_url') is-invalid @enderror"
                                   id="external_source_url" name="external_source_url" value="{{ old('external_source_url', $blog->external_source_url) }}">
                            @error('external_source_url')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- Save Button -->
                <div class="card">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-12 text-right">
                                <button type="submit" class="btn btn-primary btn-lg">
                                    <i class="fas fa-save"></i> Update Blog
                                </button>
                                <a href="{{ route('admin.blogs.index') }}" class="btn btn-secondary btn-lg ml-2">
                                    <i class="fas fa-times"></i> Cancel
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

@section('footer_js')
<script src="https://cdn.ckeditor.com/4.22.1/standard/ckeditor.js"></script>
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>

<script>
$(document).ready(function() {
    // Initialize Select2
    $('.select2').select2({
        placeholder: 'Select tags',
        allowClear: true
    });

    // Initialize CKEditor
    CKEDITOR.replace('content', {
        height: 400,
        filebrowserUploadUrl: '{{ route("admin.cms.upload") }}',
        filebrowserUploadMethod: 'form'
    });

    // Auto-generate slug from title
    $('#title').on('input', function() {
        var title = $(this).val();
        var slug = title.toLowerCase()
                        .replace(/[^a-z0-9 -]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim('-');
        $('#slug').val(slug);
    });

    // Status change handler
    $('#status').on('change', function() {
        var status = $(this).val();
        if (status === 'scheduled') {
            $('#scheduled_at').prop('required', true);
        } else {
            $('#scheduled_at').prop('required', false);
        }
    });
});
</script>
@endsection
@endsection
