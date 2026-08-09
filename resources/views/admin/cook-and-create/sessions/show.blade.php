@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6"><h1 class="m-0">Session #{{ $session->id }}</h1></div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.cook-and-create.sessions.index') }}">Cook &amp; Create — Sessions</a></li>
                        <li class="breadcrumb-item active">#{{ $session->id }}</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <section class="content">
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header"><strong>Overview</strong></div>
                        <div class="card-body">
                            <dl class="mb-0">
                                <dt>Organizer</dt>
                                <dd>{{ $session->group?->booking?->organizer?->company_name ?? $session->group?->booking?->organizer?->name ?? '—' }}</dd>
                                <dt>Group</dt>
                                <dd>{{ $session->group?->group_name ?? '—' }} (game_groups #{{ $session->group_id }})</dd>
                                <dt>Template</dt>
                                <dd>{{ $session->template?->name ?? '—' }}</dd>
                                <dt>Status</dt>
                                <dd><span class="badge badge-info">{{ ucfirst(str_replace('_', ' ', $session->status)) }}</span>
                                    @if ($session->status === 'round2')
                                        <span class="badge badge-secondary">{{ ucfirst($session->round2_phase) }}</span>
                                    @endif
                                </dd>
                                <dt>Dish Name</dt>
                                <dd>{{ $session->dish_name ?? '—' }}</dd>
                                <dt>Outcome</dt>
                                <dd>
                                    @if (is_null($session->group_won))
                                        <span class="text-muted">Not finished</span>
                                    @elseif ($session->group_won)
                                        <span class="badge badge-success">Group caught the impostor</span>
                                    @else
                                        <span class="badge badge-danger">Impostor escaped</span>
                                    @endif
                                </dd>
                                <dt>Finished At</dt>
                                <dd>{{ $session->finished_at?->format('d M Y, h:i A') ?? '—' }}</dd>
                            </dl>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header"><strong>Roles</strong> <span class="text-muted small">(admin view — never shown to players before reveal)</span></div>
                        <div class="card-body">
                            <p><strong>Impostor:</strong> {{ $session->impostor?->name ?? 'Not assigned yet' }}</p>
                            <p class="mb-0"><strong>Show Host:</strong> {{ $session->showHost?->name ?? ($session->template?->show_host_role_enabled ? 'Not assigned yet' : 'Role disabled for this template') }}</p>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header"><strong>Participants</strong></div>
                        <div class="card-body p-0">
                            <table class="table table-sm mb-0">
                                <tbody>
                                    @foreach ($participants as $p)
                                        <tr>
                                            <td>{{ $p->name ?? '(purged)' }}</td>
                                            <td class="text-right">
                                                @if ($p->id === $session->impostor_participant_id)
                                                    <span class="badge badge-danger">Impostor</span>
                                                @elseif ($p->id === $session->show_host_participant_id)
                                                    <span class="badge badge-info">Show Host</span>
                                                @endif
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header"><strong>Round 1 — Ingredient Votes</strong></div>
                        <div class="card-body p-0">
                            <table class="table table-sm mb-0">
                                <thead><tr><th>Ingredient</th><th class="text-right">Votes</th></tr></thead>
                                <tbody>
                                    @forelse ($round1Votes as $v)
                                        <tr><td>{{ $v->name }}</td><td class="text-right">{{ $v->votes }}</td></tr>
                                    @empty
                                        <tr><td colspan="2" class="text-muted text-center">No votes cast yet.</td></tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header"><strong>Round 2 — Cooking Steps</strong></div>
                        <div class="card-body p-0">
                            <table class="table table-sm mb-0">
                                <thead><tr><th style="width:40px">#</th><th>Step</th><th style="width:100px">Outcome</th></tr></thead>
                                <tbody>
                                    @forelse ($round2Steps as $s)
                                        <tr>
                                            <td>{{ $s->step_letter }}</td>
                                            <td>{{ $s->step_text }}</td>
                                            <td>
                                                @if ($s->status === 'kept')
                                                    <span class="badge badge-success">Kept</span>
                                                @elseif ($s->status === 'removed')
                                                    <span class="badge badge-danger">Removed</span>
                                                @else
                                                    <span class="badge badge-secondary">Pending</span>
                                                @endif
                                            </td>
                                        </tr>
                                    @empty
                                        <tr><td colspan="3" class="text-muted text-center">No steps submitted yet.</td></tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header"><strong>Round 3 — Discussion</strong></div>
                        <div class="card-body" style="max-height:260px; overflow-y:auto;">
                            @forelse ($round3Messages as $m)
                                <p class="mb-1">
                                    <strong>{{ $m->participant_name ?? '(purged)' }}</strong>
                                    @if ($m->is_impostor_private) <span class="badge badge-dark">private</span> @endif
                                    — {{ $m->message }}
                                </p>
                            @empty
                                <p class="text-muted mb-0">No messages sent yet.</p>
                            @endforelse
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header"><strong>Round 3 — Votes</strong></div>
                                <div class="card-body p-0">
                                    <table class="table table-sm mb-0">
                                        <thead><tr><th>Voted For</th><th class="text-right">Votes</th></tr></thead>
                                        <tbody>
                                            @forelse ($round3Votes as $v)
                                                <tr><td>{{ $v->voted_for_name }}</td><td class="text-right">{{ $v->votes }}</td></tr>
                                            @empty
                                                <tr><td colspan="2" class="text-muted text-center">No votes cast yet.</td></tr>
                                            @endforelse
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header"><strong>Awards Received</strong></div>
                                <div class="card-body p-0">
                                    <table class="table table-sm mb-0">
                                        <thead><tr><th>Category</th><th class="text-right">Nominations</th></tr></thead>
                                        <tbody>
                                            @forelse ($ratingsReceived as $r)
                                                <tr><td>{{ $r->emoji }} {{ $r->name }}</td><td class="text-right">{{ $r->nominations }}</td></tr>
                                            @empty
                                                <tr><td colspan="2" class="text-muted text-center">No nominations yet.</td></tr>
                                            @endforelse
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>
@endsection
