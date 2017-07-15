const cas = require('connect-cas');
const ConnectCas = require('connect-cas2');


cas.configure({ 'host': 'login.iiit.ac.in/cas', 'protocol': 'https',
paths: {
        validate: '/validate',
        serviceValidate: '/serviceValidate', // CAS 3.0
        proxyValidate: '/proxyValidate', // CAS 3.0
        proxy: '/proxy',
        login: '/login',
        logout: '/logout'
    }
});



var casClient = new ConnectCas({

    ignore: [
      /\/ignore/
    ],
    match: [],
    servicePrefix: 'http://localhost:3000',
    serverPath: 'https://login.iiit.ac.in/cas',
    paths: {
      
      serviceValidate: '/serviceValidate',
      proxy: '/proxy',
      login: '/login',
      logout: '/logout',
      proxyCallback: '/proxyCallback',
      restletIntegration: ''
    },
    redirect: false,
    gateway: false,
    renew: false,
    slo: true,
    cache: {
      enable: false,
      ttl: 5 * 60 * 1000,
      filter: []
    },
    fromAjax: {
      header: 'x-client-ajax',
      status: 418
    }
});
module.exports = {cas,casClient};
