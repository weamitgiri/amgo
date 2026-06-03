@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6"><h1 class="m-0">Edit FAQ Category</h1></div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.faq-categories.index') }}">FAQ Categories</a></li>
                        <li class="breadcrumb-item active">Edit</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <section class="content">
        <div class="container-fluid">
            <div class="card">
                <div class="card-body">
                    <form method="POST" action="{{ route('admin.faq-categories.update', $faqCategory->id) }}">
                        @csrf
                        @method('PUT')
                        <div class="mb-3">
                            <label class="form-label">Name</label>
                            <input type="text" name="name" class="form-control" value="{{ old('name', $faqCategory->name) }}" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Slug</label>
                            <input type="text" name="slug" class="form-control" value="{{ old('slug', $faqCategory->slug) }}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Description</label>
                            <textarea name="description" class="form-control" rows="3">{{ old('description', $faqCategory->description) }}</textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Icon</label>
                            <input type="text" name="icon" class="form-control" value="{{ old('icon', $faqCategory->icon) }}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Sort Order</label>
                            <input type="number" name="sort_order" class="form-control" value="{{ old('sort_order', $faqCategory->sort_order) }}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Status</label>
                            <select name="status" class="form-control" required>
                                <option value="1" {{ old('status', $faqCategory->status) == '1' ? 'selected' : '' }}>Active</option>
                                <option value="0" {{ old('status', $faqCategory->status) == '0' ? 'selected' : '' }}>Inactive</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">Update Category</button>
                        <a href="{{ route('admin.faq-categories.index') }}" class="btn btn-secondary">Cancel</a>
                    </form>
                </div>
            </div>
        </div>
    </section>
</div>
@endsection
