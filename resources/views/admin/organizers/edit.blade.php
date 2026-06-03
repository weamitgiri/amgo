@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1>Edit Organizer: {{ $organizer->name }}</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.index') }}">Home</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.organizers.index') }}">Organizers</a></li>
                        <li class="breadcrumb-item active">Edit</li>
                    </ol>
                </div>
            </div>
        </div>
    </section>

    <section class="content">
        <div class="container-fluid">
            @include('admin.alert_message')
            <div class="card">
                <form action="{{ route('admin.organizers.update', $organizer->id) }}" method="POST">
                    @csrf
                    @method('PUT')
                    @include('admin.organizers._form')
                </form>
            </div>
        </div>
    </section>
</div>
@endsection
