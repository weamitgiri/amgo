<?php 
return [
    'COMMON_INFO' => [
        'USERIMG' => '/uploads/user_images/',
        //'DEFAULT_IMG' => 'not-available.png',
        //'DEFAULT_IMG' => asset('images/not-available.png'),
        'DEFAULT_IMG' => env('ASSET_URL')."images/not-available.png",
        'FAVICON_IMAGE' => '/images/favicon.ico',
        //'DEFAIMGPTH' => asset('images/not-available.png'),
        //'BASE_URL' => '35.154.46.116',
        'BASE_URL' => 'http://captainrummy.in/',
        'SFS_IP' => 'http://captainrummy.in:8080',
        'FROM_EMAIL' => 'captainkraft.info@gmail.com',
        'REPLY_EMAIL' => 'support@captainrummy.in',
        'SUPPORT_PHONE' => '6305845521',
        'SUPPORT_EMAIL' => 'support@captainrummy.in',
        'MIN_AMOUNT' => 50,
        'MAX_AMOUNT' => 9999,
        'REFPREFIX' =>  'CPTR',
    ],
    'FCM_NOTIFY' => [
        'FCM_JSON_FILE' => 'captainrummy.json',
        'FCM_PROJECT_ID' =>  'captainrummy-e28521111',
        'FCMURL_NEW' => 'https://fcm.googleapis.com/v1/projects/captainrummy-e2852/messages:send',
        'FCMOATH2' => 'https://www.googleapis.com/oauth2/v4/token',
        'FCMSCOPE' => 'https://www.googleapis.com/auth/firebase.messaging',
        'FCM_SUBSCRIBE_URL' =>  'https://iid.googleapis.com/iid/v1:batchAdd',
        'FCM_UNSUBSCRIBE_URL' =>  'https://iid.googleapis.com/iid/v1:batchRemove',
    ],
    'PAYMENT' => [
        'one' => 'more'
    ]
];
?>