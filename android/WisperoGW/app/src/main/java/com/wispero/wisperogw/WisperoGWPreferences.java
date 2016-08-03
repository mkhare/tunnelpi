/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.wispero.wisperogw;

import com.pubnub.api.Pubnub;

public class WisperoGWPreferences {

    //sharedPreferences
    public static final String REGISTRATION_TOKEN_FOR_GCM = "registrationTokenForGCM";
    public static final String SENT_TOKEN_TO_SERVER = "sentTokenToServer";
    public static final String BT_DATA_PUBLISH_CHANNEL = "bluetoothDataPublishChannel";
    public static final String BT_DEVICE_ADDRESS = "bluetoothDeviceAddress";
    public static final String SPREF_USER_EMAIL = "";

    //intent-filters
    public static final String REGISTRATION_COMPLETE = "registrationComplete";
    public static final String BT_DATA_PUBLISHED = "bluetoothDataPublishedOnPubnub";
    public static final String GCM_MESSAGE_RECEIVED = "pubnubMessageReceivedFromGCM";

    //hard-coded data
    public static final String PN_SUBSCRIBE_KEY = "sub-c-c90fa6ea-38a2-11e6-bbf4-0619f8945a4f";
    public static final String PN_PUBLISH_KEY = "pub-c-b032ad96-906e-4a98-94b9-4b5e76ccd4e2";
    public static final Pubnub pubnub = new Pubnub(PN_PUBLISH_KEY, PN_SUBSCRIBE_KEY);
    public static final Pubnub PUBNUB = new Pubnub(PN_PUBLISH_KEY, PN_SUBSCRIBE_KEY);
    public static final String SERVER_URL = "http://3947e72a.ngrok.io";
    public static final String DEFAULT_BT_ADDRESS = "00:1A:7D:DA:71:13";
    public static final String DEFAULT_PN_PUBLISH_CHANNEL = "hello";
}
