#include "pubnub_sync.h"
#include <stdint.h>
#include <codec.h>

size_t
put_data_buf(
    const char      *p_encoded_data);



int main()
{
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

    pubnub_subscribe(ctx, chnlname, NULL);
    pbresult = pubnub_await(ctx);
    if (pbresult != PNR_OK) {
        printf("Failed to subscribe, error %d\n", pbresult);
        pubnub_free(ctx);
        return -1;
    }

    while (1) {
    	fflush(stdout);
        pubnub_subscribe(ctx, chnlname, NULL);
        pbresult = pubnub_await(ctx);
        if (pbresult != PNR_OK) {
            printf("Failed to subscribe, error %d\n", pbresult);
            pubnub_free(ctx);
            return -1;
        }
        else {
            char const *msg = pubnub_get(ctx);
            while (msg != NULL) {
                
                // printf("Got message: %s\n", msg);
                put_data_buf(msg);
                msg = pubnub_get(ctx);
                // printf("Got message2: %s\n", msg);
            }
        }
    }
    pubnub_free(ctx);
    return 0;
}

