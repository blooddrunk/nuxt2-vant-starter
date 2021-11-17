import { saveAs } from 'file-saver';

import { extractResponseFromBlob } from '@/utils/file';

const normalizeFields = (field) => {
  if (!Array.isArray(field)) {
    field = [field];
  }

  return field.reduce((data, fieldName) => {
    data[`${fieldName}Pending`] = false;
    data[`${fieldName}Error`] = null;
    return data;
  }, {});
};

export default ({ field = 'download', mimeType = 'application/vnd.ms-excel;charset=utf-8' } = {}) => ({
  data: () => normalizeFields(field),

  methods: {
    async downloadFile({ fileName, ...config } = {}, fieldName = 'download') {
      try {
        if (!config) {
          throw new Error('config missing');
        }

        this[`${fieldName}Pending`] = true;

        const { headers, data } = await this.$axios(
          Object.assign(
            {
              method: 'post',
              responseType: 'blob',
              __needValidation: false,
              transformData: false,
              // headers: {
              //   Accept: 'application/vnd.ms-excel',
              // },
            },
            config
          )
        );

        this[`${fieldName}Pending`] = false;

        const contentType = headers['content-type'];
        if (/application\/json/.test(contentType)) {
          const { code, message } = await extractResponseFromBlob(data);
          if (`${code}` === '401') {
            if (!this.$store.state.auth.hasForcedOut) {
              this.$notify.warning({
                title: '提醒',
                message: '会话已过期，请重新登录',
              });
              this.$store.commit('auth/forceLogout', true);
              this.$router.push({
                name: 'sign-in',
                query: {
                  from: this.$route.name,
                  ...this.$route.query,
                },
              });
            }
          } else {
            this.$message.error(message);
          }

          return;
        }

        if (!data) {
          this.$message.warning('没有数据可供导出');
        } else {
          const disposition = headers['content-disposition'];
          let file = fileName;
          if (!file) {
            try {
              file = decodeURI(disposition.match(/filename=(.*)/)[1]);
            } catch (error) {
              throw new Error('无法确定文件类型');
            }
          }

          saveAs(
            new Blob([data], {
              type: contentType || mimeType,
            }),
            file
          );
        }
      } catch (error) {
        console.error(error);
        this[`${fieldName}Pending`] = false;
        this[[`${fieldName}Error`]] = error;
        this.$message.error('下载失败，请稍后再试');
      }
    },
  },
});
