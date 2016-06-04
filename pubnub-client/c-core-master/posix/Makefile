SOURCEFILES = ../core/pubnub_coreapi.c ../core/pubnub_ccore.c ../core/pubnub_netcore.c  ../lib/sockets/pbpal_sockets.c ../lib/sockets/pbpal_resolv_and_connect_sockets.c ../core/pubnub_alloc_std.c ../core/pubnub_assert_std.c ../core/pubnub_generate_uuid.c ../core/pubnub_blocking_io.c ../core/pubnub_timers.c ../core/pubnub_json_parse.c ../core/pubnub_helper.c  pubnub_version_posix.c  pubnub_generate_uuid_posix.c pbpal_posix_blocking_io.c

OS := $(shell uname)
ifeq ($(OS),Darwin)
SOURCEFILES += monotonic_clock_get_time_darwin.c
else
SOURCEFILES += monotonic_clock_get_time_posix.c
endif

SOURCEFILES += ../core/samples/encode.c ../core/samples/decode.c ../core/samples/codec.c


CFLAGS =-g -I ../core -I . -I fntest -I ../core/fntest -Wall -D PUBNUB_THREADSAFE
# -g enables debugging, remove to get a smaller executable
# -fsanitize=address Use AddressSanitizer

LDLIBS =-lrt

all: pubnub_client pubnub_gateway


pubnub_client: ../core/samples/pubnub_sync_send.c $(SOURCEFILES) ../core/pubnub_ntf_sync.c
	$(CC) -o $@ $(CFLAGS) -D VERBOSE_DEBUG ../core/samples/pubnub_sync_send.c ../core/pubnub_ntf_sync.c $(SOURCEFILES) $(LDLIBS)

pubnub_gateway: ../core/samples/pubnub_sync_recieve.c $(SOURCEFILES) ../core/pubnub_ntf_sync.c
	$(CC) -o $@ $(CFLAGS) -D VERBOSE_DEBUG ../core/samples/pubnub_sync_recieve.c ../core/pubnub_ntf_sync.c $(SOURCEFILES) $(LDLIBS)

clean:
	rm pubnub_client pubnub_gateway
