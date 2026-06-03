@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1 class="m-0">Preview: {{ $page->page_name }}</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.cms.index') }}">CMS Pages</a></li>
                        <li class="breadcrumb-item active">Preview</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <section class="content">
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="preview-header mb-3">
                                <h2>{{ $page->title }}</h2>
                                <small class="text-muted">
                                    Status: <span class="badge badge-{{ $page->status == 1 ? 'success' : 'warning' }}">
                                        {{ $page->status_label }}
                                    </span>
                                </small>
                                @if($page->published_at)
                                    <br>
                                    <small class="text-muted">Published: {{ $page->published_at->format('d M Y H:i') }}</small>
                                @endif
                            </div>

                            @if($page->featured_image)
                                <div class="preview-image mb-3">
                                    <img src="{{ asset('storage/' . $page->featured_image) }}" alt="{{ $page->title }}" 
                                         style="max-width: 100%; height: auto;" class="img-fluid">
                                </div>
                            @endif

                            <div class="preview-content">
                                {!! $page->content !!}
                            </div>

                            <hr>

                            <div class="preview-seo mt-3">
                                <h4>SEO Information</h4>
                                <div class="row">
                                    <div class="col-md-6">
                                        <strong>Meta Title:</strong> {{ $page->meta_title ?? 'Not set' }}
                                    </div>
                                    <div class="col-md-6">
                                        <strong>Meta Description:</strong> {{ $page->meta_description ?? 'Not set' }}
                                    </div>
                                </div>
                                <div class="mt-2">
                                    <strong>Keywords:</strong> {{ $page->meta_keywords ?? 'Not set' }}
                                </div>
                            </div>
                        </div>

                        <div class="card-footer">
                            <a href="{{ route('admin.cms.edit', encrypt($page->id)) }}" class="btn btn-primary">Edit</a>
                            <a href="{{ route('admin.cms.index') }}" class="btn btn-secondary">Back</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>
@endsection

@section('footer_css')
<style>
    .preview-content {
        line-height: 1.6;
        color: #333;
    }
    .preview-content img {
        max-width: 100%;
        height: auto;
    }
    .preview-seo {
        background-color: #f5f5f5;
        padding: 15px;
        border-radius: 4px;
    }
</style>
@endsection
