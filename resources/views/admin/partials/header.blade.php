 <!-- Navbar -->
 <nav class="main-header navbar navbar-expand navbar-white navbar-light">
    <!-- Left navbar links -->
    <ul class="navbar-nav">
      <li class="nav-item">
        <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
    </li>
</ul>

<!-- Right navbar links -->
<ul class="navbar-nav ml-auto">
  <li class="nav-item">
      <div id="google_translate_element" class="ml-5 mt-1"></div>
     
  </li>

<li class="nav-item dropdown headerProfile">
  <a class="nav-link text-dark" data-toggle="dropdown" href="#">
      @php $admin = auth('admin')->user(); @endphp
      @if($admin && $admin->profile_photo_path)
          <img src="{{ url('admin/showImage/storage/'.$admin->profile_photo_path) }}" alt="User Profile" class="rounded-circle" width="40" height="40" />
      @else
          <img src="{{ asset('front/assets/images/profile.png') }}" alt="User Profile" class="rounded-circle" width="40" height="40" />
      @endif
      <span class="badge badge-danger navbar-badge"></span>
  </a>
  <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
      <a href="{{ url('admin/profile')}}" class="dropdown-item"><i class="fa fa-user-circle"></i> Profile</a>
      <div class="dropdown-divider"></div>
      <a href="{{ url('admin/settings') }}" class="dropdown-item"><i class="fa fa-cog"></i> Setting</a>
      <a href="{{ url('admin/logout')}}" class="dropdown-item"><i class="fa fa-sign-out-alt"></i> Logout</a>
  </div>
</li>
</ul>
</nav>
<!-- /.navbar -->

<!-- Main Sidebar Container -->
<aside class="main-sidebar sidebar-dark-primary elevation-4 mainSideBar">
    <!-- Brand Logo -->
    <a href="{{ url('/admin/dashboard')}}" class="brand-link mainSideAtg" style="background: #706f8a;">
        <img src="{{ asset('admin/images/logo-side.png')}}" class="brand-image brand-img-header" style="width: 70%;"/>
      <br/>
  </a>
  <br>
  <div class="sidebar">
      <nav class="mt-2">
        <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">

          @if(in_array(auth('admin')->user()->usertype, [0, 1]))
            @foreach(App\Models\Menu::getParentMenu() as $parent)   
              @php
                  $submenus = App\Models\Menu::getSubMenu($parent->id);
                  $hasSubmenu = $submenus->count() > 0;
                  $isActive = request()->is($parent->link) || request()->is($parent->link . '/*');
              @endphp

              <li class="nav-item {{ $hasSubmenu ? 'has-treeview' : '' }} {{ $isActive ? 'menu-open' : '' }}">
                  <a href="{{ $hasSubmenu ? '#' : url($parent->link) }}" class="nav-link {{ $isActive ? 'active' : '' }}">
                    <i class="nav-icon {{ $parent->icon }}"></i>
                    <p>
                      {{ $parent->name }}
                      @if($hasSubmenu)
                        <i class="fas fa-angle-left right"></i>
                      @endif
                    </p>
                  </a>
                  @if($hasSubmenu)
                  <ul class="nav nav-treeview">
                    @foreach($submenus as $submenu)
                    @php
                        $isSubActive = request()->is($submenu->link) || request()->is($submenu->link . '/*');
                    @endphp
                    <li class="nav-item">
                      <a href="{{ url($submenu->link)}}" class="nav-link {{ $isSubActive ? 'active' : '' }}">
                        <i class="far fa-circle nav-icon"></i>
                        <p>{{ $submenu->name }}</p>
                      </a>
                    </li>
                    @endforeach
                  </ul>
                  @endif
              </li>
            @endforeach

          @else

            @php
                @$managers = explode(',', auth('admin')->user()->role->managers);
            @endphp

            @foreach(App\Models\Menu::getParentMenu() as $parent)
              @if(in_array($parent->id, $managers))
                @php
                    $submenus = App\Models\Menu::getSubMenu($parent->id);
                    $filteredSubmenus = $submenus->filter(fn($s) => in_array($s->id, $managers));
                    $hasSubmenu = $filteredSubmenus->count() > 0;
                    $isActive = request()->is($parent->link) || request()->is($parent->link . '/*');
                @endphp
                <li class="nav-item {{ $hasSubmenu ? 'has-treeview' : '' }} {{ $isActive ? 'menu-open' : '' }}">
                  <a href="{{ $hasSubmenu ? '#' : url($parent->link) }}" class="nav-link {{ $isActive ? 'active' : '' }}">
                    <i class="nav-icon {{ $parent->icon }}"></i>
                    <p>
                      {{ $parent->name }}
                      @if($hasSubmenu)
                        <i class="fas fa-angle-left right"></i>
                      @endif
                    </p>
                  </a>
                  @if($hasSubmenu)
                  <ul class="nav nav-treeview">
                    @foreach($filteredSubmenus as $submenu)
                      @php
                          $isSubActive = request()->is($submenu->link) || request()->is($submenu->link . '/*');
                      @endphp
                      <li class="nav-item">
                         <a href="{{ url($submenu->link)}}" class="nav-link {{ $isSubActive ? 'active' : '' }}">
                           <i class="far fa-circle nav-icon"></i>
                           <p>{{ $submenu->name }}</p>
                         </a>
                      </li>
                    @endforeach
                  </ul>
                  @endif
                </li>
              @endif
            @endforeach
          @endif
        </ul>
      </nav>
  </div>
</aside>