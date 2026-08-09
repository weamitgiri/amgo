<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CcGameInstance;
use App\Models\CcRatingCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Read-only session browser — lets support/admin staff look up a Cook &
 * Create game (by organizer, booking, group, status, or dish name) and drill
 * into its full round-by-round history. Nothing here writes to gameplay
 * tables; those are owned by the Node API while a game is live.
 */
class CookAndCreateSessionController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:admin');
    }

    public function index(Request $request)
    {
        $query = CcGameInstance::query()
            ->with(['group.booking.organizer', 'template'])
            ->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('dish_name')) {
            $query->where('dish_name', 'like', '%' . $request->string('dish_name') . '%');
        }
        if ($request->filled('organizer')) {
            $needle = $request->string('organizer');
            $query->whereHas('group.booking.organizer', function ($q) use ($needle) {
                $q->where('name', 'like', "%{$needle}%")->orWhere('company_name', 'like', "%{$needle}%");
            });
        }

        $sessions = $query->paginate(20)->withQueryString();

        return view('admin.cook-and-create.sessions.index', compact('sessions'));
    }

    public function show(CcGameInstance $session)
    {
        $session->load(['group.booking.organizer', 'template', 'impostor', 'showHost']);

        $participants = DB::table('game_participants')->where('group_id', $session->group_id)->orderBy('id')->get();

        $round1Votes = DB::table('cc_round1_votes as v')
            ->join('cc_ingredients as i', 'i.id', '=', 'v.ingredient_id')
            ->where('v.instance_id', $session->id)
            ->select('i.name', DB::raw('COUNT(*) as votes'))
            ->groupBy('i.name')
            ->orderByDesc('votes')
            ->get();

        $round2Steps = DB::table('cc_round2_steps')->where('instance_id', $session->id)->orderBy('step_letter')->get();

        $round3Messages = DB::table('cc_round3_messages as m')
            ->join('game_participants as p', 'p.id', '=', 'm.participant_id')
            ->where('m.instance_id', $session->id)
            ->select('m.*', 'p.name as participant_name')
            ->orderBy('m.created_at')
            ->get();

        $round3Votes = DB::table('cc_round3_impostor_votes as v')
            ->join('game_participants as p', 'p.id', '=', 'v.voted_for_participant_id')
            ->where('v.instance_id', $session->id)
            ->select('p.name as voted_for_name', DB::raw('COUNT(*) as votes'))
            ->groupBy('p.name')
            ->orderByDesc('votes')
            ->get();

        $ratingsReceived = DB::table('cc_ratings as r')
            ->join('cc_rating_categories as c', 'c.id', '=', 'r.category_id')
            ->where('r.rated_group_id', $session->group_id)
            ->select('c.name', 'c.emoji', DB::raw('COUNT(*) as nominations'))
            ->groupBy('c.name', 'c.emoji')
            ->orderByDesc('nominations')
            ->get();

        return view('admin.cook-and-create.sessions.show', compact(
            'session',
            'participants',
            'round1Votes',
            'round2Steps',
            'round3Messages',
            'round3Votes',
            'ratingsReceived'
        ));
    }
}
