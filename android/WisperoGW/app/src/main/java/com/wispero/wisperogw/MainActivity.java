package com.wispero.wisperogw;

import android.app.Activity;
import android.app.AlertDialog;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v4.content.LocalBroadcastManager;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.pubnub.api.Callback;
import com.pubnub.api.Pubnub;
import com.pubnub.api.PubnubError;
import com.pubnub.api.PubnubException;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Set;

public class MainActivity extends AppCompatActivity {
    private static final int PLAY_SERVICES_RESOLUTION_REQUEST = 9000;
    private static final String TAG = "MainActivity";
    private static final int REQUEST_CONNECT_DEVICE = 1;
    private static final int REQUEST_ENABLE_BT = 2;
    BluetoothAdapter bluetoothAdapter;

    private BroadcastReceiver mRegistration_BR, mBTDataPublished_BR, mGCMDataRecvd_BR;
    //    private ProgressBar mRegistrationProgressBar;
    private TextView mInformationTextView, tv_commlog;
    private boolean isReceiverRegistered;
    private Button btn_publish, btn_subscribe, btn_BTPublish, btn_deviceAddress;

    private Pubnub pubnub;
    static String PUBLISH_KEY = WisperoGWPreferences.PN_PUBLISH_KEY;
    static String SUBSCRIBE_KEY = WisperoGWPreferences.PN_SUBSCRIBE_KEY;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        createViewObjects();
        setOnClickListeners();

        createReceivers();
        registerReceivers();
        startServices();
    }

    @Override
    protected void onResume() {
        super.onResume();
        requestEnableBT();
        registerReceivers();
    }

    @Override
    protected void onPause() {
        super.onPause();
        unregisterReceivers();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        stopServicesOnDestroy();
    }

    private void requestEnableBT() {
        if (!bluetoothAdapter.isEnabled()) {
            notifyUser("Bluetooth enabled.");
            bluetoothAdapter.enable();
        }
//        Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
//        startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
    }

    private void startServices() {
        if (checkPlayServices()) {
            // Start IntentService to register this application with GCM.
            Intent intent = new Intent(this, RegistrationIntentService.class);
            startService(intent);
        }
        Intent intent = new Intent(this, BTService.class);
        startService(intent);
    }

    private void stopServicesOnDestroy() {
        Intent intent = new Intent(this, BTService.class);
        stopService(intent);
    }

    private void createViewObjects() {
        pubnub = WisperoGWPreferences.pubnub;
        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
//        mRegistrationProgressBar = (ProgressBar) findViewById(R.id.registrationProgressBar);
        tv_commlog = (TextView) findViewById(R.id.tv_commlog);
        mInformationTextView = (TextView) findViewById(R.id.informationTextView);
        btn_publish = (Button) findViewById(R.id.btn_publish);
        btn_subscribe = (Button) findViewById(R.id.btn_subscribe);
        btn_BTPublish = (Button) findViewById(R.id.btn_BTPublish);
        btn_deviceAddress = (Button) findViewById(R.id.btn_deviceAddress);
    }

    private void setOnClickListeners() {
        btn_publish.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                publishMessageAlertDialog();
            }
        });

        btn_subscribe.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                subscribeChannelAlertDialog();
            }
        });
        btn_BTPublish.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                btChannelAlertDialog();
            }
        });
        btn_deviceAddress.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
//                btDeviceAddressSetAlertDialog();
                selectBTDevice();
            }
        });
    }

    private void selectBTDevice() {
        if (bluetoothAdapter == null) {
            Toast.makeText(this, "No Bluetooth Adapter Found", Toast.LENGTH_LONG).show();
        } else {
            ListPairedDevices();
            Intent connectIntent = new Intent(this, DeviceListActivity.class);
            startActivityForResult(connectIntent, REQUEST_CONNECT_DEVICE);
        }
    }

    public void onActivityResult(int mRequestCode, int mResultCode, Intent mDataIntent) {
        super.onActivityResult(mRequestCode, mResultCode, mDataIntent);

        switch (mRequestCode) {
            case REQUEST_CONNECT_DEVICE:
                if (mResultCode == Activity.RESULT_OK) {
                    Bundle mExtra = mDataIntent.getExtras();
                    String mDeviceAddress = mExtra.getString("DeviceAddress");
                    PreferenceManager.getDefaultSharedPreferences(this).edit().putString(WisperoGWPreferences.BT_DEVICE_ADDRESS, mDeviceAddress).apply();
                    Intent intent = new Intent(this, BTService.class);
                    startService(intent);
                    Log.v(TAG, "Incoming BT address " + mDeviceAddress);
                }
                break;
        }
    }

    private void ListPairedDevices() {
        Set<BluetoothDevice> mPairedDevices = bluetoothAdapter.getBondedDevices();
        if (mPairedDevices.size() > 0) {
            for (BluetoothDevice mDevice : mPairedDevices) {
                Log.v(TAG, "PairedDevice: " + mDevice.getName() + " " + mDevice.getAddress());
            }
        }
    }

    private void btDeviceAddressSetAlertDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("BT Device Address");
        builder.setMessage("Enter the address of BT device from which you want to receive data (default address is only for test purposes)");
        final EditText et_devAddress = new EditText(this);
        builder.setView(et_devAddress);
        builder.setPositiveButton("Done",
                new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialogInterface, int i) {
                        String devAddress = et_devAddress.getText().toString();
                        SharedPreferences sharedPreferences = PreferenceManager.getDefaultSharedPreferences(MainActivity.this);
                        sharedPreferences.edit().putString(WisperoGWPreferences.BT_DEVICE_ADDRESS, devAddress).apply();
                    }
                }
        );
        AlertDialog alertDialog = builder.create();
        alertDialog.show();
    }

    private void btChannelAlertDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Publish Channel");
        builder.setMessage("Enter the channel name over which you want to publish the BT data (default is 'hello')");
        final EditText et_channelName = new EditText(this);
        builder.setView(et_channelName);
        builder.setPositiveButton("Done",
                new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialogInterface, int i) {
                        String channel_name = et_channelName.getText().toString();
                        SharedPreferences sharedPreferences = PreferenceManager.getDefaultSharedPreferences(MainActivity.this);
                        sharedPreferences.edit().putString(WisperoGWPreferences.BT_DATA_PUBLISH_CHANNEL, channel_name).apply();
                    }
                }
        );
        AlertDialog alertDialog = builder.create();
        alertDialog.show();
    }

    private void subscribeChannelAlertDialog() {
        AlertDialog.Builder builder1 = new AlertDialog.Builder(this);
        builder1.setTitle("Subscribe Channel");
        builder1.setMessage("Enter Channel Name");
        final EditText et_channelName = new EditText(this);
        builder1.setView(et_channelName);
        builder1.setPositiveButton("Done",
                new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialogInterface, int i) {
                        String channel_name = et_channelName.getText().toString();
                        subscribe(channel_name);
                    }
                }
        );
        AlertDialog alertDialog = builder1.create();
        alertDialog.show();
    }

    private void publishMessageAlertDialog() {
        AlertDialog.Builder builder1 = new AlertDialog.Builder(this);
        builder1.setTitle("Publish Channel");
        builder1.setMessage("Enter Channel Name");
        final EditText et_channelName = new EditText(this);
        builder1.setView(et_channelName);
        builder1.setPositiveButton("Done",
                new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        final String channel_name = et_channelName.getText().toString();
                        AlertDialog.Builder builder2 = new AlertDialog.Builder(MainActivity.this);
                        builder2.setTitle("Publish Message");
                        builder2.setMessage("Enter Message");
                        final EditText et_message = new EditText(MainActivity.this);
                        builder2.setView(et_message);
                        builder2.setPositiveButton("Done",
                                new DialogInterface.OnClickListener() {
                                    @Override
                                    public void onClick(DialogInterface dialogInterface, int i) {
                                        String message = et_message.getText().toString();
                                        publish(channel_name, message);
                                    }
                                }
                        );
                        AlertDialog alert2 = builder2.create();
                        alert2.show();
                    }
                });
        AlertDialog alert1 = builder1.create();
        alert1.show();
    }

    private void createReceivers() {
        mGCMDataRecvd_BR = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String title = intent.getStringExtra("title");
                String text = intent.getStringExtra("text");
                notifyUser("GCM message - " + "TITLE : " + title + " TEXT : " + text);
            }
        };

        mRegistration_BR = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
//                mRegistrationProgressBar.setVisibility(ProgressBar.INVISIBLE);
//                mRegistrationProgressBar.setVisibility(ProgressBar.GONE);
                SharedPreferences sharedPreferences =
                        PreferenceManager.getDefaultSharedPreferences(context);
                boolean sentToken = sharedPreferences
                        .getBoolean(WisperoGWPreferences.SENT_TOKEN_TO_SERVER, false);
                if (sentToken) {
                    mInformationTextView.setText(getString(R.string.gcm_send_message));
                } else {
                    mInformationTextView.setText(getString(R.string.token_error_message));
                }
            }
        };

        mBTDataPublished_BR = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Log.i(TAG, "Data received in mBTDataPublished_BR");
                String publishedData = intent.getStringExtra("publishedData");
                notifyUser("Data sent from bluetooth over pubnub : " + publishedData);
            }
        };
    }

    private void registerReceivers() {
        if (!isReceiverRegistered) {
            LocalBroadcastManager localBroadcastManager = LocalBroadcastManager.getInstance(this);
            localBroadcastManager.registerReceiver(mRegistration_BR,
                    new IntentFilter(WisperoGWPreferences.REGISTRATION_COMPLETE));
            localBroadcastManager.registerReceiver(mBTDataPublished_BR,
                    new IntentFilter(WisperoGWPreferences.BT_DATA_PUBLISHED));
            localBroadcastManager.registerReceiver(mGCMDataRecvd_BR,
                    new IntentFilter(WisperoGWPreferences.GCM_MESSAGE_RECEIVED));
            isReceiverRegistered = true;
        }
    }

    private void unregisterReceivers() {
        if (isReceiverRegistered) {
            LocalBroadcastManager localBroadcastManager = LocalBroadcastManager.getInstance(this);
            localBroadcastManager.unregisterReceiver(mRegistration_BR);
            localBroadcastManager.unregisterReceiver(mBTDataPublished_BR);
            localBroadcastManager.unregisterReceiver(mGCMDataRecvd_BR);
            isReceiverRegistered = false;
        }
    }

    private void notifyUser(final String message) {
        this.runOnUiThread(new Runnable() {
            @Override
            public void run() {
//                Toast.makeText(MainActivity.this, message, Toast.LENGTH_LONG).show();
                tv_commlog.append(message + "\n");
            }
        });
    }

    private void subscribe(final String channel_name) {
        try {
            pubnub.subscribe(channel_name, new Callback() {

                        @Override
                        public void connectCallback(String channel, Object message) {
                            System.out.println("SUBSCRIBE : CONNECT on channel:" + channel
                                    + " : " + message.getClass() + " : "
                                    + message.toString());
                            notifyUser("SUBSCRIBE : CONNECT on channel:" + channel
                                    + " : " + message.toString());
                        }

                        @Override
                        public void disconnectCallback(String channel, Object message) {
                            System.out.println("SUBSCRIBE : DISCONNECT on channel:" + channel
                                    + " : " + message.getClass() + " : "
                                    + message.toString());
                            notifyUser("SUBSCRIBE : DISCONNECT on channel:" + channel
                                    + " : " + message.toString());
                        }

                        public void reconnectCallback(String channel, Object message) {
                            System.out.println("SUBSCRIBE : RECONNECT on channel:" + channel
                                    + " : " + message.getClass() + " : "
                                    + message.toString());
                            notifyUser("SUBSCRIBE : RECONNECT on channel:" + channel
                                    + " : " + message.toString());
                        }

                        @Override
                        public void successCallback(String channel, Object message) {
                            System.out.println("SUBSCRIBE : " + channel + " : "
                                    + message.getClass() + " : " + message.toString());
                            notifyUser("SUBSCRIBE : Data received on channel:" + channel);
                        }

                        @Override
                        public void errorCallback(String channel, PubnubError error) {
                            System.out.println("SUBSCRIBE : ERROR on channel " + channel
                                    + " : " + error.toString());
                            notifyUser("SUBSCRIBE : ERROR on channel:" + channel
                                    + " : " + error.toString());
                        }
                    }
            );

            SharedPreferences sharedPreferences = PreferenceManager.getDefaultSharedPreferences(this);
            String registrationToken = sharedPreferences.getString(WisperoGWPreferences.REGISTRATION_TOKEN_FOR_GCM, null);

            if (registrationToken == null) {
                regTokenUnavailAlertDialog();
            } else {
                pubnub.enablePushNotificationsOnChannel(channel_name, registrationToken, new Callback() {

                    @Override
                    public void successCallback(String channel, Object response) {
                        notifyUser("Push notifications enabled for channel : " + channel_name);
                    }

                    @Override
                    public void errorCallback(String channel, PubnubError error) {
                        Log.e(TAG, "error while enabling push notifications on channel : " + channel_name);
                    }
                });
            }
        } catch (PubnubException e) {
            e.printStackTrace();
        }
    }

    public static JSONObject addPnGcmData(String original_msg) {
        JSONObject mainObject = new JSONObject();
        try {
            mainObject.put("original_msg", original_msg);
            JSONObject gcmData = new JSONObject();
            gcmData.put("title", "New WisperoGW Message");
            gcmData.put("text", original_msg);
            JSONObject gcm_msg = new JSONObject();
            gcm_msg.put("data", gcmData);
            mainObject.put("pn_gcm", gcm_msg);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        Log.i(TAG, mainObject.toString());
        return mainObject;
    }

    private void publish(String channel_name, String message) {
        Callback callback = new Callback() {
            public void successCallback(String channel, Object response) {
                System.out.println(response.toString());
                notifyUser(response.toString());
            }

            public void errorCallback(String channel, PubnubError error) {
                System.out.println(error.toString());
                notifyUser(error.toString());
            }
        };

        JSONObject jsonObject = addPnGcmData(message);
        pubnub.publish(channel_name, jsonObject, callback);
    }

    private void regTokenUnavailAlertDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Registration Token Unavailable");
        builder.setMessage("GCM is not enabled yet, Please try after some time.");
        builder.setPositiveButton("OK",
                new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialogInterface, int i) {
                    }
                });
    }

    private boolean checkPlayServices() {
        GoogleApiAvailability apiAvailability = GoogleApiAvailability.getInstance();
        int resultCode = apiAvailability.isGooglePlayServicesAvailable(this);
        if (resultCode != ConnectionResult.SUCCESS) {
            if (apiAvailability.isUserResolvableError(resultCode)) {
                apiAvailability.getErrorDialog(this, resultCode, PLAY_SERVICES_RESOLUTION_REQUEST)
                        .show();
            } else {
                Log.i(TAG, "This device is not supported.");
                finish();
            }
            return false;
        }
        return true;
    }
}
