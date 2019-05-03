## Participation piggy bank app

Ionic 4 application to be used in the app as "embedded app"

## Setup

- `npm install` in this folder
- `npm start` to start developing
- `npm run build` to build 


For local testing in the browser, add this to index.html:

```html
<script>
  (function () {
    if (window.location.port === '8100') {
      function nothing() {
      }

      var context = null;

      rogerthat = {
        context: func => func({context}),
        api: {
          call: nothing,
          callbacks: {
            resultReceived: nothing,
          }
        },
        callbacks: {
          ready: function (callback) {
            this._ready = callback;
          },
          serviceDataUpdated: nothing,
          userDataUpdated: nothing,
          qrCodeScanned: nothing,
        },
        user: {
          language: 'en',
          account: 'test@example.com',
          data: {},
        },
        system: {
          appId: 'rogerthat',
          appVersion: '0.0.0'
        },
        service: {
          data: {}
        },
        menuItem: null,
        util: {
          uuid: () => Math.random().toString()
        }
      };
      setTimeout(() => rogerthat.callbacks._ready(), 250);
    }
  })();
</script>
```
