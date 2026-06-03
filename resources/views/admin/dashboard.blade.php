@extends('admin.layouts.default')

@section('header_css')
<style>
    .info-box {
        box-shadow: 0 0 1px rgba(0,0,0,.125), 0 1px 3px rgba(0,0,0,.2);
        border-radius: 0.5rem;
        padding: 1rem;
    }
    .info-box .info-box-icon {
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.875rem;
        width: 70px;
    }
    .stat-card {
        border: none;
        border-radius: 1rem;
        transition: transform 0.3s;
    }
    .stat-card:hover {
        transform: translateY(-5px);
    }
    .quick-action-btn {
        border-radius: 0.5rem;
        padding: 1rem;
        text-align: center;
        transition: all 0.3s;
        border: 1px solid #eee;
        background: #fff;
        color: #333;
        display: block;
        text-decoration: none;
    }
    .quick-action-btn:hover {
        background: #f8f9fa;
        border-color: #007bff;
        color: #007bff;
        text-decoration: none;
        box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    .quick-action-btn i {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        display: block;
    }
</style>
@endsection

@section('content') 

<div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0 text-dark">Welcome, <strong>{{Auth::guard('admin')->user()->name}}</strong></h1>
            <p class="text-muted">Here is what's happening today.</p>
        </div>
        <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item active">Dashboard</li>
          </ol>
      </div>
  </div>
</div>
</div>

    <!-- Main content -->
    <section class="content">
          <div class="container-fluid">
            
            <!-- Summary Stats -->
            <div class="row">
                <div class="col-md-3 col-sm-6 col-12">
                    <div class="info-box bg-gradient-primary">
                        <span class="info-box-icon"><i class="fas fa-gamepad"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Total Games</span>
                            <span class="info-box-number h3">{{ $stats['total_games'] }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 col-12">
                    <div class="info-box bg-gradient-success">
                        <span class="info-box-icon"><i class="fas fa-check-circle"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Active Games</span>
                            <span class="info-box-number h3">{{ $stats['active_games'] }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 col-12">
                    <div class="info-box bg-gradient-info">
                        <span class="info-box-icon"><i class="fas fa-file-alt"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">CMS Pages</span>
                            <span class="info-box-number h3">{{ $stats['total_cms'] }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-sm-6 col-12">
                    <div class="info-box bg-gradient-warning">
                        <span class="info-box-icon"><i class="fas fa-users"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Total Users</span>
                            <span class="info-box-number h3">{{ $stats['total_users'] }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mt-4">
                <!-- Quick Actions -->
                <div class="col-md-6">
                    <div class="card stat-card shadow-sm mb-4">
                        <div class="card-header bg-white">
                            <h3 class="card-title font-weight-bold"><i class="fas fa-bolt mr-2 text-warning"></i> Quick Actions</h3>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-6 mb-3">
                                    <a href="{{ route('admin.activities.index') }}" class="quick-action-btn">
                                        <i class="fas fa-plus-circle text-primary"></i>
                                        Manage Activities
                                    </a>
                                </div>
                                <div class="col-6 mb-3">
                                    <a href="{{ route('admin.cms.index') }}" class="quick-action-btn">
                                        <i class="fas fa-file-alt text-success"></i>
                                        CMS Pages
                                    </a>
                                </div>
                                <div class="col-6">
                                    <a href="{{ route('admin.blogs.index') }}" class="quick-action-btn">
                                        <i class="fas fa-blog text-info"></i>
                                        Blogs
                                    </a>
                                </div>
                                <div class="col-6">
                                    <a href="{{ route('admin.setting') }}" class="quick-action-btn">
                                        <i class="fas fa-cogs text-secondary"></i>
                                        Settings
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- System Info -->
                <div class="col-md-6">
                    <div class="card stat-card shadow-sm">
                        <div class="card-header bg-white border-0">
                            <h3 class="card-title font-weight-bold"><i class="fas fa-info-circle mr-2 text-info"></i> System Information</h3>
                        </div>
                        <div class="card-body">
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    Laravel Version
                                    <span class="badge badge-primary badge-pill">{{ app()->version() }}</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    PHP Version
                                    <span class="badge badge-info badge-pill">{{ PHP_VERSION }}</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    Environment
                                    <span class="badge badge-success badge-pill">{{ app()->environment() }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

        </div><!--/. container-fluid -->

    </section>

</div>
@endsection
