package com.wispero.wisperogw;

import android.app.IntentService;
import android.content.Intent;

/**
 * Created by amit on 8/8/16.
 */
public class FirmwareUpdateIntentService extends IntentService {
    private static final String TAG = "FirmwareUpdateService";

    public FirmwareUpdateIntentService() {
        super(TAG);
    }

    @Override
    protected void onHandleIntent(Intent intent) {

    }
}
