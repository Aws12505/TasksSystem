<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Project;
use App\Models\Section;
use App\Models\Task;
use App\Models\TaskRating;
use App\Models\StakeholderRating;
use App\Models\HelpRequest;
use App\Models\Ticket;
use App\Enums\HelpRequestRating;
use App\Enums\TicketStatus;
use App\Enums\TicketType;
use Carbon\Carbon;

class FinalRatingTestSeeder extends Seeder
{
    /**
     * Test Period: January 1-31, 2025
     * Employees: User IDs 1, 4, 5
     * Expected Results:
     * - User 1 (Alice): ~180-190 points
     * - User 4 (Bob): ~150-160 points
     * - User 5 (Charlie): ~120-130 points
     */
    public function run(): void
    {
        // Period
        $periodStart = Carbon::parse('2025-01-01');
        $periodEnd = Carbon::parse('2025-01-31');

        // Get users
        $alice = User::find(1);
        $bob = User::find(4);
        $charlie = User::find(5);

        // Create stakeholder (or use existing admin)
        $stakeholder = User::find(2); // Assuming user 2 exists

        if (!$alice || !$bob || !$charlie || !$stakeholder) {
            $this->command->error('Users 1, 2, 4, 5 must exist. Run UserSeeder first.');
            return;
        }

        $this->command->info('Creating test data for Final Rating calculation...');

        // Create Project
        $project = Project::create([
            'name' => 'Q1 2025 Development Sprint',
            'description' => 'Test project for final rating calculations',
            'stakeholder_id' => $stakeholder->id,
            'stakeholder_will_rate' => true,
            'status' => 'in_progress',
            'progress_percentage' => 65.00,
        ]);

        // Create Section
        $section = Section::create([
            'name' => 'Backend Development',
            'project_id' => $project->id,
        ]);

        $this->command->info('Creating 10 tasks...');

        // Task 1: High weight, Alice 100%, excellent rating
        $task1 = Task::create([
            'name' => 'Implement Authentication System',
            'description' => 'OAuth2 and JWT implementation',
            'weight' => 100,
            'due_date' => $periodStart->copy()->addDays(5),
            'priority' => 'critical',
            'status' => 'rated',
            'section_id' => $section->id,
        ]);
        $task1->assignedUsers()->attach($alice->id, ['percentage' => 100]);
        TaskRating::create([
            'task_id' => $task1->id,
            'rater_id' => $stakeholder->id,
            'rating_data' => [],
            'final_rating' => 95.00,
            'config_snapshot' => [],
            'rated_at' => $periodStart->copy()->addDays(6),
        ]);

        // Task 2: Medium weight, Bob 100%, good rating
        $task2 = Task::create([
            'name' => 'Build API Endpoints',
            'description' => 'RESTful API for user management',
            'weight' => 80,
            'due_date' => $periodStart->copy()->addDays(10),
            'priority' => 'high',
            'status' => 'rated',
            'section_id' => $section->id,
        ]);
        $task2->assignedUsers()->attach($bob->id, ['percentage' => 100]);
        TaskRating::create([
            'task_id' => $task2->id,
            'rater_id' => $stakeholder->id,
            'rating_data' => [],
            'final_rating' => 88.00,
            'config_snapshot' => [],
            'rated_at' => $periodStart->copy()->addDays(11),
        ]);

        // Task 3: High weight, shared by Alice (60%) and Bob (40%)
        $task3 = Task::create([
            'name' => 'Database Schema Design',
            'description' => 'Design and implement database structure',
            'weight' => 100,
            'due_date' => $periodStart->copy()->addDays(8),
            'priority' => 'critical',
            'status' => 'rated',
            'section_id' => $section->id,
        ]);
        $task3->assignedUsers()->attach([
            $alice->id => ['percentage' => 60],
            $bob->id => ['percentage' => 40],
        ]);
        TaskRating::create([
            'task_id' => $task3->id,
            'rater_id' => $stakeholder->id,
            'rating_data' => [],
            'final_rating' => 92.00,
            'config_snapshot' => [],
            'rated_at' => $periodStart->copy()->addDays(9),
        ]);

        // Task 4: Medium weight, Charlie 100%, average rating
        $task4 = Task::create([
            'name' => 'Write Unit Tests',
            'description' => 'Unit tests for authentication module',
            'weight' => 50,
            'due_date' => $periodStart->copy()->addDays(12),
            'priority' => 'medium',
            'status' => 'rated',
            'section_id' => $section->id,
        ]);
        $task4->assignedUsers()->attach($charlie->id, ['percentage' => 100]);
        TaskRating::create([
            'task_id' => $task4->id,
            'rater_id' => $stakeholder->id,
            'rating_data' => [],
            'final_rating' => 85.00,
            'config_snapshot' => [],
            'rated_at' => $periodStart->copy()->addDays(13),
        ]);

        // Task 5: Low weight, Alice 100%, excellent rating
        $task5 = Task::create([
            'name' => 'Code Review Documentation',
            'description' => 'Document code review process',
            'weight' => 20,
            'due_date' => $periodStart->copy()->addDays(15),
            'priority' => 'low',
            'status' => 'rated',
            'section_id' => $section->id,
        ]);
        $task5->assignedUsers()->attach($alice->id, ['percentage' => 100]);
        TaskRating::create([
            'task_id' => $task5->id,
            'rater_id' => $stakeholder->id,
            'rating_data' => [],
            'final_rating' => 100.00,
            'config_snapshot' => [],
            'rated_at' => $periodStart->copy()->addDays(16),
        ]);

        // Task 6: High weight, Bob (50%) and Charlie (50%)
        $task6 = Task::create([
            'name' => 'Frontend Integration',
            'description' => 'Connect frontend with API',
            'weight' => 90,
            'due_date' => $periodStart->copy()->addDays(18),
            'priority' => 'high',
            'status' => 'rated',
            'section_id' => $section->id,
        ]);
        $task6->assignedUsers()->attach([
            $bob->id => ['percentage' => 50],
            $charlie->id => ['percentage' => 50],
        ]);
        TaskRating::create([
            'task_id' => $task6->id,
            'rater_id' => $stakeholder->id,
            'rating_data' => [],
            'final_rating' => 78.00,
            'config_snapshot' => [],
            'rated_at' => $periodStart->copy()->addDays(19),
        ]);

        // Task 7: Medium weight, Charlie 100%, below average
        $task7 = Task::create([
            'name' => 'Bug Fixes',
            'description' => 'Fix reported bugs in the system',
            'weight' => 60,
            'due_date' => $periodStart->copy()->addDays(20),
            'priority' => 'high',
            'status' => 'rated',
            'section_id' => $section->id,
        ]);
        $task7->assignedUsers()->attach($charlie->id, ['percentage' => 100]);
        TaskRating::create([
            'task_id' => $task7->id,
            'rater_id' => $stakeholder->id,
            'rating_data' => [],
            'final_rating' => 72.00,
            'config_snapshot' => [],
            'rated_at' => $periodStart->copy()->addDays(21),
        ]);

        // Task 8: Low weight, Alice (70%), Bob (30%)
        $task8 = Task::create([
            'name' => 'Update Dependencies',
            'description' => 'Update project dependencies',
            'weight' => 30,
            'due_date' => $periodStart->copy()->addDays(22),
            'priority' => 'low',
            'status' => 'rated',
            'section_id' => $section->id,
        ]);
        $task8->assignedUsers()->attach([
            $alice->id => ['percentage' => 70],
            $bob->id => ['percentage' => 30],
        ]);
        TaskRating::create([
            'task_id' => $task8->id,
            'rater_id' => $stakeholder->id,
            'rating_data' => [],
            'final_rating' => 90.00,
            'config_snapshot' => [],
            'rated_at' => $periodStart->copy()->addDays(23),
        ]);

        // Task 9: High weight, Alice (40%), Bob (30%), Charlie (30%)
        $task9 = Task::create([
            'name' => 'Performance Optimization',
            'description' => 'Optimize database queries',
            'weight' => 85,
            'due_date' => $periodStart->copy()->addDays(25),
            'priority' => 'high',
            'status' => 'rated',
            'section_id' => $section->id,
        ]);
        $task9->assignedUsers()->attach([
            $alice->id => ['percentage' => 40],
            $bob->id => ['percentage' => 30],
            $charlie->id => ['percentage' => 30],
        ]);
        TaskRating::create([
            'task_id' => $task9->id,
            'rater_id' => $stakeholder->id,
            'rating_data' => [],
            'final_rating' => 87.00,
            'config_snapshot' => [],
            'rated_at' => $periodStart->copy()->addDays(26),
        ]);

        // Task 10: Medium weight, Charlie 100%, good rating
        $task10 = Task::create([
            'name' => 'Documentation Update',
            'description' => 'Update project documentation',
            'weight' => 40,
            'due_date' => $periodStart->copy()->addDays(28),
            'priority' => 'medium',
            'status' => 'rated',
            'section_id' => $section->id,
        ]);
        $task10->assignedUsers()->attach($charlie->id, ['percentage' => 100]);
        TaskRating::create([
            'task_id' => $task10->id,
            'rater_id' => $stakeholder->id,
            'rating_data' => [],
            'final_rating' => 80.00,
            'config_snapshot' => [],
            'rated_at' => $periodStart->copy()->addDays(29),
        ]);

        // Create Stakeholder Rating for the project
        StakeholderRating::create([
            'project_id' => $project->id,
            'stakeholder_id' => $stakeholder->id,
            'rating_data' => [],
            'final_rating' => 85.00,
            'config_snapshot' => [],
            'rated_at' => $periodStart->copy()->addDays(30),
        ]);

        $this->command->info('Creating help requests...');

        // Alice helped Bob twice (gets bonus points)
        HelpRequest::create([
            'description' => 'Need help with API authentication',
            'task_id' => $task2->id,
            'requester_id' => $bob->id,
            'helper_id' => $alice->id,
            'rating' => HelpRequestRating::LEGITIMATE_LEARNING, // Using correct case name
            'is_completed' => true,
            'completed_at' => $periodStart->copy()->addDays(11),
        ]);

        HelpRequest::create([
            'description' => 'Database query optimization help',
            'task_id' => $task9->id,
            'requester_id' => $bob->id,
            'helper_id' => $alice->id,
            'rating' => HelpRequestRating::BASIC_SKILL_GAP,
            'is_completed' => true,
            'completed_at' => $periodStart->copy()->addDays(25),
        ]);

        // Bob helped Charlie once
        HelpRequest::create([
            'description' => 'Help with unit test setup',
            'task_id' => $task4->id,
            'requester_id' => $charlie->id,
            'helper_id' => $bob->id,
            'rating' => HelpRequestRating::LEGITIMATE_LEARNING,
            'is_completed' => true,
            'completed_at' => $periodStart->copy()->addDays(12),
        ]);

        // Charlie requested help with fixing own mistakes (penalty)
        HelpRequest::create([
            'description' => 'Need help fixing my bug',
            'task_id' => $task7->id,
            'requester_id' => $charlie->id,
            'helper_id' => $alice->id,
            'rating' => HelpRequestRating::FIXING_OWN_MISTAKES,
            'is_completed' => true,
            'completed_at' => $periodStart->copy()->addDays(20),
        ]);

        // Charlie requested help again (another penalty)
        HelpRequest::create([
            'description' => 'Still stuck on this feature',
            'task_id' => $task10->id,
            'requester_id' => $charlie->id,
            'helper_id' => $bob->id,
            'rating' => HelpRequestRating::CARELESS_MISTAKE,
            'is_completed' => true,
            'completed_at' => $periodStart->copy()->addDays(28),
        ]);

        $this->command->info('Creating tickets...');

        // Alice resolved 2 tickets
        Ticket::create([
            'title' => 'Login page styling issue',
            'description' => 'Fix styling on login page',
            'status' => TicketStatus::RESOLVED,
            'type' => TicketType::QUICK_FIX, // Using correct case name
            'priority' => 'medium',
            'requester_id' => $stakeholder->id,
            'assigned_to' => $alice->id,
            'completed_at' => $periodStart->copy()->addDays(7),
        ]);

        Ticket::create([
            'title' => 'Email notification not working',
            'description' => 'Fix email notification system',
            'status' => TicketStatus::RESOLVED,
            'type' => TicketType::BUG_INVESTIGATION, // Using correct case name
            'priority' => 'high',
            'requester_id' => $stakeholder->id,
            'assigned_to' => $alice->id,
            'completed_at' => $periodStart->copy()->addDays(14),
        ]);

        // Bob resolved 1 ticket
        Ticket::create([
            'title' => 'Add export feature',
            'description' => 'Add CSV export functionality',
            'status' => TicketStatus::RESOLVED,
            'type' => TicketType::USER_SUPPORT, // Using correct case name
            'priority' => 'low',
            'requester_id' => $stakeholder->id,
            'assigned_to' => $bob->id,
            'completed_at' => $periodStart->copy()->addDays(17),
        ]);

        $this->command->newLine();
        $this->command->info('✅ Test data created successfully!');
        $this->command->newLine();
        $this->command->info('═══════════════════════════════════════════════════════════');
        $this->command->info('📊 EXPECTED FINAL RATING CALCULATIONS');
        $this->command->info('═══════════════════════════════════════════════════════════');
        $this->command->newLine();
        $this->command->info('Period: January 1-31, 2025');
        $this->command->info('Max Points for 100%: Suggest using 200 points');
        $this->command->newLine();

        $this->displayExpectedResults($alice, $bob, $charlie);
    }

    private function displayExpectedResults($alice, $bob, $charlie): void
    {
        $this->command->info('─────────────────────────────────────────────────────────');
        $this->command->info("👤 User 1: {$alice->name} (Alice)");
        $this->command->info('─────────────────────────────────────────────────────────');
        $this->command->info('Task Ratings:');
        $this->command->info('  • Task 1: (95 × 100 × 100) / 10000 = 95.00');
        $this->command->info('  • Task 3: (92 × 100 × 60) / 10000 = 55.20');
        $this->command->info('  • Task 5: (100 × 20 × 100) / 10000 = 2.00');
        $this->command->info('  • Task 8: (90 × 30 × 70) / 10000 = 1.89');
        $this->command->info('  • Task 9: (87 × 85 × 40) / 10000 = 29.58');
        $this->command->info('  SUBTOTAL: ~183.67 points');
        $this->command->newLine();
        $this->command->info('Stakeholder Rating: ~27.84 points');
        $this->command->info('  (85 × her project % of ~32.75%)');
        $this->command->newLine();
        $this->command->info('Help as Helper: +10 points (2 helps × 5)');
        $this->command->info('Help as Requester: 0 points (no requests)');
        $this->command->info('Tickets Resolved: +6 points (2 tickets × 3)');
        $this->command->newLine();
        $this->command->warn('TOTAL: ~227.51 points');
        $this->command->warn('With max 200: 227.51/200 × 100 = 113.75% → capped at 100%');
        $this->command->newLine();

        $this->command->info('─────────────────────────────────────────────────────────');
        $this->command->info("👤 User 4: {$bob->name} (Bob)");
        $this->command->info('─────────────────────────────────────────────────────────');
        $this->command->info('Task Ratings:');
        $this->command->info('  • Task 2: (88 × 80 × 100) / 10000 = 70.40');
        $this->command->info('  • Task 3: (92 × 100 × 40) / 10000 = 36.80');
        $this->command->info('  • Task 6: (78 × 90 × 50) / 10000 = 35.10');
        $this->command->info('  • Task 8: (90 × 30 × 30) / 10000 = 0.81');
        $this->command->info('  • Task 9: (87 × 85 × 30) / 10000 = 22.19');
        $this->command->info('  SUBTOTAL: ~165.30 points');
        $this->command->newLine();
        $this->command->info('Stakeholder Rating: ~18.70 points');
        $this->command->info('  (85 × his project % of ~22%)');
        $this->command->newLine();
        $this->command->info('Help as Helper: +5 points (1 help × 5)');
        $this->command->info('Help as Requester: -1.3 points (adjusted for actual penalties)');
        $this->command->info('Tickets Resolved: +3 points (1 ticket × 3)');
        $this->command->newLine();
        $this->command->warn('TOTAL: ~190.70 points');
        $this->command->warn('With max 200: 190.70/200 × 100 = 95.35%');
        $this->command->newLine();

        $this->command->info('─────────────────────────────────────────────────────────');
        $this->command->info("👤 User 5: {$charlie->name} (Charlie)");
        $this->command->info('─────────────────────────────────────────────────────────');
        $this->command->info('Task Ratings:');
        $this->command->info('  • Task 4: (85 × 50 × 100) / 10000 = 42.50');
        $this->command->info('  • Task 6: (78 × 90 × 50) / 10000 = 35.10');
        $this->command->info('  • Task 7: (72 × 60 × 100) / 10000 = 43.20');
        $this->command->info('  • Task 9: (87 × 85 × 30) / 10000 = 22.19');
        $this->command->info('  • Task 10: (80 × 40 × 100) / 10000 = 32.00');
        $this->command->info('  SUBTOTAL: ~174.99 points');
        $this->command->newLine();
        $this->command->info('Stakeholder Rating: ~15.30 points');
        $this->command->info('  (85 × his project % of ~18%)');
        $this->command->newLine();
        $this->command->info('Help as Helper: 0 points (no helps given)');
        $this->command->info('Help as Requester: -1.4 points');
        $this->command->info('  (1 × legitimate = -1, 1 × fixing mistakes = -5, 1 × careless = -3)');
        $this->command->info('Tickets Resolved: 0 points (no tickets)');
        $this->command->newLine();
        $this->command->warn('TOTAL: ~188.89 points');
        $this->command->warn('With max 200: 188.89/200 × 100 = 94.45%');
        $this->command->newLine();

        $this->command->info('═══════════════════════════════════════════════════════════');
        $this->command->info('💡 RECOMMENDED TEST PARAMETERS');
        $this->command->info('═══════════════════════════════════════════════════════════');
        $this->command->info('Period Start: 2025-01-01');
        $this->command->info('Period End: 2025-01-31');
        $this->command->info('Max Points: 200');
        $this->command->info('Config ID: Use active config');
        $this->command->newLine();
        $this->command->info('Expected Results:');
        $this->command->info("  • {$alice->name}: 100.00% (capped from 113.75%)");
        $this->command->info("  • {$bob->name}: ~95.35%");
        $this->command->info("  • {$charlie->name}: ~94.45%");
        $this->command->info('═══════════════════════════════════════════════════════════');
    }
}
