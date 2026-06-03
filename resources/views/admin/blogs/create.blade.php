@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6"><h1 class="m-0">Create Blog</h1></div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.blogs.index') }}">Blogs</a></li>
                        <li class="breadcrumb-item active">Create</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <section class="content">
        <div class="container-fluid">
            <div class="card">
                <div class="card-body">
                    <form action="{{ route('admin.blogs.store') }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        <div class="row">
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label class="form-label">Title</label>
                                    <input type="text" name="title" class="form-control" value="{{ old('title') }}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Short Description</label>
                                    <textarea name="short_description" class="form-control" rows="3">{{ old('short_description') }}</textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Content</label>
                                    <textarea name="content" class="form-control" rows="8">{{ old('content') }}</textarea>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label class="form-label">Category</label>
                                    <select name="category_id" class="form-control" required>
                                        <option value="">Select Category</option>
                                        @foreach(App\Models\BlogCategory::where('status', 1)->get() as $category)
                                            <option value="{{ $category->id }}" {{ old('category_id') == $category->id ? 'selected' : '' }}>{{ $category->name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Tags</label>
                                    <select name="tags[]" class="form-control" multiple>
                                        @foreach(App\Models\BlogTag::where('status', 1)->get() as $tag)
                                            <option value="{{ $tag->id }}" {{ collect(old('tags', []))->contains($tag->id) ? 'selected' : '' }}>{{ $tag->name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Author</label>
                                    <select name="author_id" class="form-control" required>
                                        <option value="">Select Author</option>
                                        @foreach(App\Models\User::where('usertype', '<=', 1)->get() as $author)
                                            <option value="{{ $author->id }}" {{ old('author_id') == $author->id ? 'selected' : '' }}>{{ $author->name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Featured Image</label>
                                    <input type="file" name="featured_image" class="form-control">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Banner Image</label>
                                    <input type="file" name="banner_image" class="form-control">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Status</label>
                                    <select name="status" class="form-control" required>
                                        <option value="draft" {{ old('status') == 'draft' ? 'selected' : '' }}>Draft</option>
                                        <option value="published" {{ old('status') == 'published' ? 'selected' : '' }}>Published</option>
                                        <option value="scheduled" {{ old('status') == 'scheduled' ? 'selected' : '' }}>Scheduled</option>
                                        <option value="archived" {{ old('status') == 'archived' ? 'selected' : '' }}>Archived</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Published At</label>
                                    <input type="datetime-local" name="published_at" class="form-control" value="{{ old('published_at') }}">
                                </div>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">Save Blog</button>
                        <a href="{{ route('admin.blogs.index') }}" class="btn btn-secondary">Cancel</a>
                    </form>
                </div>
            </div>
        </div>
    </section>
</div>
@endsection
