<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\ActivityGame;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ActivityGameSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create the Main Activity: Detective Mystery
        $activity = Activity::updateOrCreate(
            ['slug' => 'detective-mystery'],
            [
                'title' => 'Detective Mystery',
                'description' => 'A high-stakes investigative game where teams must identify the culprit among them.',
                'status' => 'active',
                'lobby_wait_secs' => 900, // 15 minutes
                'entry_cutoff_mins' => 15,
                'game_duration_secs' => 1200, // 20 minutes
                'case_summary_view_secs' => 300, // 5 minutes
                'strategy_guide_delay_secs' => 120, // 2 minutes
                'clue_room_unlock_secs' => 600, // 10 minutes
                'question_response_secs' => 120, // 2 minutes
                'max_questions' => 5,
                'group_size' => 5,
                'auto_expire_days' => 5,
                'win_bonus' => 100,
                'participation_bonus' => 50,
                'timely_response_bonus' => 20,
                'no_response_penalty' => -10,
                'wrong_vote_penalty' => -15,
                'lie_detector_enabled' => true,
                'lie_detector_max_questions' => 3,
                'lie_detector_timer_secs' => 420, // 7 minutes
                'lie_detector_voting_timer_secs' => 30,
            ]
        );

        // 2. Create the Specific Game: The Bungalow Secret
        $game = ActivityGame::updateOrCreate(
            ['title' => 'The Bungalow Secret', 'activity_id' => $activity->id],
            [
                'case_summary' => '<h3>Case Plot</h3><p>An old wealthy businessman, Raghav Malhotra, is found dead in his luxury bungalow on the night of his greatest triumph — the approval celebration for his ambitious Dream City Project.</p><p>The project, a large-scale real estate development, was built on land acquired from local farming communities under disputed and allegedly forced conditions.</p><p>The party was in full swing. Guests, business associates, and family were present. But behind the celebrations, tensions ran deep.</p><p>Medical estimation places time of death at approximately 11:30 PM.</p><p>Businessman was found dead in the room.</p>',
                'tagline' => 'Not everything is as it seems in the Willow Bungalow.',
                'status' => 'active',
                'quick_facts' => [
                    'location' => 'Luxury Bungalow, Mumbai',
                    'date_time' => '26th May, 11:30 PM (Est. Death)',
                    'weather' => 'Clear Night',
                    'cctv_status' => 'Operational (Limited Coverage)'
                ],
                'timeline' => [
                    ['time' => '10:00 PM', 'event' => 'Party begins at the Bungalow — guests, associates, media arrive'],
                    ['time' => '10:30 PM', 'event' => 'Raghav Malhotra gives victory speech celebrating Dream City Project approval'],
                    ['time' => '10:45 PM', 'event' => 'Guest dancing and enjoying with loud music, dinner'],
                    ['time' => '11:00 PM', 'event' => 'Farmer’s leader Kartar Sah arrives uninvited and starts shouting in party'],
                    ['time' => '11:10 PM', 'event' => 'Raghav Malhotra asks him to come to his private room to discuss peacefully'],
                    ['time' => '11:20 PM', 'event' => 'Raghav calls his son Vikram — call lasts 4 minutes (last call on his phone)'],
                    ['time' => '11:30 PM', 'event' => 'Kartar Sah exits study, leaves bungalow — confirmed by gate guard.'],
                    ['time' => '11:50 PM', 'event' => 'Raju enters with tea — finds dead body. Raju informs police.'],
                ]
            ]
        );

        // 3. Create Game Roles
        $rolesData = [
            [
                'role_type' => 'investigator',
                'character_name' => 'Investigator',
                'subtitle' => 'You are the Investigator. The only one allowed to question everyone.',
                'objective' => 'Find and accuse the real Hidden Culprit before time runs out.',
                'what_you_know' => [
                    'Everyone in the house is a suspect',
                    'Statements may not be truthful',
                    'The timeline holds key inconsistencies'
                ],
                'keep_in_mind' => [
                    'You can ask up to 5 questions in total',
                    'You can use the Lie Detector round for up to 7 minutes',
                    'You can reopen the Case Brief only once when the session starts',
                    'You win if you correctly identifies the Hidden Culprit',
                    '+10 points per question asked'
                ],
                'footer_text' => 'Keep your role secret. CTA button: Okay, continue',
                'strategies' => [] // Investigator doesn't see standard strategy guide in prompt, but has their own
            ],
            [
                'role_type' => 'culprit',
                'character_name' => 'Priya Malhotra (Daughter-in-law)',
                'subtitle' => 'You are the one who did it. Stay calm. Stay hidden.',
                'objective' => 'Avoid getting caught by the Investigator and ensure someone else is identified as the accused.',
                'what_you_know' => [
                    'Your alibi has been assigned — stick to it',
                    'A Person of Interest has been named in the case — use them',
                    'The Investigator has only 5 questions — make them count for nothing'
                ],
                'keep_in_mind' => [
                    'Act like a normal participant — not too silent, not too defensive',
                    'Slightly redirect facts instead of outright lying',
                    'Casually raise doubts about the Person of Interest in your answers',
                    'Stick to one story throughout the entire session',
                    'You win if you are not identified.',
                    'Your role is confidential. Do not reveal it directly or indirectly.'
                ],
                'footer_text' => 'Keep your role secret. CTA button: Okay, continue',
                'strategies' => [
                    ['heading' => 'Your Role', 'body' => 'You did it. You know it. Nobody else does yet. Your only job tonight is to walk out of this without being named.'],
                    ['heading' => 'Your Alibi', 'body' => 'You were socialising near the dining area between 11:15 PM and 11:45 PM. You stepped away briefly to wash face. Stick to one version.'],
                    ['heading' => 'Person of Interest', 'body' => 'Kartar Sah was in the room at the time of death and he was shouting in party. That is a fact available to everyone.'],
                    ['heading' => 'Stay In The Game', 'body' => 'Act normal — grief is natural tonight. Less is more — short answers are safer. One story — never contradict yourself.']
                ]
            ],
            [
                'role_type' => 'suspect',
                'character_name' => 'Kartar Sah (Farmer Leader)',
                'subtitle' => 'You are under suspicion. Prove you are innocent.',
                'objective' => 'Avoid being wrongly identified as the accused by the Investigator.',
                'what_you_know' => [
                    'Your presence or connection to the incident raises doubt',
                    'The case may reference details that appear to implicate you',
                    'You are innocent — but you must prove it through your answers'
                ],
                'keep_in_mind' => [
                    'Stay calm and composed under questioning',
                    'Give clear, consistent answers — do not change your story',
                    'Do not panic or over-explain when challenged',
                    'You win if you correctly identifies the Hidden Culprit',
                    'Your role is confidential. Do not reveal it directly or indirectly.'
                ],
                'footer_text' => 'Keep your role secret. CTA button: Okay, continue',
                'strategies' => [
                    ['heading' => 'Your Situation', 'body' => 'All eyes are on you. But you didn\'t do it. Objective: Survive the investigation. You arrived uninvited. You were alone with Raghav. You left at exactly the time they say he died.'],
                    ['heading' => 'What You Actually Know', 'body' => 'Facts: You came to confront Raghav about the land issue. Discussion was heated but you left him alive. You walked out at 11:30 PM. The gate guard saw you leave.'],
                    ['heading' => 'Your Weak Points', 'body' => 'Land papers with your name found at the scene. Your history of public threats. Don\'t panic.'],
                    ['heading' => 'How To Stay Alive', 'body' => 'Anger is natural — own it but separate it from violence. Stay calm. Tell your truth.']
                ]
            ],
            [
                'role_type' => 'witness',
                'character_name' => 'Raju (Servant)',
                'subtitle' => 'You saw something. Help the Investigator — carefully.',
                'objective' => 'Help the Investigator identify the Hidden Culprit without revealing everything too easily.',
                'what_you_know' => [
                    'You have partial knowledge of the incident',
                    'You may have noticed suspicious behaviour or movements',
                    'You hold one Secret Passcard — a private hint to the Investigator'
                ],
                'keep_in_mind' => [
                    'Share information gradually — do not give everything away at once',
                    'Be truthful but controlled in your responses',
                    'Use your Secret Passcard wisely',
                    'You win if you correctly identifies the Hidden Culprit',
                    'Your role is confidential. Do not reveal it directly or indirectly.'
                ],
                'footer_text' => 'Keep your role secret. CTA button: Okay, continue',
                'strategies' => [
                    ['heading' => 'Your Situation', 'body' => 'You have worked here 11 years. You found the body. You did nothing wrong. But you knew Kartar Sah personally. The Investigator will notice.'],
                    ['heading' => 'What You Actually Know', 'body' => 'Facts: You were in the kitchen from 11:20 PM. You entered study at 11:50 PM. You know Kartar from home district. You boiled kettle early for a simple reason — pick one and stick to it.'],
                    ['heading' => 'Your Weak Points', 'body' => 'Why was the kettle boiled 30 minutes early? Your personal connection to Kartar Sah.'],
                    ['heading' => 'How To Handle The Investigation', 'body' => 'You are not a suspect. Kartar connection — a shared district is not a crime. You have nothing to hide except one small habit.']
                ]
            ],
            [
                'role_type' => 'participant',
                'character_name' => 'Vikram Malhotra (Son)',
                'subtitle' => 'You are a neutral observer. Stay active and think clearly.',
                'objective' => 'Help ensure the correct accused is identified by actively participating.',
                'what_you_know' => [
                    'You have no hidden agenda',
                    'You are not under special suspicion',
                    'Your observations and logical reasoning are your only tools'
                ],
                'keep_in_mind' => [
                    'Stay active — do not go silent',
                    'Answer questions honestly and consistently',
                    'Observe others carefully for inconsistencies',
                    'You win if you correctly identifies the Hidden Culprit',
                    'Your role is confidential. Do not reveal it directly or indirectly.'
                ],
                'footer_text' => 'Keep your role secret. CTA button: Okay, continue',
                'strategies' => [
                    ['heading' => 'Your Situation', 'body' => 'Your father called you at 11:20 PM. Last call. You walked toward study after. Staff saw you near east corridor at 11:26 PM. You turned back without entering.'],
                    ['heading' => 'What You Actually Know', 'body' => 'Facts: Father called at 11:20 PM (4 mins). He was planning to transfer 95% of estate to farmer trust. You were shocked and walked toward study. You heard voices and turned back.'],
                    ['heading' => 'Your Weak Points', 'body' => 'What father said in those 4 mins. Why you walked toward study. Why you turned back. Where you were between 11:24 and 11:40 PM.'],
                    ['heading' => 'How To Handle The Investigation', 'body' => 'You are grieving — it\'s real. Own your corridor movement. Phone call content — you decide if you want to share.']
                ]
            ]
        ];

        foreach ($rolesData as $data) {
            $role = $game->roles()->create([
                'role_type' => $data['role_type'],
                'character_name' => $data['character_name'],
                'subtitle' => $data['subtitle'],
                'objective' => $data['objective'],
                'what_you_know' => $data['what_you_know'],
                'keep_in_mind' => $data['keep_in_mind'],
                'footer_text' => $data['footer_text'],
            ]);

            foreach ($data['strategies'] as $sIndex => $s) {
                $role->strategyCards()->create([
                    'card_number' => $sIndex + 1,
                    'heading' => $s['heading'],
                    'body_content' => $s['body'],
                    'heading_color' => '#7F77DD'
                ]);
            }
        }

        // 4. Create Investigator Cards (Appearing at specific intervals)
        $investigatorCards = [
            [
                'card_number' => 1,
                'suspect_label' => 'Suspect 1: Kartar Sah',
                'tag' => 'Farmer Leader — Uninvited Guest',
                'profile_text' => 'Kartar Sah was the last known person inside the study with Raghav Malhotra. He left at exactly 11:30 PM — the estimated time of death. He had the loudest, most public motive — two years of protests, legal battles, and public threats against Raghav. Land registry papers with his name were found scattered across the study floor.',
                'why_suspicious' => [
                    'Exited the bungalow at the exact estimated time of death',
                    'Had an active, well-documented grudge against the victim',
                    'His name appears on land papers found scattered at the crime scene'
                ],
                'suggested_questions' => [
                    'You were the last person seen with him. What exactly was said in that room?',
                    'The land papers with your name — did you bring them or were they already there?',
                    'You have publicly threatened Raghav Malhotra before. Did you mean it?'
                ],
                'appears_at_secs' => 5,
                'closes_at_secs' => 35
            ],
            [
                'card_number' => 2,
                'suspect_label' => 'Suspect 2: Vikram Malhotra',
                'tag' => 'The Heir',
                'profile_text' => 'Vikram Malhotra is the only son of Raghav Malhotra and the sole heir. At 11:20 PM — 10 minutes before the death — Raghav called Vikram. The call lasted 4 minutes. It was the last call ever made from Raghav\'s phone.',
                'why_suspicious' => [
                    'Sole heir to the Malhotra estate',
                    'Received the last call from the victim exactly 10 minutes before time of death',
                    'Whereabouts between 11:24 PM and 11:40 PM are unconfirmed by witnesses'
                ],
                'suggested_questions' => [
                    'You are your father\'s only heir. Did you know any reason someone would want him dead?',
                    'After the call ended, where did you go? A staff member saw you near the east corridor at 11:26 PM. Explain.'
                ],
                'appears_at_secs' => 155,
                'closes_at_secs' => 185
            ],
            [
                'card_number' => 3,
                'suspect_label' => 'Suspect 3: Raju',
                'tag' => 'The Servant',
                'profile_text' => 'Raju has worked in the bungalow for 11 years. He knows every private corridor. Kitchen log shows the kettle was boiled at 11:20 PM — unusually early. He is the only staff member who knew Kartar Sah personally.',
                'why_suspicious' => [
                    'Boiled the kettle 30 minutes before tea was needed',
                    'Personally knew Kartar Sah — possible coordination',
                    'Full knowledge of private access points including the private corridor'
                ],
                'suggested_questions' => [
                    'You prepared tea 30 minutes early. Why?',
                    'You and Kartar Sah are from the same district. Did you speak to him that evening?'
                ],
                'appears_at_secs' => 305,
                'closes_at_secs' => 335
            ],
            [
                'card_number' => 4,
                'suspect_label' => 'Suspect 4: Priya Malhotra',
                'tag' => 'The Daughter-in-law',
                'profile_text' => 'Priya Malhotra claims she was socialising near the dining area. However, no guest can confirm her exact location between 11:25 PM and 11:45 PM. She was seen near the kitchen at 11:15 PM.',
                'why_suspicious' => [
                    'Location completely unaccounted for during the critical 15-minute window',
                    'Seen near the kitchen at 11:15 PM',
                    'Notably composed when the body was discovered',
                    'One of the few people who knew the layout of the private study'
                ],
                'suggested_questions' => [
                    'Where exactly were you between 11:25 PM and 11:45 PM? Name one person who can confirm.',
                    'You were seen near the kitchen at 11:15 PM. What were you doing there?'
                ],
                'appears_at_secs' => 455,
                'closes_at_secs' => 485
            ]
        ];

        foreach ($investigatorCards as $card) {
            $game->investigatorCards()->create($card);
        }

        // 5. Create Investigation Photos
        $photos = [
            ['num' => 1, 'label' => 'Photo 1 — The Party Scene (Before)'],
            ['num' => 2, 'label' => 'Photo 2 — Kartar Sah Arrives (Tension Moment)'],
            ['num' => 3, 'label' => 'Photo 3 — The Private Study (Crime Scene — Wide)'],
            ['num' => 4, 'label' => 'Photo 4 — Suspects hall (Close Detail)'],
            ['num' => 5, 'label' => 'Photo 5 — The Broken Phone'],
        ];

        foreach ($photos as $p) {
            $game->photos()->create([
                'photo_number' => $p['num'],
                'label' => $p['label'],
                'image' => 'game_photos/placeholder.jpg'
            ]);
        }

        // 6. Create Game Clue
        $game->clues()->create([
            'clue_title' => 'The Study Evidence',
            'clue_short_description' => 'Forensic investigators have marked key evidence found at the crime scene.',
            'clue_detail' => 'White circles indicate areas of interest. What they mean — is for you to determine.',
            'clue_image' => 'clues/placeholder.jpg'
        ]);

        // 7. Create Game Rules
        $rules = [
            'The Investigator has 5 questions to examine any participant and establish the truth.',
            'First 5 minutes — all participants must review the Case Summary carefully. The Case Summary closes automatically after 5 minutes.',
            'Each participant has 2 minutes to respond when questioned. Failure to respond carries a penalty of -10 points.',
            'The Clue Room opens when 10 minutes remain in the session — one key piece of evidence becomes accessible.',
            'The Lie Detector round may be initiated once by the Investigator — up to 7 minutes, with max 3 questions.',
            'The Investigator must identify the accused before the session concludes. Total duration: 25 minutes.'
        ];

        foreach ($rules as $index => $r) {
            $game->rules()->create(['rule_text' => $r, 'order' => $index + 1]);
        }

        // 8. Create Full Story Parts
        $story = [
            ['num' => 1, 'title' => 'The Motive', 'body' => 'Vikram and Priya were drowning in debt...'],
            ['num' => 2, 'title' => 'The Opportunity', 'body' => 'Priya used the private corridor while the music was loud...'],
            ['num' => 3, 'title' => 'The Final Reveal', 'body' => 'The broken phone contained a recording...'],
        ];

        foreach ($story as $s) {
            $game->fullStory()->create([
                'part_number' => $s['num'],
                'part_title' => $s['title'],
                'part_body' => $s['body']
            ]);
        }
    }
}
