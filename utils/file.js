export const extractResponseFromBlob = (blob) => {
  return new Promise((resolve) => {
    let response = null;

    if (blob.type && !blob.type.includes('octet-stream')) {
      const reader = new FileReader();
      reader.onload = function () {
        const { result } = reader;
        try {
          response = JSON.parse(result);
        } catch (error) {
          // DO Nothing
          console.error(error);
          response = result;
        }

        resolve(response);
      };
      reader.readAsText(blob);
    }
  });
};
