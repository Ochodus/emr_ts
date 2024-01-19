const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', //proxy가 필요한 path parameter
    createProxyMiddleware({ 
      target: 'http://59.22.4.18:2201', //타겟이 되는 api url
      changeOrigin: true, // 서버 구성에 따른 호스트 헤더 변경 여부 설정
    })
  );
  app.use( 
    '/custom/v1/25705/fbe7d4dadf6a508241cbfea087073df50d1c6ae735b81dd9ff85b327572db2d6/infer', //proxy가 필요한 path parameter
    createProxyMiddleware({
      target: 'https://6n1q18xmim.apigw.ntruss.com', //타겟이 되는 api url
      changeOrigin: true, // 서버 구성에 따른 호스트 헤더 변경 여부 설정
    })
  );
};