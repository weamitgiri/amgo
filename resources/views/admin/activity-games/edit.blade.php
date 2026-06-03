@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1>Edit Game Content</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.index') }}">Home</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.activities.index') }}">Activities</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.activity-games.index', $activity->id) }}">Games</a></li>
                        <li class="breadcrumb-item active">Edit</li>
                    </ol>
                </div>
            </div>
        </div>
    </section>

    <section class="content">
        <div class="container-fluid">
            <form action="{{ route('admin.activity-games.update', [$activity->id, $game->id]) }}" method="POST" enctype="multipart/form-data">
                @csrf
                @method('PUT')
                <div class="card">
                    @include('admin.activity-games._form')
                </div>
            </form>
        </div>
    </section>
</div>
@endsection
