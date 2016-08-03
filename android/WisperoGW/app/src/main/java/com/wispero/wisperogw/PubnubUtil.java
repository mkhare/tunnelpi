package com.wispero.wisperogw;

import android.util.Log;

import com.pubnub.api.Callback;
import com.pubnub.api.Pubnub;
import com.pubnub.api.PubnubError;
import com.pubnub.api.PubnubException;

/**
 * Created by amit on 1/8/16.
 */
public class PubnubUtil {
    public static void publish(Pubnub pubnub, String channel_name, String message, final String activity_tag) {
        Callback callback = new Callback() {
            public void successCallback(String channel, Object response) {
                Log.i(activity_tag, response.toString());
            }

            public void errorCallback(String channel, PubnubError error) {
                Log.i(activity_tag, error.toString());
            }
        };
        pubnub.publish(channel_name, message, callback);
    }

    private void subscribe(Pubnub pubnub, String channel_name, final String activity_tag) {
        try {
            pubnub.subscribe(channel_name, new Callback() {

                        @Override
                        public void connectCallback(String channel, Object message) {
                            Log.i(activity_tag, "SUBSCRIBE : CONNECT on channel:" + channel
                                    + " : " + message.getClass() + " : "
                                    + message.toString());
                        }

                        @Override
                        public void disconnectCallback(String channel, Object message) {
                            Log.i(activity_tag, "SUBSCRIBE : DISCONNECT on channel:" + channel
                                    + " : " + message.getClass() + " : "
                                    + message.toString());
                        }

                        public void reconnectCallback(String channel, Object message) {
                            Log.i(activity_tag, "SUBSCRIBE : RECONNECT on channel:" + channel
                                    + " : " + message.getClass() + " : "
                                    + message.toString());
                        }

                        @Override
                        public void successCallback(String channel, Object message) {
                            Log.i(activity_tag, "SUBSCRIBE : " + channel + " : "
                                    + message.getClass() + " : " + message.toString());
                        }

                        @Override
                        public void errorCallback(String channel, PubnubError error) {
                            Log.i(activity_tag, "SUBSCRIBE : ERROR on channel " + channel
                                    + " : " + error.toString());
                        }
                    }
            );
        } catch (PubnubException e) {
            e.printStackTrace();
        }
    }
}
