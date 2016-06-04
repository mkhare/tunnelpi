#include "pubnub_sync.h"
#include <stdio.h>
int main()
{
    enum pubnub_res pbresult;
    pubnub_t *ctx = pubnub_alloc();
    if (NULL == ctx) {
        puts("Couldn't allocate a Pubnub context");
        return -1;
    }
    pubnub_init(ctx, "demo", "demo");
    /* Initial Subscribe on the "hello_world" channel */
    pubnub_subscribe(ctx, "hello_world", NULL);
    pbresult = pubnub_await(ctx);
    if (pbresult != PNR_OK) {
        printf("Failed to subscribe, error %d\n", pbresult);
        pubnub_free(ctx);
        return -1;
    }
    pubnub_publish(ctx, "hello_world", "\"Hi Srini...Hello from Pubnub C-core docs!\"");
    pbresult = pubnub_await(ctx);
    if (pbresult != PNR_OK) {
        printf("Failed to publish, error %d\n", pbresult);
        pubnub_free(ctx);
        return -1;
    }
    /* This Subscribe should fetch the message from above */
    pubnub_subscribe(ctx, "hello_world", NULL);
    pbresult = pubnub_await(ctx);
    if (pbresult != PNR_OK) {
        printf("Failed to subscribe, error %d\n", pbresult);
        pubnub_free(ctx);
        return -1;
    }
    else {
        char const *msg = pubnub_get(ctx);
        while (msg != NULL) {
            printf("Got message: %s\n", msg);
            msg = pubnub_get(ctx);
        }
    }
    pubnub_free(ctx);
    return 0;
}

