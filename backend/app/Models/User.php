<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Hidden(['password', 'remember_token'])]
/**
 * @method \Laravel\Sanctum\NewAccessToken createToken(string $name, array $abilities = ['*'], \DateTimeInterface|\DateInterval|int|null $expiresAt = null)
 */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role', 'sekolah_id'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isPenguji(): bool
    {
        return in_array($this->role, ['penguji_internal', 'penguji_external']);
    }

    public function sekolah(): BelongsTo
    {
        return $this->belongsTo(Sekolah::class);
    }

    public function getSekolahIdForQuery(): ?int
    {
        if ($this->isSuperAdmin()) {
            return null;
        }

        return $this->sekolah_id;
    }
}
