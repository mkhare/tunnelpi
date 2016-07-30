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

public class WisperoGWPreferences {

    //sharedPreferences
    public static final String REGISTRATION_TOKEN_FOR_GCM = "registrationTokenForGCM";
    public static final String SENT_TOKEN_TO_SERVER = "sentTokenToServer";
    public static final String BT_DATA_PUBLISH_CHANNEL = "bluetoothDataPublishChannel";
    public static final String BT_DEVICE_ADDRESS = "bluetoothDeviceAddress";

    //intent-filters
    public static final String REGISTRATION_COMPLETE = "registrationComplete";
    public static final String BT_DATA_PUBLISHED = "bluetoothDataPublishedOnPubnub";
    public static final String GCM_MESSAGE_RECEIVED = "pubnubMessageReceivedFromGCM";

    //hard-coded data
    public static final String DEFAULT_BT_ADDRESS = "00:1A:7D:DA:71:13";
    public static final String DEFAULT_PN_PUBLISH_CHANNEL = "hello";
}
