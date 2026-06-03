@php
    $isEdit = $package->exists;
    $features = old('features', $package->features ?? ['']);
    $gameAccess = old('game_access', $package->game_access ?? []);
    $status = old('status', $package->status ?? 'draft');
@endphp

<div class="card-body">
    <div class="row">
        <div class="col-md-6">
            <div class="form-group">
                <label>Package Name <span class="text-danger">*</span></label>
                <input type="text" name="name" class="form-control @error('name') is-invalid @enderror" value="{{ old('name', $package->name) }}" required>
                @error('name') <span class="invalid-feedback">{{ $message }}</span> @enderror
            </div>
        </div>
        <div class="col-md-6">
            <div class="form-group">
                <label>Slug <span class="text-danger">*</span></label>
                <input type="text" name="slug" id="slug" class="form-control @error('slug') is-invalid @enderror" value="{{ old('slug', $package->slug) }}" required>
                @error('slug') <span class="invalid-feedback">{{ $message }}</span> @enderror
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-4">
            <div class="form-group">
                <label>Package Price <span class="text-danger">*</span></label>
                <input type="number" step="0.01" min="0" name="price" class="form-control @error('price') is-invalid @enderror" value="{{ old('price', $package->price) }}" required>
                @error('price') <span class="invalid-feedback">{{ $message }}</span> @enderror
            </div>
        </div>
        <div class="col-md-4">
            <div class="form-group">
                <label>Maximum Users <span class="text-danger">*</span></label>
                <input type="number" min="1" name="max_users" class="form-control @error('max_users') is-invalid @enderror" value="{{ old('max_users', $package->max_users) }}" required>
                @error('max_users') <span class="invalid-feedback">{{ $message }}</span> @enderror
            </div>
        </div>
        <div class="col-md-4">
            <div class="form-group">
                <label>Total Groups <span class="text-danger">*</span></label>
                <input type="number" min="1" name="total_groups" class="form-control @error('total_groups') is-invalid @enderror" value="{{ old('total_groups', $package->total_groups) }}" required>
                @error('total_groups') <span class="invalid-feedback">{{ $message }}</span> @enderror
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-4">
            <div class="form-group">
                <label>Package Validity (Days) <span class="text-danger">*</span></label>
                <input type="number" min="1" name="validity_days" class="form-control @error('validity_days') is-invalid @enderror" value="{{ old('validity_days', $package->validity_days) }}" required>
                @error('validity_days') <span class="invalid-feedback">{{ $message }}</span> @enderror
            </div>
        </div>
        <div class="col-md-4">
            <div class="form-group">
                <label>Status <span class="text-danger">*</span></label>
                <select name="status" class="form-control @error('status') is-invalid @enderror">
                    <option value="active" {{ $status === 'active' ? 'selected' : '' }}>Active</option>
                    <option value="inactive" {{ $status === 'inactive' ? 'selected' : '' }}>Inactive</option>
                    <option value="draft" {{ $status === 'draft' ? 'selected' : '' }}>Draft</option>
                </select>
                @error('status') <span class="invalid-feedback">{{ $message }}</span> @enderror
            </div>
        </div>
        <div class="col-md-4">
            <div class="form-group">
                <label>Display Order</label>
                <input type="number" min="0" name="sort_order" class="form-control @error('sort_order') is-invalid @enderror" value="{{ old('sort_order', $package->sort_order) }}">
                @error('sort_order') <span class="invalid-feedback">{{ $message }}</span> @enderror
            </div>
        </div>
    </div>

    <div class="form-group">
        <label>Short Description</label>
        <textarea name="short_description" rows="3" class="form-control @error('short_description') is-invalid @enderror">{{ old('short_description', $package->short_description) }}</textarea>
        @error('short_description') <span class="invalid-feedback">{{ $message }}</span> @enderror
    </div>

    <div class="form-group">
        <label>Game Access Selection</label>
        <select name="game_access[]" class="form-control select2" multiple>
            @foreach(['cricket','football','tennis','casino','esports'] as $game)
                <option value="{{ $game }}" {{ in_array($game, $gameAccess, true) ? 'selected' : '' }}>{{ ucfirst($game) }}</option>
            @endforeach
        </select>
    </div>

    <div class="form-group">
        <label>Features</label>
        <div id="featuresContainer">
            @foreach($features as $index => $feature)
                <div class="input-group mb-2 feature-item">
                    <input type="text" name="features[]" class="form-control" value="{{ $feature }}" placeholder="Feature {{ $index + 1 }}">
                    <div class="input-group-append">
                        <button type="button" class="btn btn-outline-secondary move-up">Up</button>
                        <button type="button" class="btn btn-outline-secondary move-down">Down</button>
                        <button type="button" class="btn btn-outline-danger remove-feature">Remove</button>
                    </div>
                </div>
            @endforeach
        </div>
        <button type="button" class="btn btn-sm btn-outline-primary" id="addFeature">Add Feature</button>
    </div>
</div>

<div class="card-footer">
    <button type="submit" class="btn btn-primary">{{ $isEdit ? 'Update Package' : 'Create Package' }}</button>
    <a href="{{ route('admin.packages.index') }}" class="btn btn-secondary">Cancel</a>
</div>

@section('footer_js')
@parent
<script>
$(function () {
    $('.select2').select2();

    $('input[name="name"]').on('input', function () {
        if (!$('#slug').data('edited')) {
            const value = $(this).val().toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
            $('#slug').val(value);
        }
    });

    $('#slug').on('input', function () {
        $(this).data('edited', true);
    });

    $('#addFeature').click(function () {
        $('#featuresContainer').append(
            '<div class="input-group mb-2 feature-item">' +
                '<input type="text" name="features[]" class="form-control" placeholder="Feature">' +
                '<div class="input-group-append">' +
                    '<button type="button" class="btn btn-outline-secondary move-up">Up</button>' +
                    '<button type="button" class="btn btn-outline-secondary move-down">Down</button>' +
                    '<button type="button" class="btn btn-outline-danger remove-feature">Remove</button>' +
                '</div>' +
            '</div>'
        );
    });

    $(document).on('click', '.remove-feature', function () {
        $(this).closest('.feature-item').remove();
    });

    $(document).on('click', '.move-up', function () {
        const item = $(this).closest('.feature-item');
        item.prev('.feature-item').before(item);
    });

    $(document).on('click', '.move-down', function () {
        const item = $(this).closest('.feature-item');
        item.next('.feature-item').after(item);
    });
});
</script>
@endsection
