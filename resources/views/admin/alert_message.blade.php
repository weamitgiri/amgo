<div class="container-fluid mt-2">
    @if(session()->has('success'))
        <div class="alert alert-success">
            <button type="button" class="close" data-dismiss="alert">&times;</button>
            {{ session()->get('success') }}
        </div>
    @endif
    @if(session()->has('error'))
        <div class="alert alert-danger">
            <button type="button" class="close" data-dismiss="alert">&times;</button>
            {{ session()->get('error') }}
        </div>
    @endif
</div>