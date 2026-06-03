@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6"><h1 class="m-0">FAQ Categories</h1></div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item active">FAQ Categories</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <section class="content">
        <div class="container-fluid">
            <div class="card">
                <div class="card-header">
                    <a href="{{ route('admin.faq-categories.create') }}" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> Add FAQ Category</a>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table id="faqCategoryTable" class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Slug</th>
                                    <th>FAQs</th>
                                    <th>Sort Order</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>
@endsection

@section('footer_js')
<script>
$(function () {
    $('#faqCategoryTable').DataTable({
        processing: true,
        serverSide: true,
        ajax: '{{ route("admin.faq-categories.index") }}',
        columns: [
            { data: 'id', name: 'id', width: '50px' },
            { data: 'name', name: 'name' },
            { data: 'slug', name: 'slug' },
            { data: 'faqs_count', name: 'faqs_count', width: '80px' },
            { data: 'sort_order', name: 'sort_order', width: '80px' },
            { data: 'status', name: 'status', width: '100px' },
            {
                data: 'actions',
                name: 'actions',
                orderable: false,
                searchable: false,
                render: function(data) {
                    var baseUrl = '{{ url("admin/faq-categories") }}';
                    return `
                        <div class="btn-group btn-group-sm">
                            <a href="${baseUrl}/${data}/edit" class="btn btn-info"><i class="fas fa-edit"></i></a>
                            <form action="${baseUrl}/${data}" method="POST" style="display:inline;">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-danger" onclick="return confirm('Delete this FAQ category?');"><i class="fas fa-trash"></i></button>
                            </form>
                        </div>
                    `;
                }
            }
        ]
    });
});
</script>
@endsection
