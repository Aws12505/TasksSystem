<?php
// Add to routes/channels.php

use Illuminate\Support\Facades\Broadcast;


Broadcast::channel('clocking.manager', function ($user) {
    return $user->can('view all clocking sessions');
});

// Work Sessions module: admins/managers receive live session updates
Broadcast::channel('work-sessions.admin', function ($user) {
    return $user->can('view all work sessions');
});
