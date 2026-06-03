<?php

namespace App\Services;

use App\Models\EmailTemplate;
use Illuminate\Support\Str;
use Exception;

class EmailTemplateService
{
    /**
     * Get email template by slug
     */
    public function getTemplateBySlug($slug)
    {
        return EmailTemplate::where('slug', $slug)->active()->first();
    }

    /**
     * Send email using template
     */
    public function sendEmail($slug, array $data = [], $to = null, $toName = null)
    {
        try {
            $template = $this->getTemplateBySlug($slug);

            if (!$template) {
                throw new Exception("Email template '{$slug}' not found or is inactive");
            }

            // Parse template with data
            $parsed = $template->parseTemplate($data);

            // Record usage
            $template->recordUsage();

            // Send email (implementation depends on your mail service)
            // Example using Laravel Mail:
            // Mail::to($to)->send(new CustomMailable(
            //     $parsed['subject'],
            //     $parsed['body'],
            //     $toName
            // ));

            return [
                'success' => true,
                'subject' => $parsed['subject'],
                'body' => $parsed['body'],
            ];
        } catch (Exception $e) {
            throw new Exception('Error sending email: ' . $e->getMessage());
        }
    }

    /**
     * Preview email template with sample data
     */
    public function previewTemplate($templateId, array $sampleData = [])
    {
        try {
            $template = EmailTemplate::findOrFail($templateId);

            // Set default sample data if not provided
            if (empty($sampleData) && $template->variables) {
                foreach ($template->variables as $variable) {
                    $sampleData[$variable] = "Sample {$variable}";
                }
            }

            return $template->parseTemplate($sampleData);
        } catch (Exception $e) {
            throw new Exception('Error previewing template: ' . $e->getMessage());
        }
    }

    /**
     * Get all active email templates
     */
    public function getAllActiveTemplates()
    {
        return EmailTemplate::active()->orderBy('name')->get();
    }

    /**
     * Get template statistics
     */
    public function getTemplateStats($templateId)
    {
        $template = EmailTemplate::findOrFail($templateId);

        return [
            'usage_count' => $template->usage_count,
            'last_used_at' => $template->last_used_at,
            'created_at' => $template->created_at,
            'updated_at' => $template->updated_at,
            'is_active' => $template->status == 1,
        ];
    }

    /**
     * Duplicate email template
     */
    public function duplicateTemplate($templateId, $newName = null)
    {
        try {
            $original = EmailTemplate::findOrFail($templateId);

            $newName = $newName ?? $original->name . ' (Copy)';
            $newSlug = Str::slug($newName);

            // Ensure unique name
            $counter = 1;
            $originalNewName = $newName;
            while (EmailTemplate::where('name', $newName)->exists()) {
                $newName = $originalNewName . ' ' . $counter;
                $counter++;
            }

            $duplicate = $original->replicate();
            $duplicate->name = $newName;
            $duplicate->slug = Str::slug($newName);
            $duplicate->usage_count = 0;
            $duplicate->last_used_at = null;
            $duplicate->save();

            return $duplicate;
        } catch (Exception $e) {
            throw new Exception('Error duplicating template: ' . $e->getMessage());
        }
    }

    /**
     * Export template
     */
    public function exportTemplate($templateId)
    {
        $template = EmailTemplate::findOrFail($templateId);

        return [
            'name' => $template->name,
            'slug' => $template->slug,
            'subject' => $template->subject,
            'body' => $template->body,
            'description' => $template->description,
            'variables' => $template->variables,
        ];
    }

    /**
     * Import template
     */
    public function importTemplate(array $templateData)
    {
        try {
            // Check if name already exists
            if (EmailTemplate::where('name', $templateData['name'])->exists()) {
                throw new Exception("Template '{$templateData['name']}' already exists");
            }

            return EmailTemplate::create($templateData);
        } catch (Exception $e) {
            throw new Exception('Error importing template: ' . $e->getMessage());
        }
    }
}
