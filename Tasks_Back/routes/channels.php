<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
*/

// User-specific clocking channel (private)
Broadcast::channel('clocking.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Manager clocking channel (for users with 'view all clocking sessions' permission)
Broadcast::channel('clocking.manager', function ($user) {
    return $user->can('view all clocking sessions');
});
