@csrf
@if ($mode === 'edit')
    @method('PUT')
@endif

<div class="form-row">
    <div class="form-group col-md-8">
        <label>Name <span class="text-danger">*</span></label>
        <input type="text" name="name" class="form-control @error('name') is-invalid @enderror"
               value="{{ old('name', $category->name ?? '') }}" maxlength="100" required>
        @error('name') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>
    <div class="form-group col-md-4">
        <label>Emoji</label>
        <input type="text" name="emoji" class="form-control @error('emoji') is-invalid @enderror"
               value="{{ old('emoji', $category->emoji ?? '') }}" maxlength="20" placeholder="🎨">
        @error('emoji') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>
</div>

<div class="form-group">
    <label>Slug</label>
    <input type="text" name="slug" class="form-control @error('slug') is-invalid @enderror"
           value="{{ old('slug', $category->slug ?? '') }}" maxlength="100" placeholder="Auto-generated from name if left blank">
    @error('slug') <div class="invalid-feedback">{{ $message }}</div> @enderror
</div>

<div class="form-group">
    <label>Description</label>
    <input type="text" name="description" class="form-control @error('description') is-invalid @enderror"
           value="{{ old('description', $category->description ?? '') }}" maxlength="255">
    @error('description') <div class="invalid-feedback">{{ $message }}</div> @enderror
</div>

<div class="form-row">
    <div class="form-group col-md-4">
        <label>Order</label>
        <input type="number" name="order" class="form-control @error('order') is-invalid @enderror"
               value="{{ old('order', $category->order ?? 0) }}" min="0">
        @error('order') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>
    <div class="form-group col-md-4">
        <label>Status <span class="text-danger">*</span></label>
        <select name="status" class="form-control @error('status') is-invalid @enderror" required>
            @foreach (['active' => 'Active', 'inactive' => 'Inactive'] as $value => $label)
                <option value="{{ $value }}" {{ old('status', $category->status ?? 'active') === $value ? 'selected' : '' }}>{{ $label }}</option>
            @endforeach
        </select>
        @error('status') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>
</div>

<button type="submit" class="btn btn-primary">
    <i class="fas fa-save"></i> {{ $mode === 'edit' ? 'Update' : 'Create' }} Award Category
</button>
<a href="{{ route('admin.cook-and-create.rating-categories.index') }}" class="btn btn-secondary">Cancel</a>
