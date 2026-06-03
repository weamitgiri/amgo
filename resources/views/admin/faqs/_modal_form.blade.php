@php
    // Expected variables: $categories, optional $faq
@endphp

<form id="faq-modal-form" method="POST" action="{{ isset($faq) ? route('admin.faqs.update', $faq->id) : route('admin.faqs.store') }}">
    @csrf
    @if(isset($faq))
        @method('PUT')
    @endif
    <div id="faq-modal-errors" class="alert alert-danger d-none"></div>
    <div class="mb-3">
        <label class="form-label">Question</label>
        <input type="text" name="question" class="form-control" value="{{ old('question', $faq->question ?? '') }}" required>
    </div>

    <div class="mb-3">
        <label class="form-label">Category</label>
        <select name="category_id" class="form-select" required>
            <option value="">Select category</option>
            @foreach($categories as $cat)
                <option value="{{ $cat->id }}" {{ (old('category_id', $faq->category_id ?? '') == $cat->id) ? 'selected' : '' }}>{{ $cat->name }}</option>
            @endforeach
        </select>
    </div>

    <div class="mb-3">
        <label class="form-label">Answer</label>
        <textarea name="answer" class="form-control" rows="5">{{ old('answer', $faq->answer ?? '') }}</textarea>
    </div>

    <div class="mb-3 text-end">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="submit" class="btn btn-primary">Save</button>
    </div>
</form>
