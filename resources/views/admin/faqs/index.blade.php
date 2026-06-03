@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1 class="m-0">FAQ Management</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item active">FAQs</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <div class="content">
        <div class="container-fluid">
            @include('admin.alert_message')

            <div class="card">
                <div class="card-header border-bottom-0">
                    <div class="row">
                        <div class="col-md-6">
                            <h3 class="card-title">FAQs List</h3>
                        </div>
                        <div class="col-md-6 text-right">
                            <a href="{{ route('admin.faqs.create') }}" class="btn btn-primary btn-sm">
                                <i class="fas fa-plus"></i> Add New FAQ
                            </a>
                            <button class="btn btn-success btn-sm" data-toggle="modal" data-target="#faqModal">
                                <i class="fas fa-plus"></i> Quick Add
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card-body">
                    <div class="table-responsive">
                        <table id="faqTable" class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Question</th>
                                    <th>Category</th>
                                    <th>Sort Order</th>
                                    <th>Status</th>
                                    <th>Created By</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
                    @php
                        $categories = \App\Models\FaqCategory::where('status', 1)->get();
                    @endphp

                    @include('admin.faqs.modal')
                    @include('admin.partials.delete-confirmation-modal')
</div>

@section('footer_js')
<script>
$(document).ready(function() {
    var faqTable = $('#faqTable').DataTable({
        processing: true,
        serverSide: true,
        ajax: '{{ route("admin.faqs.index") }}',
        columns: [
            {data: 'id', name: 'id', width: '50px'},
            {data: 'question', name: 'question'},
            {data: 'category', name: 'category'},
            {data: 'sort_order', name: 'sort_order', width: '100px'},
            {data: 'status', name: 'status', width: '100px'},
            {data: 'created_by', name: 'created_by'},
            {
                data: 'actions',
                name: 'actions',
                orderable: false,
                searchable: false,
                render: function(data) {
                    var baseUrl = '{{ url("admin/faqs") }}';
                    return `
                        <div class="btn-group btn-group-sm">
                            <a href="${baseUrl}/${data}/edit" class="btn btn-info" title="Edit">
                                <i class="fas fa-edit"></i>
                            </a>
                            <button type="button" class="btn btn-danger btn-sm delete-confirm-btn" data-action="${baseUrl}/${data}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                }
            }
        ]
    });

    $(document).on('click', '.delete-confirm-btn', function() {
        var action = $(this).data('action');
        $('#deleteConfirmForm').attr('action', action);
        $('#deleteConfirmModal').modal('show');
    });

    $(document).on('submit', '#deleteConfirmForm', function() {
        return true;
    });

    $(document).on('submit', '#faq-modal-form', function(e) {
        e.preventDefault();
        var form = this;
        var $form = $(form);
        var $btn = $form.find('button[type="submit"]');
        $btn.prop('disabled', true);
        $('#faq-modal-errors').addClass('d-none').empty();

        var action = $form.attr('action');
        var method = ($form.find('input[name="_method"]').val() || 'POST').toUpperCase();
        var data = new FormData(form);

        $.ajax({
            url: action,
            type: method,
            headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
            data: data,
            contentType: false,
            processData: false,
            success: function(res) {
                $('#faqModal').modal('hide');
                faqTable.ajax.reload(null, false);
                $('<div class="alert alert-success mt-2">Saved successfully.</div>').prependTo('.content').delay(2500).fadeOut();
            },
            error: function(xhr) {
                if (xhr.status === 422 && xhr.responseJSON && xhr.responseJSON.errors) {
                    var errors = xhr.responseJSON.errors;
                    var $err = $('#faq-modal-errors').removeClass('d-none');
                    $.each(errors, function(k, v) { $err.append('<div>' + v[0] + '</div>'); });
                } else {
                    alert('An error occurred.');
                }
            },
            complete: function() { $btn.prop('disabled', false); }
        });
    });
});
</script>
@endsection
@endsection
