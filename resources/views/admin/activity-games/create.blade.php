@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1>Add Game to {{ $activity->title }}</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.index') }}">Home</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.activities.index') }}">Activities</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.activity-games.index', $activity->id) }}">Games</a></li>
                        <li class="breadcrumb-item active">Create</li>
                    </ol>
                </div>
            </div>
        </div>
    </section>

    <section class="content">
        <div class="container-fluid">
            <form action="{{ route('admin.activity-games.store', $activity->id) }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="card">
                    @include('admin.activity-games._form')
                </div>
            </form>
        </div>
    </section>
</div>
@endsection
