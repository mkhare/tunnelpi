#include <codec.h>
#include <stdint.h>

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


int
open_input_file(FILE **p_p_file)
{
    *p_p_file = fopen(SRC_FILE_PATH, "r");

    if ((*p_p_file) == NULL) {
        printf("Error.  Opening the file\n");
        return -1;
    }
    return 0;
}

char *
get_data_buf()
{
    static FILE     *fp = NULL;
    char             buf[255];
    size_t           bytesRead = 0;
    size_t           encoded_data_len = 0;
    int              ret;
    char             *encoded_data = NULL, *string_encoded_data = NULL;
    

    if (!fp) {
        ret = open_input_file(&fp);
        if (ret) {
            printf("Opening input file returned error\n");
            return 0;
        }
    }

    if ((bytesRead = fread(buf, 1, sizeof(buf), fp)) > 0) {

        // printf ("Raw data %s bytesRead %d\n", buf, bytesRead);
    
        encoded_data = base64_encode((const unsigned char *) buf,
                                     bytesRead,
                                     &encoded_data_len);
        // printf("coded len %d data %s\n", encoded_data_len, encoded_data);

        string_encoded_data = malloc (encoded_data_len + 3);

        string_encoded_data[0] = '\"';     
        memcpy(&string_encoded_data[1], encoded_data, encoded_data_len);
        string_encoded_data[encoded_data_len + 1] = '\"';     
        string_encoded_data[encoded_data_len + 2] = '\0';

        free(encoded_data);
        //printf("String coded len %d data %s\n", encoded_data_len + 3, string_encoded_data);

    } else {
        // printf("bytesRead from file is 0\n");
    }
    return string_encoded_data;
}
