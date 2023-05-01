export default () => ({
  app_port: 4004 ?? process.env.APP_PORT,
  service: "ffc-payments-service",
  issuer: "http://localhost:4004" ?? process.env.ISSUER,
  authorizedServices: ["ffc-analytics-service", "ffc-auth-service", "ffc-main-service", "ffc-notifications-service", "ffc-payments-service"],
  ffc_analytics_url: "http://localhost:4001" ?? process.env.FFC_ANALYTICS_URL,
  ffc_auth_url: "http://localhost:4002" ?? process.env.FFC_AUTH_URL,
  ffc_main_url: "http://localhost:4000" ?? process.env.FFC_MAIN_URL,
  ffc_notifications_url: "http://localhost:4003" ?? process.env.FFC_NOTIFICATIONS_URL,
  ffc_payments_url: "http://localhost:4004" ?? process.env.FFC_PAYMENTS_URL,
});