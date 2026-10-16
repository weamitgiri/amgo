{{-- Plain POST form (deliberately NOT .ajaxform): the response is a file download. --}}
<form method="POST" action="{{ route('admin.database.export') }}"
      onsubmit="return confirm('Download a full database backup?\n\nThe file contains ALL data, including personal details and password hashes. Store it securely and never share it.');">
    @csrf
    <div class="row">
        <div class="col-md-8">
            <h5 class="mb-2">Export Database</h5>
            <p class="text-muted mb-2">
                Downloads a complete backup of the database as a <code>.sql</code> file &mdash;
                <strong>every table with all of its data</strong> (structure + rows).
                It can be re-imported later with phpMyAdmin or the <code>mysql</code> command-line client.
            </p>
            <div class="alert alert-warning py-2 mb-3">
                <i class="fas fa-exclamation-triangle mr-1"></i>
                This file contains sensitive data (user details, payments, password hashes).
                Keep it private and delete it when no longer needed.
            </div>
            <p class="text-muted small mb-3">Large databases may take a minute &mdash; the download starts automatically.</p>
        </div>
    </div>
    <div class="col-md-12 px-0">
        <button type="submit" class="btn btn-primary">
            <i class="fas fa-database mr-1"></i> Export Database
        </button>
    </div>
</form>
