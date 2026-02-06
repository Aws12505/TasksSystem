<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Attachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
    ];
    protected $appends = ['url'];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function getUrlAttribute(): ?string
    {
        if (!$this->file_path) return null;

        // since you store with ->store(..., 'public')
        return Storage::disk('public')->url($this->file_path);
    }
}
