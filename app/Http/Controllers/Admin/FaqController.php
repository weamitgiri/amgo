<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFaqRequest;
use App\Models\Faq;
use App\Models\FaqCategory;
use App\Services\FaqService;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    protected $faqService;

    public function __construct(FaqService $faqService)
    {
        $this->faqService = $faqService;
        $this->middleware('auth:admin');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            $faqs = Faq::with(['category', 'creator'])->latest();

            return \Yajra\DataTables\Facades\DataTables::of($faqs)
                ->addIndexColumn()
                ->addColumn('category', function ($faq) {
                    return $faq->category->name ?? 'N/A';
                })
                ->addColumn('status', function ($faq) {
                    return $faq->status_label;
                })
                ->addColumn('created_by', function ($faq) {
                    return $faq->creator->name ?? 'N/A';
                })
                ->addColumn('actions', function ($faq) {
                    return $faq->id;
                })
                ->make(true);
        }

        return view('admin.faqs.index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = FaqCategory::active()->get();

        return view('admin.faqs.create', compact('categories'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFaqRequest $request)
    {
        $this->faqService->createFaq($request->validated());

        return redirect()->route('admin.faqs.index')
                       ->with('success', 'FAQ created successfully!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Faq $faq)
    {
        $categories = FaqCategory::active()->get();

        return view('admin.faqs.edit', compact('faq', 'categories'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreFaqRequest $request, Faq $faq)
    {
        $this->faqService->updateFaq($faq, $request->validated());

        return redirect()->route('admin.faqs.index')
                       ->with('success', 'FAQ updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Faq $faq)
    {
        $this->faqService->deleteFaq($faq);

        return redirect()->route('admin.faqs.index')
                       ->with('success', 'FAQ deleted successfully!');
    }

    /**
     * Toggle FAQ featured status
     */
    public function toggleFeatured(Request $request)
    {
        $faq = Faq::findOrFail($request->faq_id);
        $faq->update(['is_featured' => !$faq->is_featured]);

        return response()->json(['success' => true, 'is_featured' => $faq->is_featured]);
    }

    /**
     * Toggle FAQ status
     */
    public function toggleStatus(Request $request)
    {
        $faq = Faq::findOrFail($request->faq_id);
        $faq->update(['status' => !$faq->status]);

        return response()->json(['success' => true, 'status' => $faq->status_label]);
    }
}
