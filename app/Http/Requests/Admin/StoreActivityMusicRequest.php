<?php

namespace App\Http\Requests\Admin;

use App\Models\ActivityMusic;
use App\Support\UploadLimits;
use Illuminate\Foundation\Http\FormRequest;

class StoreActivityMusicRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     * The music file is required on create and optional on update (keeps the current file).
     */
    public function rules(): array
    {
        $types = implode(',', ActivityMusic::ALLOWED_EXTENSIONS);

        return [
            'title' => 'required|string|max:150',
            'activity_id' => 'required|integer|exists:activities,id',
            'music_file' => [
                $this->isMethod('post') ? 'required' : 'nullable',
                'file',
                'extensions:' . $types,
                'mimes:' . $types,
                'max:' . ActivityMusic::MAX_KB,
            ],
            'status' => 'required|in:0,1',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        $types = strtoupper(implode(', ', ActivityMusic::ALLOWED_EXTENSIONS));

        return [
            'title.required' => 'Please enter a music title.',
            'title.max' => 'The music title may not be longer than 150 characters.',
            'activity_id.required' => 'Please choose the game activity for this music.',
            'activity_id.exists' => 'The selected game activity does not exist.',
            'music_file.required' => 'Please choose a music file to upload.',
            'music_file.file' => 'The music file failed to upload. Please try again.',
            'music_file.extensions' => 'The music file must be an ' . $types . ' file.',
            'music_file.mimes' => 'The music file is not a valid audio file. Please upload an ' . $types . ' file.',
            'music_file.max' => 'The music file may not be larger than 10 MB.',
            'music_file.uploaded' => $this->uploadErrorMessage(),
            'status.required' => 'Please select a status.',
        ];
    }

    /**
     * Why PHP rejected the upload before Laravel could read it — most often the
     * file is bigger than the server's upload_max_filesize.
     */
    private function uploadErrorMessage(): string
    {
        $file = $this->file('music_file');
        $error = $file ? $file->getError() : UPLOAD_ERR_OK;

        return match ($error) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'The music file is larger than this server accepts ('
                . self::formatBytes(UploadLimits::fileBytes()) . ', PHP upload_max_filesize). Please upload a smaller file.',
            UPLOAD_ERR_PARTIAL => 'The music file upload was interrupted. Please try again.',
            UPLOAD_ERR_NO_TMP_DIR, UPLOAD_ERR_CANT_WRITE, UPLOAD_ERR_EXTENSION => 'The server could not save the uploaded music file. Please try again or contact support.',
            default => 'The music file failed to upload. Please try again.',
        };
    }

    public static function formatBytes(int $bytes): string
    {
        if ($bytes <= 0) {
            return 'unlimited';
        }

        return $bytes >= 1048576
            ? round($bytes / 1048576, 1) . ' MB'
            : max(1, (int) round($bytes / 1024)) . ' KB';
    }
}
