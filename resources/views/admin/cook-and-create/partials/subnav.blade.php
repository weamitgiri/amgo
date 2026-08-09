@php
    $ccActive = $ccActive ?? request()->route()->getName();
@endphp
<ul class="nav nav-tabs mb-3">
    <li class="nav-item">
        <a class="nav-link {{ str_starts_with($ccActive, 'admin.cook-and-create.templates') ? 'active' : '' }}"
           href="{{ route('admin.cook-and-create.templates.index') }}">
            <i class="fas fa-scroll mr-1"></i> Templates
        </a>
    </li>
    <li class="nav-item">
        <a class="nav-link {{ str_starts_with($ccActive, 'admin.cook-and-create.ingredients') ? 'active' : '' }}"
           href="{{ route('admin.cook-and-create.ingredients.index') }}">
            <i class="fas fa-carrot mr-1"></i> Ingredients
        </a>
    </li>
    <li class="nav-item">
        <a class="nav-link {{ str_starts_with($ccActive, 'admin.cook-and-create.rating-categories') ? 'active' : '' }}"
           href="{{ route('admin.cook-and-create.rating-categories.index') }}">
            <i class="fas fa-trophy mr-1"></i> Award Categories
        </a>
    </li>
    <li class="nav-item">
        <a class="nav-link {{ str_starts_with($ccActive, 'admin.cook-and-create.sessions') ? 'active' : '' }}"
           href="{{ route('admin.cook-and-create.sessions.index') }}">
            <i class="fas fa-list mr-1"></i> Sessions
        </a>
    </li>
</ul>
