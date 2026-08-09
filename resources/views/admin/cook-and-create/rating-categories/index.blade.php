@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6"><h1 class="m-0">Cook &amp; Create — Award Categories</h1></div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item active">Cook &amp; Create — Award Categories</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <section class="content">
        <div class="container-fluid">
            @include('admin.cook-and-create.partials.subnav', ['ccActive' => 'admin.cook-and-create.rating-categories'])

            <div class="card">
                <div class="card-header">
                    <a href="{{ route('admin.cook-and-create.rating-categories.create') }}" class="btn btn-primary btn-sm">
                        <i class="fas fa-plus"></i> Add Award Category
                    </a>
                </div>
                <div class="card-body">
                    <p class="text-muted">
                        These are the fun-award categories players nominate other teams' dishes for on the
                        Final Results screen (e.g. "Most Creative Dish", "Funniest Dish"). <code>order</code> controls
                        display order.
                    </p>
                    <div class="table-responsive">
                        <table class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th style="width:60px">ID</th>
                                    <th style="width:60px">Emoji</th>
                                    <th>Name</th>
                                    <th>Slug</th>
                                    <th>Description</th>
                                    <th style="width:70px">Order</th>
                                    <th style="width:100px">Status</th>
                                    <th style="width:140px">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($categories as $category)
                                    <tr>
                                        <td>{{ $category->id }}</td>
                                        <td class="text-center" style="font-size:1.25rem;">{{ $category->emoji }}</td>
                                        <td>{{ $category->name }}</td>
                                        <td><code>{{ $category->slug }}</code></td>
                                        <td class="text-muted">{{ $category->description }}</td>
                                        <td>{{ $category->order }}</td>
                                        <td>
                                            <span class="badge {{ $category->status === 'active' ? 'badge-success' : 'badge-secondary' }}">
                                                {{ ucfirst($category->status) }}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <a href="{{ route('admin.cook-and-create.rating-categories.edit', $category) }}" class="btn btn-info"><i class="fas fa-edit"></i></a>
                                                <form action="{{ route('admin.cook-and-create.rating-categories.destroy', $category) }}" method="POST" style="display:inline;">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-danger" onclick="return confirm('Delete this award category?');"><i class="fas fa-trash"></i></button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr><td colspan="8" class="text-center text-muted">No award categories yet.</td></tr>
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
