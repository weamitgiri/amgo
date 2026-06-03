@extends(auth('admin')->check() ? 'admin.layouts.default' : 'admin.layouts.warning')

@section('content')
<div class="{{ auth('admin')->check() ? 'content-wrapper' : 'container mt-5' }}">
    @if(auth('admin')->check())
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1>404 Error Page</h1>
                </div>
            </div>
        </div>
    </section>
    @endif

    <section class="content">
        <div class="error-page text-center">
            <h2 class="headline text-warning" style="font-size: 100px;"> 404</h2>

            <div class="error-content">
                <h3><i class="fas fa-exclamation-triangle text-warning"></i> Oops! Page not found.</h3>

                <p>
                    We could not find the page you were looking for.
                    @if(auth('admin')->check())
                        Meanwhile, you may <a href="{{ route('admin.dashboard.index') }}">return to dashboard</a>.
                    @else
                        Please <a href="{{ url('/admin/login') }}">login</a> to continue.
                    @endif
                </p>
            </div>
        </div>
    </section>
</div>
@endsection
