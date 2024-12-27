const { createProxyMiddleware } = require("http-proxy-middleware");
const { env } = require("process");

const target = env.ASPNETCORE_HTTPS_PORT
  ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
  : env.ASPNETCORE_URLS
  ? env.ASPNETCORE_URLS.split(";")[0]
  : "http://localhost:44454";

// Include all API endpoints
const context = ["/api"];

module.exports = function (app) {
  const appProxy = createProxyMiddleware(context, {
    target: target,
    secure: false,
    changeOrigin: true,
    headers: {
      Connection: "Keep-Alive",
    },
    onProxyReq: function (proxyReq, req, res) {
      // Log proxy requests for debugging
      console.log("Proxying:", req.method, req.url, "to", target + req.url);
    },
    onError: function (err, req, res) {
      console.error("Proxy Error:", err);
    },
  });

  app.use(appProxy);
};
