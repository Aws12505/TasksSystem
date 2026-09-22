<?php

namespace Tests\Feature\WorkSessions;

use App\Models\User;
use App\Models\UserMonthlyRating;
use App\Models\WorkSession;
use App\Models\WorkSessionItem;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use ZipArchive;

class ExportPdfTest extends WorkSessionTestCase
{
    private const URL = '/api/work-sessions/admin/reports/export-pdf';

    private User $admin;

    private User $alice;

    private User $bob;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = $this->admin(['name' => 'Admin']);
        $this->alice = $this->employee(['name' => 'Alice Example']);
        $this->bob = $this->employee(['name' => 'Bob']);
    }

    public function test_admin_receives_a_zip_with_overview_and_one_pdf_per_user(): void
    {
        $taskId = $this->makeTask($this->alice, 'pending', ['name' => 'Linked task', 'project_name' => 'Apollo']);

        $session = WorkSession::factory()->confirmed()->onDate('2026-09-10')->create([
            'user_id' => $this->alice->id,
            'summary_note' => 'Productive day',
        ]);
        $first = WorkSessionItem::factory()->done()->create([
            'work_session_id' => $session->id, 'task_id' => $taskId, 'title' => 'Ship feature', 'outcome_note' => 'Merged',
        ]);
        WorkSessionItem::factory()->partial()->create(['work_session_id' => $session->id, 'title' => 'Review PRs']);
        WorkSessionItem::factory()->notDone()->create([
            'work_session_id' => $session->id, 'title' => 'Write tests', 'carried_from_item_id' => $first->id,
        ]);
        // An open session in the same month is listed but not counted
        $open = WorkSession::factory()->onDate('2026-09-11')->create(['user_id' => $this->alice->id]);
        WorkSessionItem::factory()->create(['work_session_id' => $open->id, 'title' => 'Pending thing']);

        UserMonthlyRating::factory()->create([
            'user_id' => $this->alice->id, 'year' => 2026, 'month' => 9, 'score' => 88.5, 'comment' => 'Great',
        ]);

        $response = $this->actingAsUser($this->admin)->postJson(self::URL, [
            'user_ids' => [$this->alice->id, $this->bob->id],
            'year' => 2026,
            'month' => 9,
        ]);

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/zip')
            ->assertDownload('work-sessions_2026-09.zip');

        /** @var BinaryFileResponse $base */
        $base = $response->baseResponse;
        $this->assertInstanceOf(BinaryFileResponse::class, $base);

        $zipPath = $base->getFile()->getPathname();
        $this->assertFileExists($zipPath);

        try {
            $zip = new ZipArchive;
            $this->assertTrue($zip->open($zipPath));

            $names = [];
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $names[] = $zip->getNameIndex($i);
            }
            sort($names);

            $this->assertSame(['00_Overview_2026_09.pdf', '01_Alice_Example.pdf', '02_Bob.pdf'], $names);

            foreach ($names as $name) {
                $this->assertStringStartsWith('%PDF', (string) $zip->getFromName($name), "$name is not a PDF");
            }

            $zip->close();
        } finally {
            @unlink($zipPath);
        }
    }

    public function test_validation_errors(): void
    {
        $this->actingAsUser($this->admin);

        $this->postJson(self::URL, [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['user_ids', 'year', 'month']);

        $this->postJson(self::URL, ['user_ids' => [999999], 'year' => 2026, 'month' => 9])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['user_ids.0']);

        $this->postJson(self::URL, ['user_ids' => [$this->alice->id], 'year' => 2026, 'month' => 13])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['month']);
    }

    public function test_employee_is_forbidden(): void
    {
        $this->actingAsUser($this->alice)
            ->postJson(self::URL, ['user_ids' => [$this->alice->id], 'year' => 2026, 'month' => 9])
            ->assertForbidden();
    }
}
