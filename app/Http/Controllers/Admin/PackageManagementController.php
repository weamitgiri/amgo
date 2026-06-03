<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePackageRequest;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Yajra\DataTables\Facades\DataTables;

class PackageManagementController extends Controller
{
    public function index(Request $request)
    {
        if ($request->ajax()) {
            $packages = Package::query()->withCount([
                'purchases as purchase_count',
                'purchases as active_users_count' => fn ($q) => $q->where('status', 'active'),
            ])->withSum('purchases as revenue_generated', 'amount');

            if ($request->filled('status')) {
                $packages->where('status', $request->string('status')->toString());
            }

            return DataTables::of($packages)
                ->addIndexColumn()
                ->addColumn('features_display', function (Package $package) {
                    $features = collect($package->features ?: [])->filter()->values();
                    return $features->isEmpty() ? '-' : e($features->implode(', '));
                })
                ->addColumn('created_date', fn (Package $package) => $package->created_at?->format('d M Y h:i A'))
                ->addColumn('actions', function (Package $package) {
                    $edit = route('admin.packages.edit', $package->id);
                    $delete = route('admin.packages.destroy', $package->id);

                    return '<a href="' . $edit . '" class="btn btn-outline-info btn-xs mr-1" title="Edit"><i class="fa fa-pen"></i></a>
                        <form method="POST" action="' . $delete . '" style="display:inline">
                            <input type="hidden" name="_token" value="' . csrf_token() . '">
                            <input type="hidden" name="_method" value="DELETE">
                            <button class="btn btn-outline-danger btn-xs delete-confirm" title="Delete"><i class="fa fa-trash"></i></button>
                        </form>';
                })
                ->rawColumns(['actions'])
                ->make(true);
        }

        return view('admin.packages.index');
    }

    public function create()
    {
        $package = new Package([
            'status' => Package::STATUS_DRAFT,
            'sort_order' => 0,
        ]);

        return view('admin.packages.create', compact('package'));
    }

    public function store(StorePackageRequest $request)
    {
        $data = $this->normalizePayload($request->validated());
        Package::create($data);

        return redirect()->route('admin.packages.index')->with('success', 'Package created successfully.');
    }

    public function edit(Package $package)
    {
        return view('admin.packages.edit', compact('package'));
    }

    public function update(StorePackageRequest $request, Package $package)
    {
        $data = $this->normalizePayload($request->validated());
        $package->update($data);

        return redirect()->route('admin.packages.index')->with('success', 'Package updated successfully.');
    }

    public function destroy(Package $package)
    {
        if ($package->purchases()->exists()) {
            return back()->with('error', 'This package has purchases and cannot be deleted.');
        }

        $package->delete();

        return back()->with('success', 'Package deleted successfully.');
    }

    public function bulkAction(Request $request)
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:packages,id'],
            'action' => ['required', 'in:activate,deactivate,draft,delete'],
        ]);

        $packages = Package::whereIn('id', $data['ids']);

        switch ($data['action']) {
            case 'activate':
                $packages->update(['status' => Package::STATUS_ACTIVE]);
                break;
            case 'deactivate':
                $packages->update(['status' => Package::STATUS_INACTIVE]);
                break;
            case 'draft':
                $packages->update(['status' => Package::STATUS_DRAFT]);
                break;
            case 'delete':
                $packages->get()->each(function (Package $package): void {
                    if (!$package->purchases()->exists()) {
                        $package->delete();
                    }
                });
                break;
        }

        return response()->json(['error' => false, 'message' => 'Bulk action applied successfully.']);
    }

    public function reorderFeatures(Request $request)
    {
        $data = $request->validate([
            'package_id' => ['required', 'exists:packages,id'],
            'features' => ['required', 'array'],
            'features.*' => ['nullable', 'string', 'max:255'],
        ]);

        $package = Package::findOrFail($data['package_id']);
        $package->features = array_values(array_filter($data['features']));
        $package->save();

        return response()->json(['error' => false, 'message' => 'Features reordered successfully.']);
    }

    private function normalizePayload(array $data): array
    {
        $features = collect($data['features'] ?? [])->map(fn ($f) => trim((string) $f))->filter()->values()->all();
        $gameAccess = collect($data['game_access'] ?? [])->map(fn ($g) => trim((string) $g))->filter()->values()->all();

        return [
            'name' => trim($data['name']),
            'slug' => Str::slug($data['slug']),
            'price' => $data['price'],
            'max_users' => $data['max_users'],
            'total_groups' => $data['total_groups'],
            'validity_days' => $data['validity_days'],
            'short_description' => $data['short_description'] ?? null,
            'features' => $features,
            'game_access' => $gameAccess,
            'status' => $data['status'],
            'sort_order' => $data['sort_order'] ?? 0,
        ];
    }
}
