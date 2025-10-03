<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateMyPasswordRequest;
use App\Http\Requests\UpdateMyProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
class ProfileController extends Controller
{
    public function me(): JsonResponse
    {
        $user = Auth::user()->load(['roles.permissions', 'permissions']);
        return response()->json([
            'success' => true,
            'data'    => $user,
            'message' => 'Authenticated user retrieved successfully',
        ]);
    }

    public function update(UpdateMyProfileRequest $request): JsonResponse
    {
        $user = Auth::user();

        $data = $request->safe()->only(['name','email']);
        if ($request->hasFile('avatar')) {
            if ($user->avatar_path) {
                Storage::disk('public')->delete($user->avatar_path);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar_path'] = $path;
        }

        $user->update($data);
        $user->load(['roles','permissions']);

        return response()->json([
            'success' => true,
            'data'    => $user,
            'message' => 'Profile updated successfully',
        ]);
    }

    public function updatePassword(UpdateMyPasswordRequest $request): JsonResponse
    {
        $user = Auth::user();
        $user->update([
            'password' => Hash::make($request->input('password')),
        ]);

        return response()->json([
            'success' => true,
            'data'    => null,
            'message' => 'Password updated successfully',
        ]);
    }
}
