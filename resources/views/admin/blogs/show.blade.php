@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6"><h1 class="m-0">View Blog</h1></div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.blogs.index') }}">Blogs</a></li>
                        <li class="breadcrumb-item active">View</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <section class="content">
        <div class="container-fluid">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">{{ $blog->title }}</h3>
                    <div class="card-tools">
                        <a href="{{ route('admin.blogs.edit', $blog->id) }}" class="btn btn-sm btn-info">Edit</a>
                        <a href="{{ route('admin.blogs.index') }}" class="btn btn-sm btn-secondary">Back</a>
                    </div>
                </div>
                <div class="card-body">
                    <p><strong>Category:</strong> {{ $blog->category->name ?? 'N/A' }}</p>
                    <p><strong>Author:</strong> {{ $blog->author->name ?? 'N/A' }}</p>
                    <p><strong>Status:</strong> {{ ucfirst($blog->status) }}</p>
                    <p><strong>Published At:</strong> {{ optional($blog->published_at)->format('Y-m-d H:i') ?? 'N/A' }}</p>
                    <p><strong>Short Description:</strong></p>
                    <p>{{ $blog->short_description }}</p>
                    <p><strong>Content:</strong></p>
                    <div>{!! $blog->content !!}</div>
                    @if($blog->featured_image)
                        <div class="mt-3">
                            <strong>Featured Image</strong><br>
                            <img src="{{ asset('storage/' . $blog->featured_image) }}" class="img-fluid" alt="Featured Image">
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </section>
</div>
@endsection
