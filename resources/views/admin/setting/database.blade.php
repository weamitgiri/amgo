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

<hr class="my-4">

{{-- Danger zone: permanently clears organizer, participant & payment data only. --}}
<div class="card card-outline card-danger mb-0">
    <div class="card-header">
        <h5 class="card-title text-danger mb-0">
            <i class="fas fa-trash-alt mr-1"></i> Clear Organizer &amp; Participant Data
        </h5>
    </div>
    <div class="card-body">
        <p class="mb-2">Permanently deletes:</p>
        <ul class="mb-2">
            <li>All registered organizers (organizations), their bookings, billing / GST details and notifications</li>
            <li>All payments and Razorpay webhook records</li>
            <li>All participants who joined, their groups and all game-session data (Mystery Quest &amp; Cook &amp; Create)</li>
            <li>Generated result PDFs and invoice PDFs</li>
        </ul>
        <p class="text-success mb-3">
            <i class="fas fa-check-circle mr-1"></i>
            <strong>Not deleted:</strong> settings, activities, games, packages, game content (stories, roles, clues,
            Cook &amp; Create templates &amp; ingredients), CMS pages, blogs, FAQs, email templates, admin users &amp; roles.
        </p>
        <div class="alert alert-danger py-2">
            <i class="fas fa-exclamation-triangle mr-1"></i>
            This cannot be undone. Export the database above first if you may need this data later.
        </div>

        <form method="POST" action="{{ route('admin.data.clear') }}" class="ajaxform" id="clearDataForm"
              onsubmit="return confirm('Permanently delete ALL organizer, participant and payment data?\n\nThis cannot be undone.');">
            @csrf
            <div class="row">
                <div class="col-md-6 form-group">
                    <label for="confirm_text">Type <code>{{ \App\Http\Controllers\Admin\DataResetController::CONFIRM_PHRASE }}</code> to confirm <span class="text-danger">*</span></label>
                    <input name="confirm_text" id="confirm_text" type="text" class="form-control" autocomplete="off"
                           placeholder="{{ \App\Http\Controllers\Admin\DataResetController::CONFIRM_PHRASE }}">
                </div>
                <div class="col-md-6 form-group">
                    <label for="clear_password">Your admin password <span class="text-danger">*</span></label>
                    <input name="password" id="clear_password" type="password" class="form-control" autocomplete="current-password">
                </div>
            </div>
            <button type="submit" class="btn btn-danger">
                <i class="fas fa-trash-alt mr-1"></i> Clear All Organizer &amp; Participant Data
            </button>
        </form>
    </div>
</div>
