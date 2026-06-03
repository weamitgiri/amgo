<?php

namespace App\Services;

use App\Models\Faq;
use App\Models\FaqCategory;
use Illuminate\Support\Str;

class FaqService
{
    /**
     * Create an FAQ
     */
    public function createFaq(array $data)
    {
        $data['created_by'] = auth()->id();
        $data['updated_by'] = auth()->id();

        return Faq::create($data);
    }

    /**
     * Update an FAQ
     */
    public function updateFaq(Faq $faq, array $data)
    {
        $data['updated_by'] = auth()->id();

        return $faq->update($data) ? $faq->fresh() : $faq;
    }

    /**
     * Delete an FAQ
     */
    public function deleteFaq(Faq $faq)
    {
        return $faq->delete();
    }

    /**
     * Force delete an FAQ
     */
    public function forceDeleteFaq(Faq $faq)
    {
        return $faq->forceDelete();
    }

    /**
     * Get FAQs by category
     */
    public function getFaqsByCategory($categoryId)
    {
        return Faq::active()
                  ->where('category_id', $categoryId)
                  ->orderBy('sort_order')
                  ->get();
    }

    /**
     * Get featured FAQs
     */
    public function getFeaturedFaqs($limit = 5)
    {
        return Faq::active()
                  ->featured()
                  ->orderBy('sort_order')
                  ->limit($limit)
                  ->get();
    }

    /**
     * Search FAQs
     */
    public function searchFaqs(string $query)
    {
        return Faq::active()
                  ->where('question', 'like', "%{$query}%")
                  ->orWhere('answer', 'like', "%{$query}%")
                  ->orderBy('sort_order')
                  ->get();
    }

    /**
     * Get all active FAQs with categories
     */
    public function getAllActiveFaqs()
    {
        return FaqCategory::active()
                          ->with(['faqs' => function ($query) {
                              $query->active()->orderBy('sort_order');
                          }])
                          ->orderBy('sort_order')
                          ->get();
    }

    /**
     * Update sort order
     */
    public function updateSortOrder($categoryId, $faqs)
    {
        foreach ($faqs as $index => $faqId) {
            Faq::find($faqId)->update(['sort_order' => $index]);
        }
        return true;
    }
}
