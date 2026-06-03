@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1 class="m-0">Edit FAQ</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.faqs.index') }}">FAQs</a></li>
                        <li class="breadcrumb-item active">Edit</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <div class="content">
        <div class="container-fluid">
            @include('admin.alert_message')

            <form action="{{ route('admin.faqs.update', $faq->id) }}" method="POST">
                @csrf
                @method('PUT')

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">FAQ Details</h3>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label for="question">Question *</label>
                            <input type="text" class="form-control @error('question') is-invalid @enderror"
                                   id="question" name="question" value="{{ old('question', $faq->question) }}" required>
                            @error('question')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label for="answer">Answer *</label>
                            <textarea class="form-control @error('answer') is-invalid @enderror"
                                      id="answer" name="answer" rows="8" required>{{ old('answer', $faq->answer) }}</textarea>
                            @error('answer')
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
                                            <option value="{{ $category->id }}" {{ old('category_id', $faq->category_id) == $category->id ? 'selected' : '' }}>
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
                                    <label for="sort_order">Sort Order</label>
                                    <input type="number" class="form-control @error('sort_order') is-invalid @enderror"
                                           id="sort_order" name="sort_order" value="{{ old('sort_order', $faq->sort_order) }}" min="0">
                                    @error('sort_order')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                    <small class="form-text text-muted">Lower numbers appear first</small>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="status">Status *</label>
                                    <select class="form-control @error('status') is-invalid @enderror"
                                            id="status" name="status" required>
                                        <option value="1" {{ old('status', $faq->status) == 1 ? 'selected' : '' }}>Active</option>
                                        <option value="0" {{ old('status', $faq->status) == 0 ? 'selected' : '' }}>Inactive</option>
                                    </select>
                                    @error('status')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-check mt-4">
                                    <input type="checkbox" class="form-check-input" id="is_featured" name="is_featured" value="1" {{ old('is_featured', $faq->is_featured) ? 'checked' : '' }}>
                                    <label class="form-check-label" for="is_featured">Featured FAQ</label>
                                    <small class="form-text text-muted d-block">Featured FAQs appear prominently</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Save Button -->
                <div class="card">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-12 text-right">
                                <button type="submit" class="btn btn-primary btn-lg">
                                    <i class="fas fa-save"></i> Update FAQ
                                </button>
                                <a href="{{ route('admin.faqs.index') }}" class="btn btn-secondary btn-lg ml-2">
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
@endsection

@section('footer_js')
<script src="https://cdn.ckeditor.com/4.22.1/standard/ckeditor.js"></script>

<script>
$(document).ready(function() {
    // Initialize CKEditor for answer
    CKEDITOR.replace('answer', {
        height: 300,
        toolbar: [
            ['Bold', 'Italic', 'Underline', 'Strike'],
            ['NumberedList', 'BulletedList'],
            ['Link', 'Unlink'],
            ['Undo', 'Redo']
        ]
    });
});
</script>
@endsection
