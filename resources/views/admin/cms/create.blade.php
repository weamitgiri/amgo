@extends('admin.layouts.default')
<style>
    #cke_notifications_area_content {
      display: none;
    }
</style>
@section('content')
<div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1 class="m-0">Create CMS Page</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.cms.index') }}">CMS Pages</a></li>
                        <li class="breadcrumb-item active">Create</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <section class="content">
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-12">
                    <div class="card card-primary">
                        <div class="card-header">
                            <h3 class="card-title">New CMS Page</h3>
                        </div>

                        <form method="POST" action="{{ route('admin.cms.store') }}" enctype="multipart/form-data">
                            @csrf

                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="page_name">Page Name <span class="text-danger">*</span></label>
                                            <select name="page_name" id="page_name" class="form-control @error('page_name') is-invalid @enderror" onchange="setPageName()">
                                                <option value="">-- Select or Enter Page Name --</option>
                                                @foreach($predefinedPages as $key => $value)
                                                    <option value="{{ $value }}" data-key="{{ $key }}">{{ $value }}</option>
                                                @endforeach
                                            </select>
                                            <small class="form-text text-muted">Select from predefined pages or enter custom name</small>
                                            @error('page_name')
                                                <span class="invalid-feedback">{{ $message }}</span>
                                            @enderror
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="slug">Slug</label>
                                            <input type="text" id="slug" name="slug" class="form-control @error('slug') is-invalid @enderror" 
                                                   placeholder="auto-generated" readonly>
                                            <small class="form-text text-muted">Auto-generated from page name</small>
                                            @error('slug')
                                                <span class="invalid-feedback">{{ $message }}</span>
                                            @enderror
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="title">Page Title <span class="text-danger">*</span></label>
                                    <input type="text" id="title" name="title" class="form-control @error('title') is-invalid @enderror" 
                                           placeholder="Enter page title" value="{{ old('title') }}">
                                    @error('title')
                                        <span class="invalid-feedback">{{ $message }}</span>
                                    @enderror
                                </div>

                                <div class="form-group">
                                    <label for="content">Content <span class="text-danger">*</span></label>
                                    <textarea id="content" name="content" class="form-control ckeditor @error('content') is-invalid @enderror" 
                                              rows="10">{{ old('content') }}</textarea>
                                    @error('content')
                                        <span class="invalid-feedback">{{ $message }}</span>
                                    @enderror
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="meta_title">SEO Meta Title</label>
                                            <input type="text" id="meta_title" name="meta_title" class="form-control @error('meta_title') is-invalid @enderror" 
                                                   placeholder="Enter meta title" value="{{ old('meta_title') }}">
                                            <small class="form-text text-muted">For search engines (max 60 chars)</small>
                                            @error('meta_title')
                                                <span class="invalid-feedback">{{ $message }}</span>
                                            @enderror
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="meta_description">SEO Meta Description</label>
                                            <input type="text" id="meta_description" name="meta_description" class="form-control @error('meta_description') is-invalid @enderror" 
                                                   placeholder="Enter meta description" value="{{ old('meta_description') }}">
                                            <small class="form-text text-muted">For search engines (max 160 chars)</small>
                                            @error('meta_description')
                                                <span class="invalid-feedback">{{ $message }}</span>
                                            @enderror
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="meta_keywords">SEO Keywords</label>
                                    <input type="text" id="meta_keywords" name="meta_keywords" class="form-control @error('meta_keywords') is-invalid @enderror" 
                                           placeholder="Comma separated keywords" value="{{ old('meta_keywords') }}">
                                    @error('meta_keywords')
                                        <span class="invalid-feedback">{{ $message }}</span>
                                    @enderror
                                </div>

                                <div class="form-group">
                                    <label for="featured_image">Featured Image</label>
                                    <div class="input-group">
                                        <div class="custom-file">
                                            <input type="file" class="custom-file-input @error('featured_image') is-invalid @enderror" 
                                                   id="featured_image" name="featured_image" accept="image/*">
                                            <label class="custom-file-label" for="featured_image">Choose image</label>
                                        </div>
                                    </div>
                                    <small class="form-text text-muted">Supported formats: JPEG, PNG, JPG, GIF, WebP (Max 5MB)</small>
                                    @error('featured_image')
                                        <span class="text-danger">{{ $message }}</span>
                                    @enderror
                                </div>

                                <div class="form-group">
                                    <label for="status">Status <span class="text-danger">*</span></label>
                                    <select id="status" name="status" class="form-control @error('status') is-invalid @enderror">
                                        <option value="1" {{ old('status') == 1 ? 'selected' : '' }}>Published</option>
                                        <option value="0" {{ old('status') == 0 ? 'selected' : '' }}>Draft</option>
                                    </select>
                                    @error('status')
                                        <span class="invalid-feedback">{{ $message }}</span>
                                    @enderror
                                </div>
                            </div>

                            <div class="card-footer">
                                <button type="submit" class="btn btn-primary">Create Page</button>
                                <a href="{{ route('admin.cms.index') }}" class="btn btn-secondary">Cancel</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>
@endsection

@section('footer_js')
<script src="https://cdn.ckeditor.com/4.21.0/standard/ckeditor.js"></script>
<script>
$(function() {
    CKEDITOR.replace('content', {
        height: 300,
        filebrowserBrowseUrl: '{{ asset("admin/ckfinder/ckfinder.html") }}',
        filebrowserImageBrowseUrl: '{{ asset("admin/ckfinder/ckfinder.html?type=Images") }}',
        filebrowserUploadUrl: '{{ route("admin.cms.upload") }}'
    });

    // Auto-generate slug from page_name
    function setPageName() {
        let pageName = $('#page_name').val();
        if (pageName) {
            let slug = pageName.toLowerCase().trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            $('#slug').val(slug);
        }
    }

    // Update title when page name changes
    $('#page_name').on('change', function() {
        setPageName();
        if (!$('#title').val()) {
            $('#title').val($(this).val());
        }
    });

    // File input label
    $('#featured_image').on('change', function() {
        let fileName = $(this).val().split('\\').pop();
        $(this).next('.custom-file-label').html(fileName);
    });
});
</script>
@endsection
