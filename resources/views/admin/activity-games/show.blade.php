@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1>Game Details: {{ $game->title }}</h1>
                </div>
                <div class="col-sm-6 text-right">
                    <a href="{{ route('admin.activity-games.index', $activity->id) }}" class="btn btn-secondary">
                        <i class="fas fa-arrow-left mr-1"></i> Back to List
                    </a>
                    <a href="{{ route('admin.activity-games.edit', [$activity->id, $game->id]) }}" class="btn btn-primary">
                        <i class="fas fa-edit mr-1"></i> Edit Game
                    </a>
                </div>
            </div>
        </div>
    </section>

    <section class="content">
        <div class="container-fluid">
            <!-- Summary Card -->
            <div class="card card-primary card-outline">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-info-circle mr-2"></i>General Information</h3>
                    <div class="card-tools">
                        <button type="button" class="btn btn-tool" data-card-widget="collapse"><i class="fas fa-minus"></i></button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4">
                            <strong><i class="fas fa-tag mr-1"></i> Status</strong>
                            <p class="text-muted">
                                <span class="badge badge-{{ $game->status === 'active' ? 'success' : 'secondary' }}">{{ ucfirst($game->status) }}</span>
                            </p>
                        </div>
                        <div class="col-md-4">
                            <strong><i class="fas fa-bullhorn mr-1"></i> Tagline</strong>
                            <p class="text-muted">{{ $game->tagline ?? 'No tagline set' }}</p>
                        </div>
                        <div class="col-md-4">
                            <strong><i class="fas fa-calendar mr-1"></i> Created At</strong>
                            <p class="text-muted">{{ $game->created_at->format('M d, Y H:i') }}</p>
                        </div>
                        <div class="col-md-12 border-top pt-3">
                            <strong><i class="fas fa-book-open mr-1"></i> Case Summary</strong>
                            <div class="mt-2 border p-3 rounded bg-light">
                                {!! $game->case_summary !!}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Roles Card (Collapsible) -->
            <div class="card card-warning card-outline mt-4">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-users mr-2"></i>Game Roles ({{ $game->roles->count() }})</h3>
                    <div class="card-tools">
                        <button type="button" class="btn btn-tool" data-card-widget="collapse"><i class="fas fa-minus"></i></button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        @foreach($game->roles as $role)
                            <div class="col-md-6 mb-4">
                                <div class="card h-100 shadow-sm border-left border-warning">
                                    <div class="card-header bg-light">
                                        <h5 class="card-title text-uppercase font-weight-bold">{{ $role->role_type }}</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="media">
                                            @if($role->role_image)
                                                <img src="{{ asset('storage/' . $role->role_image) }}" class="mr-3 img-thumbnail" style="width: 80px; height: 80px; object-fit: cover;">
                                            @endif
                                            <div class="media-body">
                                                <h5 class="mt-0">{{ $role->character_name }}</h5>
                                                <p class="text-primary small mb-1">{{ $role->subtitle }}</p>
                                                <p class="small"><strong>Objective:</strong> {{ $role->objective }}</p>
                                            </div>
                                        </div>
                                        <div class="mt-3">
                                            <button class="btn btn-xs btn-outline-info" type="button" data-toggle="collapse" data-target="#role-details-{{ $role->id }}">
                                                View Strategy & Knowledge
                                            </button>
                                            <div class="collapse mt-2" id="role-details-{{ $role->id }}">
                                                <div class="p-2 bg-light rounded">
                                                    <h6><small class="font-weight-bold text-info">WHAT YOU KNOW:</small></h6>
                                                    <ul class="pl-3 small">
                                                        @foreach($role->what_you_know ?? [] as $know) <li>{{ $know }}</li> @endforeach
                                                    </ul>
                                                    <h6><small class="font-weight-bold text-warning">KEEP IN MIND:</small></h6>
                                                    <ul class="pl-3 small">
                                                        @foreach($role->keep_in_mind ?? [] as $mind) <li>{{ $mind }}</li> @endforeach
                                                    </ul>
                                                    <hr>
                                                    <h6><small class="font-weight-bold">STRATEGY CARDS:</small></h6>
                                                    @foreach($role->strategyCards as $card)
                                                        <div class="mb-2 p-1 border rounded bg-white">
                                                            <div class="d-flex justify-content-between align-items-center">
                                                                <span class="badge badge-info">#{{ $card->card_number }}</span>
                                                                <span class="small font-weight-bold" style="color: {{ $card->heading_color }}">{{ $card->heading }}</span>
                                                            </div>
                                                            <div class="small mt-1">{!! $card->body_content !!}</div>
                                                        </div>
                                                    @endforeach
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>

            <!-- Investigation Content (Collapsible) -->
            <div class="card card-info card-outline mt-4">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-search mr-2"></i>Investigation Assets</h3>
                    <div class="card-tools">
                        <button type="button" class="btn btn-tool" data-card-widget="collapse"><i class="fas fa-minus"></i></button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4">
                            <h5>Timeline</h5>
                            <div class="timeline-v2 border-left pl-3 ml-2 mt-3">
                                @foreach($game->timeline ?? [] as $item)
                                    <div class="mb-3 position-relative">
                                        <i class="fas fa-circle text-info position-absolute" style="left: -21px; top: 5px; font-size: 10px;"></i>
                                        <strong class="small text-primary d-block">{{ $item['time'] }}</strong>
                                        <span class="small">{{ $item['event'] }}</span>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                        <div class="col-md-4">
                            <h5>Quick Facts</h5>
                            <ul class="list-group list-group-flush mt-3">
                                <li class="list-group-item px-0 d-flex justify-content-between">
                                    <span class="text-muted small">Location</span>
                                    <span class="small">{{ $game->quick_facts['location'] ?? 'N/A' }}</span>
                                </li>
                                <li class="list-group-item px-0 d-flex justify-content-between">
                                    <span class="text-muted small">Date/Time</span>
                                    <span class="small">{{ $game->quick_facts['date_time'] ?? 'N/A' }}</span>
                                </li>
                                <li class="list-group-item px-0 d-flex justify-content-between">
                                    <span class="text-muted small">Weather</span>
                                    <span class="small">{{ $game->quick_facts['weather'] ?? 'N/A' }}</span>
                                </li>
                                <li class="list-group-item px-0 d-flex justify-content-between">
                                    <span class="text-muted small">CCTV Status</span>
                                    <span class="small">{{ $game->quick_facts['cctv_status'] ?? 'N/A' }}</span>
                                </li>
                            </ul>
                        </div>
                        <div class="col-md-4">
                            <h5>Photos</h5>
                            <div class="row mt-3">
                                @foreach($game->photos as $photo)
                                    <div class="col-6 mb-2">
                                        <a href="{{ asset('storage/' . $photo->image) }}" target="_blank">
                                            <img src="{{ asset('storage/' . $photo->image) }}" class="img-fluid rounded shadow-sm" title="{{ $photo->label }}">
                                        </a>
                                        <div class="small text-center text-muted mt-1">{{ $photo->label }}</div>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Results Content (Collapsible) -->
            <div class="card card-success card-outline mt-4 mb-5">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-check-circle mr-2"></i>Results & Reveal</h3>
                    <div class="card-tools">
                        <button type="button" class="btn btn-tool" data-card-widget="collapse"><i class="fas fa-minus"></i></button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-12">
                            <h5>Full Story Parts</h5>
                            <div class="accordion mt-3" id="storyAccordion">
                                @foreach($game->fullStory as $story)
                                    <div class="card mb-1">
                                        <div class="card-header p-2" id="heading{{ $story->id }}">
                                            <button class="btn btn-link btn-block text-left font-weight-bold" type="button" data-toggle="collapse" data-target="#collapse{{ $story->id }}">
                                                Part #{{ $story->part_number }}: {{ $story->part_title }}
                                            </button>
                                        </div>
                                        <div id="collapse{{ $story->id }}" class="collapse" data-parent="#storyAccordion">
                                            <div class="card-body bg-light small">
                                                {!! $story->part_body !!}
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </section>
</div>
@endsection
