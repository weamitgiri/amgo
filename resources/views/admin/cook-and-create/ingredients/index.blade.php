@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6"><h1 class="m-0">Cook &amp; Create — Ingredients</h1></div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item active">Cook &amp; Create — Ingredients</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <section class="content">
        <div class="container-fluid">
            @include('admin.cook-and-create.partials.subnav', ['ccActive' => 'admin.cook-and-create.ingredients'])

            <div class="card">
                <div class="card-header">
                    <a href="{{ route('admin.cook-and-create.ingredients.create') }}" class="btn btn-primary btn-sm">
                        <i class="fas fa-plus"></i> Add Ingredient
                    </a>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th style="width:60px">ID</th>
                                    <th style="width:70px">Image</th>
                                    <th>Name</th>
                                    <th style="width:100px">Absurd?</th>
                                    <th style="width:100px">Status</th>
                                    <th style="width:140px">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($ingredients as $ingredient)
                                    <tr>
                                        <td>{{ $ingredient->id }}</td>
                                        <td>
                                            @if ($ingredient->image_url)
                                                <img src="{{ asset('storage/' . ltrim($ingredient->image_url, '/')) }}" alt="" style="width:36px;height:36px;object-fit:contain;">
                                            @else
                                                <span class="text-muted">—</span>
                                            @endif
                                        </td>
                                        <td>{{ $ingredient->name }}</td>
                                        <td>
                                            @if ($ingredient->is_absurd)
                                                <span class="badge badge-warning">Absurd</span>
                                            @else
                                                <span class="text-muted">—</span>
                                            @endif
                                        </td>
                                        <td>
                                            <span class="badge {{ $ingredient->status === 'active' ? 'badge-success' : 'badge-secondary' }}">
                                                {{ ucfirst($ingredient->status) }}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <a href="{{ route('admin.cook-and-create.ingredients.edit', $ingredient) }}" class="btn btn-info"><i class="fas fa-edit"></i></a>
                                                <form action="{{ route('admin.cook-and-create.ingredients.destroy', $ingredient) }}" method="POST" style="display:inline;">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-danger" onclick="return confirm('Delete this ingredient?');"><i class="fas fa-trash"></i></button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr><td colspan="6" class="text-center text-muted">No ingredients yet.</td></tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>
@endsection
