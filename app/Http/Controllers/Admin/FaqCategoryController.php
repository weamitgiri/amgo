<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFaqCategoryRequest;
use App\Models\FaqCategory;
use Illuminate\Http\Request;

class FaqCategoryController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:admin');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            $categories = FaqCategory::with('creator')
                                     ->latest()
                                     ->paginate(15);

            $data = [];
            foreach ($categories as $category) {
                $data[] = [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'faqs_count' => $category->faqs()->count(),
                    'sort_order' => $category->sort_order,
                    'status' => $category->status_label,
                    'actions' => $category->id,
                ];
            }

            return response()->json([
                'data' => $data,
                'draw' => $request->input('draw'),
                'recordsTotal' => FaqCategory::count(),
                'recordsFiltered' => FaqCategory::count(),
            ]);
        }

        return view('admin.faq-categories.index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('admin.faq-categories.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFaqCategoryRequest $request)
    {
        FaqCategory::create($request->validated() + ['created_by' => auth()->id()]);

        return redirect()->route('admin.faq-categories.index')
                       ->with('success', 'Category created successfully!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FaqCategory $faqCategory)
    {
        return view('admin.faq-categories.edit', compact('faqCategory'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreFaqCategoryRequest $request, FaqCategory $faqCategory)
    {
        $faqCategory->update($request->validated() + ['updated_by' => auth()->id()]);

        return redirect()->route('admin.faq-categories.index')
                       ->with('success', 'Category updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FaqCategory $faqCategory)
    {
        $faqCategory->delete();

        return redirect()->route('admin.faq-categories.index')
                       ->with('success', 'Category deleted successfully!');
    }

    /**
     * Toggle category status
     */
    public function toggleStatus(Request $request)
    {
        $category = FaqCategory::findOrFail($request->category_id);
        $category->update(['status' => !$category->status]);

        return response()->json(['success' => true, 'status' => $category->status_label]);
    }
}
