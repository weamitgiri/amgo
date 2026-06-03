@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1 class="m-0">Edit Email Template</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.email-templates.index') }}">Email Templates</a></li>
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
                            <h3 class="card-title">Edit: {{ $template->name }}</h3>
                        </div>

                        <form method="POST" action="{{ route('admin.email-templates.update', encrypt($template->id)) }}">
                            @csrf
                            @method('PUT')

                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="name">Template Name <span class="text-danger">*</span></label>
                                            <input type="text" id="name" name="name" class="form-control @error('name') is-invalid @enderror" 
                                                   value="{{ old('name', $template->name) }}">
                                            @error('name')
                                                <span class="invalid-feedback">{{ $message }}</span>
                                            @enderror
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="slug">Slug</label>
                                            <input type="text" id="slug" name="slug" class="form-control @error('slug') is-invalid @enderror" 
                                                   value="{{ old('slug', $template->slug) }}">
                                            @error('slug')
                                                <span class="invalid-feedback">{{ $message }}</span>
                                            @enderror
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="description">Description</label>
                                    <textarea id="description" name="description" class="form-control @error('description') is-invalid @enderror" 
                                              rows="2">{{ old('description', $template->description) }}</textarea>
                                    @error('description')
                                        <span class="invalid-feedback">{{ $message }}</span>
                                    @enderror
                                </div>

                                <div class="form-group">
                                    <label for="subject">Email Subject <span class="text-danger">*</span></label>
                                    <input type="text" id="subject" name="subject" class="form-control @error('subject') is-invalid @enderror" 
                                           value="{{ old('subject', $template->subject) }}">
                                    <small class="form-text text-muted">Use {variable} for dynamic content. Example: Hello {name}!</small>
                                    @error('subject')
                                        <span class="invalid-feedback">{{ $message }}</span>
                                    @enderror
                                </div>

                                <div class="form-group">
                                    <label for="body">Email Body <span class="text-danger">*</span></label>
                                    <textarea id="body" name="body" class="form-control ckeditor @error('body') is-invalid @enderror" 
                                              rows="12">{{ old('body', $template->body) }}</textarea>
                                    <small class="form-text text-muted">Use {variable} for dynamic content. Common variables: {name}, {email}, {url}, {token}, {code}</small>
                                    @error('body')
                                        <span class="invalid-feedback">{{ $message }}</span>
                                    @enderror
                                </div>

                                @if($template->variables && !empty($template->variables))
                                    <div class="alert alert-info">
                                        <strong>Variables Found:</strong>
                                        @foreach($template->variables as $var)
                                            <span class="badge badge-info">{{{ $var }}}</span>
                                        @endforeach
                                    </div>
                                @endif

                                <div class="form-group">
                                    <label for="status">Status <span class="text-danger">*</span></label>
                                    <select id="status" name="status" class="form-control @error('status') is-invalid @enderror">
                                        <option value="1" {{ old('status', $template->status) == 1 ? 'selected' : '' }}>Active</option>
                                        <option value="0" {{ old('status', $template->status) == 0 ? 'selected' : '' }}>Inactive</option>
                                    </select>
                                    @error('status')
                                        <span class="invalid-feedback">{{ $message }}</span>
                                    @enderror
                                </div>

                                @if($template->created_by)
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Created By</label>
                                                <p class="form-control-plaintext">
                                                    {{ $template->creator ? $template->creator->name : 'System' }} 
                                                    <small>({{ $template->created_at->format('d M Y H:i') }})</small>
                                                </p>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Usage Statistics</label>
                                                <p class="form-control-plaintext">
                                                    <strong>{{ $template->usage_count }}</strong> times used
                                                    @if($template->last_used_at)
                                                        <br><small>Last used: {{ $template->last_used_at->diffForHumans() }}</small>
                                                    @endif
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                @endif
                            </div>

                            <div class="card-footer">
                                <button type="submit" class="btn btn-primary">Update Template</button>
                                <a href="{{ route('admin.email-templates.index') }}" class="btn btn-secondary">Cancel</a>
                                <a href="{{ route('admin.email-templates.show', encrypt($template->id)) }}" class="btn btn-info" target="_blank">Preview</a>
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
    CKEDITOR.replace('body', {
        height: 300
    });
});
</script>
@endsection
