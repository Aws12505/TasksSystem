<?php
// Add to routes/channels.php

use Illuminate\Support\Facades\Broadcast;


Broadcast::channel('clocking.manager', function ($user) {
    return $user->can('view all clocking sessions');
});
