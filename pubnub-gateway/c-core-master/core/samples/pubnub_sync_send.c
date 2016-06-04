#include "pubnub_sync.h"
#include <unistd.h>
#include <codec.h>
#include <string.h>

void
start_btmon_caputre()
{
    int  rc = 0;
    char cmd[256];

    snprintf(cmd, sizeof(cmd), "btmon -w %s &", SRC_FILE_PATH);
    printf("cmd generated is %s\n", cmd);
    rc = system(cmd);
    if (rc) {
        printf("opening BT mon resulted error %d\n", rc);
    }
}

char *
get_data_buf();

int main()
{
    char           *p_encoded_data;
    // int             encoded_data_len;
    enum pubnub_res pbresult;

    pubnub_t *ctx = pubnub_alloc();
    if (NULL == ctx) {
        puts("Couldn't allocate a Pubnub context");
        return -1;
    }

	char pubkey[] = "pub-c-9e002851-755d-4197-9037-cfe897af871d";
	char subkey[] = "sub-c-82c22366-19a3-11e6-9a17-0619f8945a4f";
	char chnlname[] = "hello_world";
	
	printf("pubnub info\npubkey %s\nsubkey %s\nchnlname %s\n",pubkey, subkey, chnlname);
	fflush(stdout);
	
    pubnub_init(ctx, pubkey, subkey);
    /* Initial Subscribe on the "hello_world" channel */
    pubnub_subscribe(ctx, chnlname, NULL);
    pbresult = pubnub_await(ctx);
    if (pbresult != PNR_OK) {
        printf("Failed to subscribe, error %d\n", pbresult);
        pubnub_free(ctx);
        return -1;
    }

    start_btmon_caputre();
    
    while (1) {
    	fflush(stdout);
        if ((p_encoded_data = get_data_buf()) > 0) {
            // printf ("encoded data %s len %d\n", p_encoded_data, strlen(p_encoded_data));
        
            pubnub_publish(ctx, chnlname, p_encoded_data);
            pbresult = pubnub_await(ctx);
            if (pbresult != PNR_OK) {
                printf("Failed to publish, error %d\n", pbresult);
                pubnub_free(ctx);
                return -1;
            } else {
                if (p_encoded_data) {
                    free(p_encoded_data);
                    p_encoded_data = NULL;
                }
            }
        } else {
            sleep(1);
        }
    }
    
    pubnub_free(ctx);
    return 0;
}

