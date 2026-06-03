@php
    // Expected variables: $categories, $tags, $authors, optional $blog
@endphp

<form id="blog-modal-form" method="POST" action="{{ isset($blog) ? route('admin.blogs.update', $blog->id) : route('admin.blogs.store') }}" enctype="multipart/form-data">
    @csrf
    @if(isset($blog))
        @method('PUT')
    @endif

    <div id="blog-modal-errors" class="alert alert-danger d-none"></div>

    <div class="mb-3">
        <label class="form-label">Title</label>
        <input type="text" name="title" class="form-control" value="{{ old('title', $blog->title ?? '') }}" required>
    </div>

    <div class="mb-3">
        <label class="form-label">Category</label>
        <select name="category_id" class="form-select" required>
            <option value="">Select category</option>
            @foreach($categories as $cat)
                <option value="{{ $cat->id }}" {{ (old('category_id', $blog->category_id ?? '') == $cat->id) ? 'selected' : '' }}>{{ $cat->name }}</option>
            @endforeach
        </select>
    </div>

    <div class="mb-3">
        <label class="form-label">Tags</label>
        <select name="tags[]" class="form-select" multiple>
            @foreach($tags as $tag)
                <option value="{{ $tag->id }}" {{ in_array($tag->id, old('tags', isset($blog) ? $blog->tags->pluck('id')->toArray() : [])) ? 'selected' : '' }}>{{ $tag->name }}</option>
            @endforeach
        </select>
    </div>

    <div class="mb-3">
        <label class="form-label">Short Description</label>
        <textarea name="short_description" class="form-control" rows="3">{{ old('short_description', $blog->short_description ?? '') }}</textarea>
    </div>

    <div class="mb-3">
        <label class="form-label">Content</label>
        <textarea name="content" class="form-control" rows="6">{{ old('content', $blog->content ?? '') }}</textarea>
    </div>

    <div class="mb-3">
        <label class="form-label">Featured Image</label>
        <input type="file" name="featured_image" class="form-control">
    </div>

    <div class="mb-3 text-end">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="submit" class="btn btn-primary">Save</button>
    </div>
</form>
