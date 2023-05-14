export default () => ({
  app_port: process.env.APP_PORT ?? 4004,
  service: "ffc-notifications-service",
  issuer: process.env.ISSUER ?? "http://10.102.1.45:4003",
  authorizedServices: [
    "ffc-analytics-service",
    "ffc-auth-service",
    "ffc-main-service",
    "ffc-notifications-service",
    "ffc-payments-service",
  ],
  ffc_analytics_url: process.env.FFC_ANALYTICS_URL ?? "http://localhost:4001",
  ffc_auth_url: process.env.FFC_AUTH_URL ?? "http://10.102.3.34:4002",
  ffc_main_url: process.env.FFC_MAIN_URL ?? "http://api.ffc.mistergooddeal.org",
  ffc_notifications_url:
    process.env.FFC_NOTIFICATIONS_URL ?? "http://10.102.1.45:4003",
  ffc_payments_url: process.env.FFC_PAYMENTS_URL ?? "http://10.102.3.226:4004",
});
