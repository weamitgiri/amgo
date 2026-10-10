@csrf
@if ($mode === 'edit')
    @method('PUT')
@endif

@if ($errors->any())
    <div class="alert alert-danger">
        <button type="button" class="close" data-dismiss="alert">&times;</button>
        <strong><i class="fas fa-exclamation-triangle mr-1"></i> Please fix the following:</strong>
        <ul class="mb-0 mt-1 pl-3">
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

<div class="form-group">
    <label>Name <span class="text-danger">*</span></label>
    <input type="text" name="name" class="form-control @error('name') is-invalid @enderror"
           value="{{ old('name', $ingredient->name ?? '') }}" maxlength="100" required>
    @error('name') <div class="invalid-feedback">{{ $message }}</div> @enderror
</div>

<div class="form-group">
    <label>Image</label>
    <input type="file" name="image" class="form-control-file @error('image') is-invalid @enderror"
           accept="image/jpeg,image/png,image/webp">
    @error('image') <div class="invalid-feedback d-block">{{ $message }}</div> @enderror
    <small class="form-text text-muted">
        <i class="fas fa-info-circle mr-1"></i>
        Required: the image must be exactly <strong>302 &times; 253 px</strong> (width &times; height).
        Max size <strong>2 MB</strong> &middot; JPG, JPEG, PNG or WEBP.
        A transparent PNG looks best — the ingredient shows on a light card in the game.
    </small>
    @if (!empty($ingredient) && $ingredient->image_url)
        <div class="mt-2">
            <img src="{{ asset('storage/' . ltrim($ingredient->image_url, '/')) }}" alt="" style="width:64px;height:64px;object-fit:contain;">
        </div>
    @endif
</div>

<div class="form-group form-check">
    <input type="checkbox" name="is_absurd" id="is_absurd" class="form-check-input" value="1"
           {{ old('is_absurd', $ingredient->is_absurd ?? false) ? 'checked' : '' }}>
    <label class="form-check-label" for="is_absurd">
        Absurd ingredient (e.g. "Sand", "Ice Cubes" — deliberately implausible options)
    </label>
</div>

<div class="form-group">
    <label>Status <span class="text-danger">*</span></label>
    <select name="status" class="form-control @error('status') is-invalid @enderror" required>
        @foreach (['active' => 'Active', 'inactive' => 'Inactive'] as $value => $label)
            <option value="{{ $value }}" {{ old('status', $ingredient->status ?? 'active') === $value ? 'selected' : '' }}>{{ $label }}</option>
        @endforeach
    </select>
    @error('status') <div class="invalid-feedback">{{ $message }}</div> @enderror
</div>

<button type="submit" class="btn btn-primary">
    <i class="fas fa-save"></i> {{ $mode === 'edit' ? 'Update' : 'Create' }} Ingredient
</button>
<a href="{{ route('admin.cook-and-create.ingredients.index') }}" class="btn btn-secondary">Cancel</a>
