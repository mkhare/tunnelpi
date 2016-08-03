package com.wispero.wisperogw;

import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;

/**
 * Created by amit on 2/8/16.
 */
public class ConfigConsoleActivity extends AppCompatActivity {

    public static final String TAG = "ConfigConsoleActivity";
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_configconsole);
        Intent intent = getIntent();
        Log.i(TAG, intent.getStringExtra("jsonString"));
    }
}
