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
                    <h1 class="m-0">Edit CMS Page</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.cms.index') }}">CMS Pages</a></li>
                        <li class="breadcrumb-item active">Edit</li>
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
                            <h3 class="card-title">Edit: {{ $page->page_name }}</h3>
                        </div>

                        <form method="POST" action="{{ route('admin.cms.update', encrypt($page->id)) }}" enctype="multipart/form-data">
                            @csrf
                            @method('PUT')

                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="page_name">Page Name <span class="text-danger">*</span></label>
                                            <input type="text" id="page_name" name="page_name" class="form-control @error('page_name') is-invalid @enderror" 
                                                   value="{{ old('page_name', $page->page_name) }}">
                                            @error('page_name')
                                                <span class="invalid-feedback">{{ $message }}</span>
                                            @enderror
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="slug">Slug</label>
                                            <input type="text" id="slug" name="slug" class="form-control @error('slug') is-invalid @enderror" 
                                                   value="{{ old('slug', $page->slug) }}">
                                            @error('slug')
                                                <span class="invalid-feedback">{{ $message }}</span>
                                            @enderror
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="title">Page Title <span class="text-danger">*</span></label>
                                    <input type="text" id="title" name="title" class="form-control @error('title') is-invalid @enderror" 
                                           value="{{ old('title', $page->title) }}">
                                    @error('title')
                                        <span class="invalid-feedback">{{ $message }}</span>
                                    @enderror
                                </div>

                                <div class="form-group">
                                    <label for="content">Content <span class="text-danger">*</span></label>
                                    <textarea id="content" name="content" class="form-control ckeditor @error('content') is-invalid @enderror" 
                                              rows="10">{{ old('content', $page->content) }}</textarea>
                                    @error('content')
                                        <span class="invalid-feedback">{{ $message }}</span>
                                    @enderror
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="meta_title">SEO Meta Title</label>
                                            <input type="text" id="meta_title" name="meta_title" class="form-control @error('meta_title') is-invalid @enderror" 
                                                   value="{{ old('meta_title', $page->meta_title) }}">
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
                                                   value="{{ old('meta_description', $page->meta_description) }}">
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
                                           value="{{ old('meta_keywords', $page->meta_keywords) }}">
                                    @error('meta_keywords')
                                        <span class="invalid-feedback">{{ $message }}</span>
                                    @enderror
                                </div>

                                <div class="form-group">
                                    <label for="featured_image">Featured Image</label>
                                    @if($page->featured_image)
                                        <div class="mb-2">
                                            <img src="{{ asset('storage/' . $page->featured_image) }}" alt="Featured Image" 
                                                 style="max-width: 200px; height: auto;" class="img-thumbnail">
                                        </div>
                                    @endif
                                    <div class="input-group">
                                        <div class="custom-file">
                                            <input type="file" class="custom-file-input @error('featured_image') is-invalid @enderror" 
                                                   id="featured_image" name="featured_image" accept="image/*">
                                            <label class="custom-file-label" for="featured_image">
                                                {{ $page->featured_image ? 'Change image' : 'Choose image' }}
                                            </label>
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
                                        <option value="1" {{ old('status', $page->status) == 1 ? 'selected' : '' }}>Published</option>
                                        <option value="0" {{ old('status', $page->status) == 0 ? 'selected' : '' }}>Draft</option>
                                    </select>
                                    @error('status')
                                        <span class="invalid-feedback">{{ $message }}</span>
                                    @enderror
                                </div>

                                @if($page->created_by)
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Created By</label>
                                                <p class="form-control-plaintext">
                                                    {{ $page->creator ? $page->creator->name : 'System' }} 
                                                    <small>({{ $page->created_at->format('d M Y H:i') }})</small>
                                                </p>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Last Updated</label>
                                                <p class="form-control-plaintext">
                                                    {{ $page->updated_at->format('d M Y H:i') }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                @endif
                            </div>

                            <div class="card-footer">
                                <button type="submit" class="btn btn-primary">Update Page</button>
                                <a href="{{ route('admin.cms.index') }}" class="btn btn-secondary">Cancel</a>
                                <a href="{{ route('admin.cms.preview', encrypt($page->id)) }}" class="btn btn-info" target="_blank">Preview</a>
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

    // File input label
    $('#featured_image').on('change', function() {
        let fileName = $(this).val().split('\\').pop();
        $(this).next('.custom-file-label').html(fileName);
    });
});
</script>
@endsection
