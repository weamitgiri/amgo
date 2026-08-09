<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CcRatingCategory;
use Illuminate\Http\Request;

class CookAndCreateRatingCategoryController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:admin');
    }

    public function index()
    {
        $categories = CcRatingCategory::orderBy('order')->get();
        return view('admin.cook-and-create.rating-categories.index', compact('categories'));
    }

    public function create()
    {
        return view('admin.cook-and-create.rating-categories.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'nullable|string|max:100|unique:cc_rating_categories,slug',
            'emoji' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:255',
            'order' => 'nullable|integer|min:0',
            'status' => 'required|in:active,inactive',
        ]);

        CcRatingCategory::create($validated);

        return redirect()->route('admin.cook-and-create.rating-categories.index')->with('success', 'Award category created.');
    }

    public function edit(CcRatingCategory $rating_category)
    {
        return view('admin.cook-and-create.rating-categories.edit', ['category' => $rating_category]);
    }

    public function update(Request $request, CcRatingCategory $rating_category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'nullable|string|max:100|unique:cc_rating_categories,slug,' . $rating_category->id,
            'emoji' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:255',
            'order' => 'nullable|integer|min:0',
            'status' => 'required|in:active,inactive',
        ]);

        $rating_category->update($validated);

        return redirect()->route('admin.cook-and-create.rating-categories.index')->with('success', 'Award category updated.');
    }

    public function destroy(CcRatingCategory $rating_category)
    {
        $rating_category->delete();
        return redirect()->route('admin.cook-and-create.rating-categories.index')->with('success', 'Award category deleted.');
    }
}
