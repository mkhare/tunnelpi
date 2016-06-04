#include <codec.h>
#include <stdint.h>
#include <string.h>

char *
base64_encode(
    const unsigned char *data,
    size_t input_length,
    size_t *output_length);

unsigned char *
base64_decode(
    const char *data,
    size_t input_length,
    size_t *output_length);


void
start_btmon_display()
{
    int  rc = 0;
    char cmd[256];

    snprintf(cmd, sizeof(cmd), "btmon -r %s 2>&1 &", DST_FILE_PATH);
    printf("cmd generated is %s\n", cmd);
    rc = system(cmd);
    if (rc) {
        printf("opening BT mon resulted error %d\n", rc);
    }
}

int
open_output_file(FILE **p_p_file)
{
    *p_p_file = fopen(DST_FILE_PATH, "w+");

    if ((*p_p_file) == NULL) {
        printf("Error.  Opening the output file\n");
        return -1;
    }
    // start_btmon_display();
    return 0;
}

size_t
put_data_buf(
    char      *p_encoded_data_str)
{
    static FILE     *fp = NULL;
    char            *p_encoded_data;
    char            *p_decoded_data = NULL;
    size_t           decoded_data_len,
                     encoded_data_len = strlen(p_encoded_data_str);
    int              ret;
    size_t           bytesWritten = 0;

    //printf("Encoded data str is %s data len %d\n", p_encoded_data_str, encoded_data_len);

    p_encoded_data = malloc (encoded_data_len - 2);
    memcpy(p_encoded_data, &p_encoded_data_str[1], encoded_data_len - 2);
    // printf("Encoded data %s data len %d\n", p_encoded_data, encoded_data_len - 2);

 
    
    p_decoded_data = (char *) base64_decode (p_encoded_data,
                                             encoded_data_len - 2,
                                             &decoded_data_len); 
    /* printf("decoded len %d data \n %s\n",
           decoded_data_len,
           p_decoded_data); */ 

    if (!fp) {
        ret = open_output_file(&fp);
        if (ret) {
            printf("Opening output file returned error\n");
            return 0;
        }
    }

    if ((bytesWritten = fwrite(p_decoded_data, 1, decoded_data_len, fp)) != decoded_data_len) {
        printf ("Error. Bytes decoded %d  written %d\n", decoded_data_len, bytesWritten);
    }
    fflush(fp);
    
    free (p_decoded_data);

    return bytesWritten;
}
