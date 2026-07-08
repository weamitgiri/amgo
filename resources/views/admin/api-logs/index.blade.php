@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1>API Error Logs</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.index') }}">Home</a></li>
                        <li class="breadcrumb-item active">API Logs</li>
                    </ol>
                </div>
            </div>
        </div>
    </section>

    <section class="content">
        <div class="container-fluid">

            @if(session('success'))
                <div class="alert alert-success alert-dismissible">
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                    {{ session('success') }}
                </div>
            @endif
            @if(session('error'))
                <div class="alert alert-danger alert-dismissible">
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                    {{ session('error') }}
                </div>
            @endif

            {{-- Summary cards --}}
            <div class="row">
                <div class="col-md-3 col-6">
                    <div class="small-box bg-danger">
                        <div class="inner">
                            <h3>{{ $counts['error'] }}</h3>
                            <p>Errors (last 500 lines)</p>
                        </div>
                        <div class="icon"><i class="fas fa-exclamation-circle"></i></div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="small-box bg-warning">
                        <div class="inner">
                            <h3>{{ $counts['warn'] }}</h3>
                            <p>Warnings</p>
                        </div>
                        <div class="icon"><i class="fas fa-exclamation-triangle"></i></div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="small-box bg-info">
                        <div class="inner">
                            <h3>{{ $counts['info'] + $counts['http'] + $counts['debug'] }}</h3>
                            <p>Info / Debug</p>
                        </div>
                        <div class="icon"><i class="fas fa-info-circle"></i></div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="small-box bg-secondary">
                        <div class="inner">
                            <h3 style="font-size:1.2rem; margin-top:8px;">{{ $fileInfo['exists'] ? number_format($fileInfo['size'] / 1024, 1) . ' KB' : 'N/A' }}</h3>
                            <p>File size &middot; Updated {{ $fileInfo['modified'] ?? '—' }}</p>
                        </div>
                        <div class="icon"><i class="fas fa-file-alt"></i></div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        Node API Logs
                        <small class="text-muted ml-2">(apis/logs/{{ $file }}.log — latest 500 lines, newest first)</small>
                    </h3>
                    <div class="card-tools">
                        <a href="{{ route('admin.api-logs.index', array_merge(request()->query(), ['refresh' => time()])) }}" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </a>
                        <form method="POST" action="{{ route('admin.api-logs.clear') }}" style="display:inline"
                              onsubmit="return confirm('Clear the {{ $file }} log file? This cannot be undone.');">
                            @csrf
                            <input type="hidden" name="file" value="{{ $file }}">
                            <button type="submit" class="btn btn-sm btn-outline-danger">
                                <i class="fas fa-trash"></i> Clear Log
                            </button>
                        </form>
                    </div>
                </div>

                <div class="card-body">
                    {{-- Filters --}}
                    <form method="GET" action="{{ route('admin.api-logs.index') }}" class="form-inline mb-3">
                        <select name="file" class="form-control form-control-sm mr-2" onchange="this.form.submit()">
                            <option value="error" {{ $file === 'error' ? 'selected' : '' }}>error.log (errors only)</option>
                            <option value="all" {{ $file === 'all' ? 'selected' : '' }}>all.log (everything)</option>
                        </select>
                        <select name="level" class="form-control form-control-sm mr-2" onchange="this.form.submit()">
                            <option value="">All levels</option>
                            @foreach(['error', 'warn', 'info', 'http', 'debug'] as $lvl)
                                <option value="{{ $lvl }}" {{ $level === $lvl ? 'selected' : '' }}>{{ strtoupper($lvl) }}</option>
                            @endforeach
                        </select>
                        <input type="text" name="search" value="{{ $search }}" class="form-control form-control-sm mr-2"
                               placeholder="Search message..." style="min-width:220px;">
                        <button type="submit" class="btn btn-sm btn-primary mr-1"><i class="fas fa-search"></i> Filter</button>
                        @if($level !== '' || $search !== '')
                            <a href="{{ route('admin.api-logs.index', ['file' => $file]) }}" class="btn btn-sm btn-outline-secondary">Reset</a>
                        @endif
                    </form>

                    @if(!$fileInfo['exists'])
                        <div class="alert alert-warning mb-0">
                            Log file not found at <code>apis/logs/{{ $file }}.log</code>. Make sure the Node API server has run at least once.
                        </div>
                    @elseif(count($entries) === 0)
                        <div class="alert alert-success mb-0">
                            <i class="fas fa-check-circle"></i> No log entries match — the API looks healthy.
                        </div>
                    @else
                        <div class="table-responsive" style="max-height: 65vh; overflow-y: auto;">
                            <table class="table table-sm table-bordered table-hover mb-0">
                                <thead class="thead-light" style="position: sticky; top: 0;">
                                    <tr>
                                        <th style="width:170px;">Timestamp</th>
                                        <th style="width:80px;">Level</th>
                                        <th>Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($entries as $entry)
                                        <tr>
                                            <td class="text-nowrap text-muted">{{ $entry['timestamp'] ?? '—' }}</td>
                                            <td>
                                                @php
                                                    $badge = ['error' => 'danger', 'warn' => 'warning', 'info' => 'info', 'http' => 'primary', 'debug' => 'secondary'][$entry['level']] ?? 'secondary';
                                                @endphp
                                                <span class="badge badge-{{ $badge }}">{{ strtoupper($entry['level']) }}</span>
                                            </td>
                                            <td style="font-family: monospace; font-size: 12px; word-break: break-word;">{{ $entry['message'] }}</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </section>
</div>
@endsection
