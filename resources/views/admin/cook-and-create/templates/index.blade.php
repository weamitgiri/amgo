@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6"><h1 class="m-0">Cook &amp; Create — Templates</h1></div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item active">Cook &amp; Create — Templates</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <section class="content">
        <div class="container-fluid">
            @include('admin.cook-and-create.partials.subnav', ['ccActive' => 'admin.cook-and-create.templates'])

            @if (isset($incompleteGames) && $incompleteGames->isNotEmpty())
                <div class="alert alert-warning">
                    <h5><i class="fas fa-exclamation-triangle"></i> Incomplete Cook &amp; Create games</h5>
                    <p class="mb-2">
                        These games have no template, or their template has fewer than 4 ingredients selected —
                        either way, Round 1 will fail to load for any group assigned to them. Organizers can't be
                        safely booked against them until fixed.
                    </p>
                    <ul class="mb-0">
                        @foreach ($incompleteGames as $game)
                            <li>
                                <strong>{{ $game->title }}</strong> — {{ $game->activity->title ?? 'Unknown activity' }} (activity_games #{{ $game->id }})
                                <a href="{{ route('admin.cook-and-create.templates.create') }}" class="ml-2">Add / fix a template for this game →</a>
                            </li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <div class="card">
                <div class="card-header">
                    <a href="{{ route('admin.cook-and-create.templates.create') }}" class="btn btn-primary btn-sm">
                        <i class="fas fa-plus"></i> Add Template
                    </a>
                </div>
                <div class="card-body">
                    <p class="text-muted">
                        A template drives one Cook &amp; Create game (round timers, ingredient pool, impostor bias
                        card, and per-round clues). Each template is tied to one Activity Game record — most events
                        only need one active template.
                    </p>
                    <div class="table-responsive">
                        <table class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th style="width:60px">ID</th>
                                    <th>Name</th>
                                    <th>Activity Game</th>
                                    <th style="width:90px">Ingredients</th>
                                    <th>Round Timers (1 / 2-submit / 2-review / 3-discuss / 3-vote)</th>
                                    <th style="width:110px">Show Host</th>
                                    <th style="width:100px">Status</th>
                                    <th style="width:140px">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($templates as $template)
                                    <tr>
                                        <td>{{ $template->id }}</td>
                                        <td>{{ $template->name }}</td>
                                        <td>
                                            {{ $template->activityGame->title ?? '—' }}
                                            <span class="text-muted small d-block">{{ $template->activityGame->activity->title ?? '' }}</span>
                                        </td>
                                        <td>
                                            @php $ingCount = $template->templateIngredients->count(); @endphp
                                            <span class="badge {{ $ingCount >= 4 ? 'badge-success' : 'badge-danger' }}">{{ $ingCount }}</span>
                                        </td>
                                        <td class="text-monospace small" title="R1 / R2 per-player turn / R2 review / R3 discussion / R3 voting">
                                            {{ $template->round1_timer_secs }}s /
                                            {{ $template->round2_submit_timer_secs }}s /
                                            {{ $template->round2_review_timer_secs }}s /
                                            {{ $template->round3_discussion_timer_secs }}s /
                                            {{ $template->round3_voting_timer_secs }}s
                                        </td>
                                        <td>
                                            @if ($template->show_host_role_enabled)
                                                <span class="badge badge-info">Enabled</span>
                                            @else
                                                <span class="badge badge-secondary">Off</span>
                                            @endif
                                        </td>
                                        <td>
                                            <span class="badge {{ $template->status === 'active' ? 'badge-success' : 'badge-secondary' }}">
                                                {{ ucfirst($template->status) }}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <a href="{{ route('admin.cook-and-create.templates.edit', $template) }}" class="btn btn-info"><i class="fas fa-edit"></i></a>
                                                <form action="{{ route('admin.cook-and-create.templates.destroy', $template) }}" method="POST" style="display:inline;">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-danger" onclick="return confirm('Delete this template? Groups currently playing on it will be unaffected, but it can no longer be assigned to new groups.');"><i class="fas fa-trash"></i></button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr><td colspan="8" class="text-center text-muted">No templates yet.</td></tr>
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
