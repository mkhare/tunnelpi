package com.wispero.wisperogw;

import android.app.IntentService;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Intent;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.pubnub.api.Callback;
import com.pubnub.api.Pubnub;
import com.pubnub.api.PubnubError;

import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.Method;

/**
 * Created by amit on 24/7/16.
 */
public class BTService extends IntentService {
    BluetoothAdapter btAdapter = null;
    private BluetoothSocket btSocket = null;
    private OutputStream outStream = null;
    private InputStream bt_inputStream = null;

    private static int bt_channel = 4;

    Pubnub pubnub;
    final static String TAG = "BTService";

    public BTService() {
        super("BTService");
    }

    @Override
    protected void onHandleIntent(Intent intent) {
        Log.i("btservice", "in bluetooth service");
        pubnub = MainActivity.pubnub;

        btAdapter = BluetoothAdapter.getDefaultAdapter();
        SharedPreferences sharedPreferences = PreferenceManager.getDefaultSharedPreferences(getApplicationContext());
        String BTDeviceAddress = sharedPreferences.getString(WisperoGWPreferences.BT_DEVICE_ADDRESS, "");
        String BTPublishChannel = sharedPreferences.getString(WisperoGWPreferences.BT_DATA_PUBLISH_CHANNEL, "");

        BluetoothDevice device;
        if(BTDeviceAddress.equals("")){
            device = btAdapter.getRemoteDevice(WisperoGWPreferences.DEFAULT_BT_ADDRESS);
        } else {
            device = btAdapter.getRemoteDevice(BTDeviceAddress);
        }

        String channel_name;
        if(BTPublishChannel.equals("")){
            channel_name = WisperoGWPreferences.DEFAULT_PN_PUBLISH_CHANNEL;
        } else {
            channel_name = BTPublishChannel;
        }


//        Set<BluetoothDevice> pairedDevices = btAdapter.getBondedDevices();
//        String temp_address = null;
//        BluetoothDevice remote_device = null;
//        if (pairedDevices.size() > 0) {
//            for (BluetoothDevice device : pairedDevices) {
//                temp_address = device.getAddress();
//
//                if(temp_address == address){
//
//                }
//            }
//        }



        // Two things are needed to make a connection:
        //   A MAC address, which we got above.
        //   A Service ID or UUID.  In this case we are using the
        //     UUID for SPP.
        try {
            //btSocket = device.createRfcommSocketToServiceRecord(MY_UUID);

            Method m = device.getClass().getMethod("createRfcommSocket", new Class[]{int.class});
            try {
                btSocket = (BluetoothSocket) m.invoke(device, bt_channel);
            } catch (Exception e) {
                Log.e("Fatal Error", "In BTService and socket create failed: " + e.getMessage() + ".");
            }
            //} catch (IOException e) {
        } catch (NoSuchMethodException e) {
            Log.e("Fatal Error", "In BTService and socket create failed: " + e.getMessage() + ".");
        }

        // Method m = device.getClass().getMethod("createRfcommSocket", new Class[] {int.class});
        // btSocket = (BluetoothSocket) m.invoke(device, 1);

        // Discovery is resource intensive.  Make sure it isn't going on
        // when you attempt to connect and pass your message.
        btAdapter.cancelDiscovery();

        // Establish the connection.  This will block until it connects.
        try {
            btSocket.connect();
//            out.append("...Connection established and data link opened...");
        } catch (Exception e) {
            try {
                btSocket.close();
            } catch (Exception e2) {
                Log.e("Fatal Error", "In BTService and unable to close socket during connection failure" + e2.getMessage() + ".");
            }
        }

        // Create a data stream so we can talk to server.
//        out.append("\n...Sending message to server...");

        try {
//            outStream = btSocket.getOutputStream();
            bt_inputStream = btSocket.getInputStream();
            byte[] recv_bytes = new byte[1024];
            int recv_size;
            while((recv_size = bt_inputStream.read(recv_bytes, 0, 1024)) > 0){
                String temp = new String(recv_bytes);
                temp = temp.substring(0, recv_size);
                publish_data(channel_name, temp);
                Intent intent1 = new Intent(WisperoGWPreferences.BT_DATA_PUBLISHED);
                intent1.putExtra("publishedData", temp);
                LocalBroadcastManager.getInstance(getApplicationContext()).sendBroadcast(intent1);
            }
        } catch (IOException e) {
            Log.i("Disconnected", "No data coming from other side, most likely socket closed from other side");
            try {
                bt_inputStream.close();
                btSocket.close();
            } catch (IOException e1) {
                e1.printStackTrace();
            }
        }finally {
            Log.i(TAG, "stopping service");
            stopSelf();
        }
    }

    void publish_data(String channel_name, final String message1){
        Callback publishCallback = new Callback() {
            @Override
            public void successCallback(String channel,
                                        Object message) {
                Log.i(TAG,"PUBLISHED : " + message + " : Message : " + message1);
            }

            @Override
            public void errorCallback(String channel,
                                      PubnubError error) {
                Log.i("publish error cb","PUBLISH : " + error);
            }
        };

        JSONObject jsonObject = MainActivity.addPnGcmData(message1);
        pubnub.publish(channel_name, jsonObject, publishCallback);
    }
}
